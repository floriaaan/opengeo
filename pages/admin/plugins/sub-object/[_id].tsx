import { RoleGuard } from "@/hooks/useHabilitation";
import { SubObjectLayout, SubObjectUpdate, useSubObjects } from "@components/admin/sub-object";
import { ErrorPage } from "@components/helpers/error/page";
import { HeadTitle } from "@components/helpers/head/title";
import { AdminLayout } from "@components/layouts/admin";
import { LargeLoader } from "@components/ui/loader/large";
import { useRouter } from "next/router";

/**
 * A React component that renders the sub-object management page for the application.
 *
 * @remarks The component uses the `getAllSubObject` and `getOneSubObjectWithId` functions to retrieve the sub-object data from the server. The component renders a `SubObjectLayout` component with the `subObjects` array as its prop, and a `SubObjectUpdate` component as its child. The `SubObjectUpdate` component is responsible for rendering the form for updating the sub-object data. The `AdminLayout` component is used to provide a layout for the page.
 *
 * @param subObjects - An array of `GenericObject`s representing the sub-objects to display in the sub-object layout.
 * @param subObject - A `GenericObject` representing the sub-object to display in the sub-object update form.
 *
 * @returns A React component that renders the sub-object management page for the application.
 */
const SubObjectUpdatePage = () => {
  return (
    <RoleGuard level={100}>
      <AdminLayout>
        <SubObjectLayout>
          <SubObjectUpdateComponent />
        </SubObjectLayout>
      </AdminLayout>
    </RoleGuard>
  );
};

export default SubObjectUpdatePage;

const SubObjectUpdateComponent = () => {
  const { query } = useRouter();
  const { subObjects, loading } = useSubObjects();
  const subObject = subObjects.find((s) => s._id === query._id);

  if (!subObject) return <LargeLoader />;
  if (!subObject && !loading) return <ErrorPage http={404} message="Ce sous-objet n'existe pas." />;

  return (
    <RoleGuard level={100} entity={subObject.metadata.entity}>
      <HeadTitle
        title={`Modifier le sous-objet ${
          (subObject.values.find((v) => v.label === "Nom")?.value as string) || query._id
        }`}
      />
      <SubObjectUpdate {...subObject}></SubObjectUpdate>
    </RoleGuard>
  );
};
