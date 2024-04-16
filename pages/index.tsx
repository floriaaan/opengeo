import { useFetch } from "@/hooks/useFetch";
import { useLazyLoading } from "@/hooks/useLazyLoading";
import { getAllObjects } from "@/lib/fetchers/generic-object";
import { CartographieApp } from "@components/map";
import { NextPage } from "next";

import { VersionAlert } from "@components/helpers/changelog/version-alert";
import { HeadTitle } from "@components/helpers/head/title";

/**
 * A React component that renders the home page of the application.
 *
 * @remarks The component takes a `sites` prop, which is an array of `GenericObject`s representing the sites to display on the map. The component renders a `CartographieProvider` component with the `sites` array as its `initialSites` prop, and a `CartoApp` component as its child. The `CartoApp` component is responsible for rendering the map and site details.
 *
 * @param sites - An array of `GenericObject`s representing the sites to display on the map.
 *
 * @returns A React component that renders the home page of the application.
 */
const Home: NextPage = () => {
  const { data: sites } = useLazyLoading([], getAllObjects);
  useFetch("/api/logs/rgpd");

  return (
    <>
      <HeadTitle title="Accueil" />
      <CartographieApp sites={sites} />
      <VersionAlert />
    </>
  );
};

export default Home;
