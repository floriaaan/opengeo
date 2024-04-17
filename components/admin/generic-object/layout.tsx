import { GenericObject } from "@/types/generic-object";
import { Sidebar } from "@components/layouts/admin/sidebar";
import { ListIcon, PlusIcon } from "lucide-react";
import { ReactNode } from "react";

/**
 * A React component that renders a layout for displaying a list of generic objects and a sidebar for navigation.
 *
 * @remarks The component uses the `GenericObject` type from the `types` module to represent the generic object data. The component includes a sidebar for navigation with links to create a new object and view existing objects. The component is used in the `GestionObjetList` component for displaying a list of generic objects.
 *
 * @param children - The child components to be rendered within the layout.
 * @param objects - An array of objects representing the generic objects to be displayed in the sidebar.
 *
 * @returns A React component that renders a layout for displaying a list of generic objects and a sidebar for navigation.
 */
export const GenericObjectLayout = ({ children, objects }: { children: ReactNode; objects: GenericObject[] }) => {
  return (
    <div className="flex flex-row w-full h-full">
      <Sidebar
        type="secondary"
        navigation={[
          {
            label: "Général",
            value: [
              {
                name: "Liste des objets",
                url: "/admin/plugins/generic-object",
                icon: <ListIcon className="w-4 h-4 shrink-0" />,
              },
              {
                name: "Créer un nouvel objet",
                url: "/admin/plugins/generic-object/create",
                icon: <PlusIcon className="w-4 h-4 shrink-0" />,
              },
            ],
          },
          // {
          //   label: "Sites",
          //   value: objects.map((e) => ({
          //     name: (e.values.find((v) => v.label === "Nom")?.value as string) || "",
          //     url: `/admin/plugins/generic-object/${e._id}`,
          //     icon: (
          //       <span className="w-5 -ml-1 text-xs font-bold leading-none text-center shrink-0 text-opengeo">
          //         {(e.values.find((v) => v.label === "Label")?.value as string)?.slice(0, 3) || "??"}
          //       </span>
          //     ),
          //   })),
          // },
          ...Object.entries(
            objects.reduce(
              (acc, cur) => {
                // group by metadata.label
                const group = acc[cur.metadata.label] || [];
                group.push(cur);
                acc[cur.metadata.label] = group;
                return acc;
              },
              {} as Record<string, GenericObject[]>,
            ),
          ).map(([key, value]) => ({
            label: key,
            value: value.map((e) => ({
              name: (e.values.find((v) => v.label === "Nom")?.value as string) || "",
              url: `/admin/plugins/generic-object/${e._id}`,
              icon: (
                <span className="w-5 -ml-1 text-xs font-bold leading-none text-center shrink-0 text-opengeo">
                  {(e.values.find((v) => v.label === "Label")?.value as string)?.slice(0, 3) || "??"}
                </span>
              ),
            })),
          })),
        ]}
      ></Sidebar>
      <div className="w-full  max-h-[calc(100vh-4rem-3rem)] h-full overflow-x-hidden pb-12 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};
