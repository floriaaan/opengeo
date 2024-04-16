import { ErrorPage } from "@components/helpers/error/page";
import { useRouter } from "next/router";

/**
 * A React component that renders the 404 error page.
 *
 * @remarks The component renders a simple heading with the text "ERROR 404".
 *
 * @returns A React component that renders the 404 error page.
 */
export default function E404Page() {
  const { query, asPath, push } = useRouter();
  const { http, message, description } = query;

  if (
    asPath === "/_error" ||
    asPath === "/404" ||
    asPath.includes("from=") ||
    asPath.includes("http=") ||
    asPath.includes("message=")
  )
    return (
      <ErrorPage http={Number(http)} message={message as string} description={description as string} asPath={asPath} />
    );
  push(
    `/_error?${Object.entries({
      from: asPath,
      http: query.http || 404,
      message:
        query.message || asPath.includes("/upload")
          ? `Le fichier ${asPath.replace("/upload/", "")} n'existe pas`
          : `La page ${asPath} n'existe pas`,
      description: query.description || `Merci de vérifier l'URL ou de contacter un administrateur`,
    })
      .map(([key, value]) => `${key}=${value}`)
      .filter(Boolean)
      .join("&")}`,
  );
}
