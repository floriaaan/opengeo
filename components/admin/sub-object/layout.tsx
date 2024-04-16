import { useAuth } from "@/hooks/useAuth";
import { useFetch } from "@/hooks/useFetch";
import { getLabel, sortByName } from "@/lib/models/sub-object";
import { getEntityFromContact } from "@/lib/user";
import { cn } from "@/lib/utils";
import { SubObjectType } from "@/models";
import { APIResult } from "@/types/api";
import { Sidebar } from "@components/layouts/admin/sidebar";
import { ListBulletIcon, PlusIcon } from "@radix-ui/react-icons";
import { ReactNode, createContext, useContext, useMemo } from "react";

const SubObjectContext = createContext({
  subObjects: [] as SubObjectType[],
  loading: true,
  revalidate: () => {},
});

/**
 * A React component that renders a layout for displaying a list of sub-objects and a sidebar for navigation.
 *
 * @remarks The component uses the `GenericObject` type from the `types` module to represent the sub-object data. The component includes a sidebar for navigation with links to create a new sub-object and view existing sub-objects. The component is used in the `GestionObjetList` page for displaying a list of sub-objects.
 *
 * @param children - The child components to be rendered within the layout.
 * @param subObjects - An array of objects representing the sub-objects to be displayed in the sidebar.
 *
 * @returns A React component that renders a layout for displaying a list of sub-objects and a sidebar for navigation.
 */
export const SubObjectLayout = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const entity = getEntityFromContact(user);
  const { data: api, loading, revalidate } = useFetch<APIResult<SubObjectType[]>>(`/api/sub-object/get`);
  const subObjects = useMemo(() => api?.data?.sort(sortByName) || [], [api?.data]);

  return (
    <SubObjectContext.Provider value={{ subObjects, loading, revalidate }}>
      <div className="flex flex-row w-full h-full">
        <Sidebar
          type="secondary"
          navigation={[
            {
              label: "Général",
              value: [
                {
                  name: "Liste des sous-objets",
                  url: "/admin/plugins/sub-object",
                  icon: <ListBulletIcon className="w-4 h-4 shrink-0" />,
                },
                {
                  name: "Créer un nouveau sous-objet",
                  url: "/admin/plugins/sub-object/create",
                  icon: <PlusIcon className="w-4 h-4 shrink-0" />,
                },
              ],
            },
            {
              label: "Sous-objets",
              value: subObjects.map((e) => ({
                name: (e.metadata.label as string) || "",
                url: `/admin/plugins/sub-object/${e._id}`,
                icon: (
                  <span
                    className={cn(
                      "w-5 text-xs font-bold leading-none text-center shrink-0",
                      entity === e.metadata.entity ? "text-opengeo" : "text-neutral-600",
                    )}
                  >
                    {getLabel(e)}
                  </span>
                ),
              })),
            },
          ]}
        ></Sidebar>
        <div className="w-full max-h-[calc(100vh-4rem-3.5rem)] h-full overflow-x-hidden overflow-y-auto">
          {children}
        </div>
      </div>
    </SubObjectContext.Provider>
  );
};

export const useSubObjects = () => {
  const context = useContext(SubObjectContext);
  if (!context) throw new Error("useSubObjects must be used within a SubObjectLayout");
  return context;
};
