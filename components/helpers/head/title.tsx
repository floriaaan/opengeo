import Head from "next/head";
import { useRouter } from "next/router";

type Props = {
  title: string;
  disableTemplate?: boolean;
};

export const HeadTitle = ({ title, disableTemplate = false }: Props) => {
  const { asPath } = useRouter();

  if (process.env.NEXT_PUBLIC_LOCAL === "true")
    return (
      <Head>
        <title>(l) opengeo{asPath}</title>
      </Head>
    );

  if (process.env.NEXT_PUBLIC_DEV === "true")
    return (
      <Head>
        <title>(d) opengeo{asPath}</title>
      </Head>
    );

  return (
    <Head>
      <title>{disableTemplate ? title : `${title} | OpenGeo`}</title>
    </Head>
  );
};
