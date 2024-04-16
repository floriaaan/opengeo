import { ErrorPage } from "@components/helpers/error/page";
import { useRouter } from "next/router";

export const UnauthorizedError = () => {
  const { asPath } = useRouter();
  return (
    <ErrorPage
      {...{
        asPath,
        http: "",
        message: "Vous n'êtes pas autorisé à accéder à cette page.",
        description: "Vous pouvez faire une demande d'habilitation via le formulaire disponible en bas de page.",
      }}
    />
  );
};
