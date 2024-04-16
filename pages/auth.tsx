import { HeadTitle } from "@components/helpers/head/title";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Auth() {
  const { push } = useRouter();

  useEffect(() => {
    const origin = localStorage.getItem("origin") || "/";
    push(origin);
  }, [push]);

  return <HeadTitle title="Authentification..." />;
}
