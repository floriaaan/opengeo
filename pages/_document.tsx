import Document, { DocumentContext, Head, Html, Main, NextScript } from "next/document";

class OpenGeoDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="fr">
        <Head>
          <meta
            name="application-name"
            content={
              process.env.NEXT_PUBLIC_DEV === "true" || process.env.NEXT_PUBLIC_LOCAL === "true"
                ? "OpenGeo"
                : "(dev) opengeo"
            }
          />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="OpenGeo" />
          <meta name="description" content="OpenGeo" />
          <meta name="format-detection" content="telephone=no" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#000000" />

          <link rel="apple-touch-icon" href="/icons/256.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icons/152.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icons/180.png" />
          <link rel="apple-touch-icon" sizes="167x167" href="/icons/167.png" />

          <link rel="icon" type="image/png" sizes="256x256" href="/icons/opengeo-web.png" />
          {/* <link rel="icon" type="image/png" sizes="32x32" href="/icons/32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/icons/16.png" /> */}
          <link rel="manifest" href="/manifest.json" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default OpenGeoDocument;
