import { useAuth } from "@/hooks/useAuth";
import { useFetch } from "@/hooks/useFetch";
import { RoleGuard } from "@/hooks/useHabilitation";
import { sortByName } from "@/lib/models/generic-object";
import { getEntityFromContact } from "@/lib/user";
import { APIResult } from "@/types/api";
import { GenericObject } from "@/types/generic-object";
import { GenericObjectLayout, GenericObjectUpdate } from "@components/admin/generic-object";
import { ErrorPage } from "@components/helpers/error/page";
import { HeadTitle } from "@components/helpers/head/title";
import { AdminLayout } from "@components/layouts/admin";
import { LargeLoader } from "@components/ui/loader/large";
import { useRouter } from "next/router";
import { useMemo } from "react";

/**
 * A React component that renders the object management page for the application.
 *
 * @remarks The component uses the `getOneObjectWithId` function from the `object` module to retrieve the object data from the server. The component renders a `GenericObjectLayout` component with the `objects` array as its prop, and an `ObjectUpdate` component as its child. The `ObjectUpdate` component is responsible for rendering the form for updating the object data. The `AdminLayout` component is used to provide a layout for the page.
 *
 * @param objects - An array of `GenericObject`s representing the objects to display in the object layout.
 * @param object - A `GenericObject` representing the object to display in the object update form.
 *
 * @returns A React component that renders the object management page for the application.
 */
const GenericObjectPage = () => {
  const { user } = useAuth();
  const entity = useMemo(() => getEntityFromContact(user), [user]);

  const { query } = useRouter();
  const { data: api, loading } = useFetch<APIResult<GenericObject[]>>(`/api/generic-object/get?entity=${entity}`);
  const objects = useMemo(() => api?.data?.sort(sortByName) || [], [api]);
  const object = objects.find((o) => o._id === query._id);

  if (!object) return <LargeLoader />;
  if (!object && !loading) return <ErrorPage http={404} message="Cet objet n'existe pas." />;

  return (
    <RoleGuard level={100} entity={object.metadata.entity}>
      <HeadTitle
        title={`Modifier l'objet ${(object.values.find((v) => v.label === "Nom")?.value as string) || query._id}`}
      />
      <AdminLayout>
        {!loading ? (
          <GenericObjectLayout objects={objects}>
            <GenericObjectUpdate data={object} />
          </GenericObjectLayout>
        ) : null}
      </AdminLayout>
    </RoleGuard>
  );
};

export default GenericObjectPage;
