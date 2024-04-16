import { ErrorPage } from "@components/helpers/error/page";
import { useRouter } from "next/router";

export default function Error() {
  const { query, asPath } = useRouter();
  const { http, message, description } = query;
  return (
    <ErrorPage http={Number(http)} message={message as string} description={description as string} asPath={asPath} />
  );
}
