/* eslint-disable no-console */
import { HOST_URL, fetcher } from "@/lib/fetchers";
import { log, utils } from "@/lib/log";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const EXCEPTIONS = [
  "_next/",
  "__nextjs_original-stack-frame",
  "font/",
  "sw.js",
  ".svg",
  "favicon.svg",
  "robots.txt",
  "sitemap.xml",
  "manifest.json",
  "/icons/",

  "/api/logs/create",
  "/api/logs/get",
  "/api/user/notification",
  "/api/changelog",
  "revalidate=",
];

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { url: raw_url, method } = request;

  // Variable to know if the request is from server or client
  const isServer = typeof window === "undefined";

  // Remove the protocol and domain from the URL
  const path = "/" + raw_url.split("//")[1].split("/").slice(1).join("/");

  if (!EXCEPTIONS.some((e) => path.includes(e)) && !(isServer && path === "/")) {
    const { value: user_string } = request.cookies.get("opengeo-user") || {};
    const userCookies = user_string ? JSON.parse(user_string) : null;

    const { id, cn } = userCookies || { id: "?", cn: "Inconnu" };

    // Log the request to the console
    // console.log([new Date().toISOString(), method, path].map((s) => s || "undefined").join("\t"));
    log.debug(
      `${utils.bold(utils.yellow(new Date().toISOString()))}\t ${utils.bold(
        method === "GET" ? utils.green(method) : utils.red(method),
      )}\t ${utils.bold(utils.blue(path))}`,
    );

    // Log the request to the database

    try {
      if (method && path && (id || isServer))
        await fetcher(`${HOST_URL}/api/logs/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method,
            path,
            user: id ? { id, cn } : { id: "Server", cn: "Server-side request" },
          }),
        });
    } catch (error) {
      console.error((error as Error).message);
    }
  }

  return NextResponse.next();
}
