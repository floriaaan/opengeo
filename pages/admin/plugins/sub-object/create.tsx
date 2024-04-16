import { RoleGuard } from "@/hooks/useHabilitation";
import { SubObjectCreate } from "@components/admin/sub-object/create";
import { SubObjectLayout } from "@components/admin/sub-object/layout";
import { HeadTitle } from "@components/helpers/head/title";
import { AdminLayout } from "@components/layouts/admin";

/**
 * A React component that renders the sub-object management page for the application.
 *
 * @remarks The component uses the `getAllSubObject` function from the `subObject` module to retrieve the sub-object data from the server. The component renders a `SubObjectLayout` component with the `subObjects` array as its prop, and a `SubObjectCreate` component as its child. The `SubObjectCreate` component is responsible for rendering the form for creating a new sub-object. The `AdminLayout` component is used to provide a layout for the page.
 *
 * @param subObjects - An array of `GenericObject`s representing the sub-objects to display in the sub-object layout.
 *
 * @returns A React component that renders the sub-object management page for the application.
 */
const GestionSubObjectCreatePage = () => {
  return (
    <RoleGuard level={100}>
      <HeadTitle title="Créer un sous-objet" />
      <AdminLayout>
        <SubObjectLayout>
          <SubObjectCreate />
        </SubObjectLayout>
      </AdminLayout>
    </RoleGuard>
  );
};

export default GestionSubObjectCreatePage;
