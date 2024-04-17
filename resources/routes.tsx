import { MapIcon, SlidersVerticalIcon } from "lucide-react";

type ModuleRoute = {
  basePath: string;
  title: string;
  icon?: JSX.Element;

  routes: {
    path: string;
    title: string;
  }[];
};
const cls = { className: "w-4 h-4 " };

const bases_routes: ModuleRoute = {
  basePath: "/",
  title: "OpenGeo",
  icon: <MapIcon {...cls} />,
  routes: [
    {
      path: "/",
      title: "Carte",
    },
    {
      path: "#liste-sites",
      title: "Liste des sites",
    },
  ],
};

const admin_routes: ModuleRoute = {
  basePath: "/admin",
  title: "Administration",
  icon: <SlidersVerticalIcon {...cls} />,
  routes: [
    {
      path: "/",
      title: "Tableau de bord",
    },
    {
      path: "/logs",
      title: "Logs",
    },
    {
      path: "/super/generic-object",
      title: "Tout les objets",
    },
    {
      path: "/super/sub-objects",
      title: "Tout les sous-objets",
    },
  ],
};

export const app_routes = [bases_routes, admin_routes];
