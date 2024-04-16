"use client";

import { HeadTitle } from "@components/helpers/head/title";
import { Button } from "@components/ui/button";
import { ArrowLeftIcon, EnvelopeClosedIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/router";
import packageInfo from "package.json";
const { author, email } = packageInfo;

export const ErrorPage = ({
  http,
  message,
  description,
  asPath,
}: {
  http: number | string;
  message: string;
  description?: string;
  asPath?: string;
}) => {
  const { back, asPath: router_AsPath } = useRouter();
  return (
    <>
      <HeadTitle title="Erreur" />
      <div suppressHydrationWarning className="flex flex-col items-center justify-center h-full px-6 py-12 bg-white">
        <div className="container mx-auto xl:max-w-[75vw] lg:flex lg:items-center lg:gap-12">
          <div className="w-full lg:w-1/2">
            <p className="text-sm font-medium text-opengeo ">Erreur {http}</p>
            <h1 className="text-2xl font-bold text-gray-800 font-title md:text-2xl">{message}</h1>
            <p className="mt-1 text-xs text-gray-500">{description}</p>
            <div className="flex flex-wrap items-center gap-3 mt-6 md:flex-nowrap lg:flex-wrap xl:flex-nowrap">
              <Button variant="outline" onClick={back} className="sm:w-full w-fit md:w-full font-title">
                <ArrowLeftIcon className="w-4 h-4 shrink-0" />
                <span>Retour</span>
              </Button>
              <Button asChild className="sm:w-full w-fit md:w-full font-title">
                <a
                  suppressHydrationWarning
                  href={`mailto:${email}?subject=%5BOpenGeo%5D%20-%20Bug%20rencontr%C3%A9%20&body=${encodeURIComponent(
                    "\n\n\n" + JSON.stringify({ title: message, asPath: asPath || router_AsPath }, undefined, 2),
                  )}`}
                  className="justify-center"
                >
                  <EnvelopeClosedIcon className="w-4 h-4 shrink-0" />
                  <span>Contacter le {author}</span>
                </a>
              </Button>
            </div>
          </div>
          <div className="relative w-full mt-12 lg:w-1/2 lg:mt-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-full max-w-lg lg:mx-auto" src="/404.svg" alt="404" />
          </div>
        </div>
      </div>
    </>
  );
};
