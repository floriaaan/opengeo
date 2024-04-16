import { ErrorPage } from "@/components/helpers/error/page";

export default function Offline() {
  return (
    <ErrorPage
      http={""}
      message={"Vous êtes hors ligne"}
      description={"Veuillez vérifier votre connexion internet et réessayer."}
    />
  );
}
