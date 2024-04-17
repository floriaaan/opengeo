import { ListIcon, MailIcon, MapIcon, MessageCircleQuestionIcon } from "lucide-react";
import packageInfo from "package.json";
const { email } = packageInfo;

const cls = { className: "w-4 h-4 group-data-[active=true]:text-opengeo" };

/**
 * An array of navigation items that is used to define the navigation links in the application.
 *
 * @remarks The array includes objects that represent the navigation items, with properties for the name of the item, the URL it links to, the icon to display next to the item, the level of the item (if it is a sub-item), and the type of the item (either a link or an action). The `MapIcon`, `ClipboardListIcon`, `MailIcon`, and `SupportIcon` components are used to render the icons for the navigation items. The array is used in the `Sidebar` component to render the navigation links in the main sidebar.
 *
 * @returns An array of navigation items that is used to define the navigation links in the application.
 */
export const NAVIGATIONS: {
  name: string;
  href: string;
  icon: JSX.Element;
  level?: number;
  type: "link" | "action";
}[] = [
  {
    name: "Carte",
    href: "/",
    icon: <MapIcon {...cls} />,
    type: "link",
  },
  {
    name: "Liste des objets",
    href: "/generic-object",
    icon: <ListIcon {...cls} />,
    type: "link",
  },
  //   {
  //     name: "Administration",
  //     href: "/admin",
  //     icon: <AdjustmentsIcon {...cls} />,
  //     type: "link",
  //   },
  {
    name: "Contacter l'équipe",
    href: `mailto:${email}`,
    icon: <MailIcon {...cls} />,
    type: "action",
  },
  {
    name: "Remonter un problème",
    href: `mailto:${email}?subject=Problème sur OpenGeo`,
    icon: <MessageCircleQuestionIcon {...cls} />,
    type: "action",
  },
];
