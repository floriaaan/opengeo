import { RoleGuard } from "@/hooks/useHabilitation";
import { getAllObjectsWithEntity } from "@/lib/fetchers/generic-object";
import { sortByName } from "@/lib/models/generic-object";
import { GenericObject } from "@/types/generic-object";
import { GenericObjectCreate } from "@components/admin/generic-object/create";
import { GenericObjectLayout } from "@components/admin/generic-object/layout";
import { HeadTitle } from "@components/helpers/head/title";
import { AdminLayout } from "@components/layouts/admin";
import { GetServerSideProps, GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";

/**
 * A Next.js `getServerSideProps` function that retrieves the object data from the server and passes it as props to the page component.
 *
 * @remarks The function uses the `getAllObjectsWithEntity` function from the `object` module to retrieve the object data from the server. The function retrieves the user data from the request cookies. The function returns an object with the `objects` data as props for the page component.
 *
 * @param context - The context object for the server-side rendering request.
 *
 * @returns An object with the `objects` data as props for the page component.
 */
export const getServerSideProps: GetServerSideProps = async (context: GetServerSidePropsContext) => {
  const entity = context.req.cookies["opengeo-entity"];

  if (!entity) return { props: { objects: [], entity: undefined } };

  const objects = (await getAllObjectsWithEntity(entity))?.sort(sortByName);
  return { props: { objects, entity } };
};

/**
 * A React component that renders the object creation page for the application.
 *
 * @remarks The component renders a `GenericObjectLayout` component with the `objects` array as its prop, and a `GenericObjectCreate` component as its child. The `GenericObjectCreate` component is responsible for rendering the form for creating a new object. The `AdminLayout` component is used to provide a layout for the page.
 *
 * @param objects - An array of `GenericObject`s representing the objects to display in the object layout.
 *
 * @returns A React component that renders the object creation page for the application.
 */
const GenericObjectCreatePage: NextPage<{ objects: GenericObject[]; entity?: string }> = ({ objects, entity }) => {
  return (
    <RoleGuard level={100}>
      <HeadTitle title={`Créer un objet (${entity || "entité inconnue"})`} />
      <Head>
        <title>Créer un objet ({entity || "entité inconnue"}) - OpenGeo</title>
      </Head>
      <AdminLayout>
        <GenericObjectLayout objects={objects}>
          <GenericObjectCreate />
        </GenericObjectLayout>
      </AdminLayout>
    </RoleGuard>
  );
};

export default GenericObjectCreatePage;
