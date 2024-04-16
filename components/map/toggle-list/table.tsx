import { GenericObject } from "@/types/generic-object";
import { useCartographie } from "@components/map/context";
import { Button } from "@components/ui/button";
import { Toggle } from "@components/ui/toggle";
import { Cross2Icon, TableIcon } from "@radix-ui/react-icons";
import classNames from "classnames";
import { useState } from "react";

import { Badge } from "@components/ui";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import { useRouter } from "next/router";

/**
 * A React component that displays a table of filtered sites.
 *
 * @remarks The component uses the `useRouter` hook from `next/router` to get the current URL path and to navigate to the detail page of a site when it is clicked. The component uses the `useCartographie` hook to get the current filters, filtered sites, and selected site. The component renders a button that toggles the visibility of the table. The component renders a table with the site names and their properties. The component uses the `getValue` function to get the value of a property for a site. The component also renders a summary of the number of sites that match each filter. The component uses the `classNames` function from `classnames` to conditionally apply CSS classes based on the state of the component.
 *
 * @returns A React component that displays a table of filtered sites.
 */
export const Table = () => {
  const { push } = useRouter();
  const [open, setOpen] = useState(false);
  const { filters, filtered, selectedSite, filters_options, subFilters } = useCartographie();

  return (
    <>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Toggle
              className="gap-x-1"
              variant="outline"
              pressed={open}
              onPressedChange={setOpen}
              aria-label="Toggle table"
            >
              <TableIcon className="block w-4 h-4 shrink-0" />
              <span className="sr-only">Tableau</span>
            </Toggle>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {open ? "Cacher le tableau/filtres" : "Afficher le tableau/filtres"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {open && (
        <div className="fixed top-0 left-0 w-screen h-screen overflow-hidden pointer-events-none">
          <div
            className={classNames(
              "right-0 absolute z-50 bottom-12 flex flex-col w-full md:max-w-3xl  2xl:max-w-6xl overflow-y-auto duration-200 transition-colors border md:bottom-auto md:top-32 bg-white/90 hover:bg-white h-96 md:h-96 gap-y-2 shrink-0 md:shadow-lg md:rounded-lg",
              open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
              selectedSite && "bottom-[calc(200px+3rem)]",
            )}
          >
            <div className="sticky top-0 left-0 right-0 inline-flex justify-end w-full p-2 bg-gray-100 rounded-t-lg handle">
              <Button variant="destructive" onClick={() => setOpen(false)}>
                <Cross2Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-title">Fermer</span>
              </Button>
            </div>
            <div className="w-full px-4 pb-4">
              <table className="w-full mx-auto rounded">
                <thead>
                  <tr>
                    <th className="w-1/3 p-2 text-sm text-left text-gray-700 font-title">Objet</th>
                    {filters.map((f) => (
                      <th
                        data-testid="filter"
                        key={f}
                        style={{ width: `${(100 - 34) / filters.length}%` }}
                        className="p-2 text-sm text-left text-gray-700 font-title last:text-right min-w-fit whitespace-nowrap"
                      >
                        {filters_options.find((o) => o._id === f)?.metadata.label || f}
                        <Badge className="ml-1" variant="outline">
                          {filtered.reduce((acc, cur) => {
                            const value = getValue(cur, f);
                            if (typeof value === "number") return acc + value;
                            if (value === "✅") return acc + 1;
                            return acc;
                          }, 0) || "N/A"}
                        </Badge>
                      </th>
                    ))}
                    {filters.length > 0
                      ? filters[0] &&
                        // TODO: metadata.properties feature
                        filters_options.find((o) => o._id === filters[0])?.metadata.label.toLowerCase() ===
                          "occupation" &&
                        subFilters.map((f) => (
                          <th
                            data-testid="sub-filter"
                            key={f}
                            style={{ width: `${(100 - 34) / subFilters.length}%` }}
                            className="p-2 text-sm text-left text-gray-700 font-title last:text-right min-w-fit whitespace-nowrap"
                          >
                            {f}
                            <span className="bg-gray-700 text-white font-bold font-title text-xs px-1 py-0.5 rounded ml-1">
                              {filtered.reduce((acc, cur) => {
                                const occupation = Object.values(cur.children)
                                  .flat()
                                  .find((c) => c._id === filters[0]);

                                const value = occupation?.values.find((v) => v.label.toLowerCase() === f.toLowerCase())
                                  ?.value;

                                if (typeof value === "number") return acc + value;
                                return acc;
                              }, 0) ?? "N/A"}
                            </span>
                          </th>
                        ))
                      : null}
                  </tr>
                </thead>
                <tbody className="mx-12 overflow-y-auto border-t border-gray-300 divide-y divide-gray-200 max-h-96 h-96">
                  {filtered.map((site) => (
                    <tr
                      key={site._id}
                      onClick={() => push(`/generic-object/${site._id}`)}
                      className="cursor-pointer pointer-events-auto hover:bg-gray-100"
                    >
                      <td className="p-1 pr-3 text-xs font-bold text-left text-gray-700 font-title">
                        {site.values.find((v) => v.label === "Nom")?.value.toString()}
                      </td>
                      {filters.map((filter) => (
                        <td
                          className="p-1 pr-3 text-xs text-left text-gray-700 last:text-right last:pr-3 font-title whitespace-nowrap"
                          key={filter}
                        >
                          {getValue(site, filter)}
                        </td>
                      ))}
                      {filters.length > 0
                        ? filters[0] &&
                          // TODO: metadata.properties feature
                          filters_options.find((o) => o._id === filters[0])?.metadata.label.toLowerCase() ===
                            "occupation" &&
                          subFilters.map((filter) => {
                            const occupation = Object.values(site.children)
                              .flat()
                              .find((c) => c._id === filters[0]);

                            const value = occupation?.values.find((v) => v.label.toLowerCase() === filter.toLowerCase())
                              ?.value;

                            return (
                              <td
                                className="p-1 pr-3 text-xs text-left text-gray-700 last:text-right last:pr-3 font-title whitespace-nowrap"
                                key={filter}
                              >
                                {value !== undefined ? value.toString() : "N/A"}
                              </td>
                            );
                          })
                        : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const getValue = (s: GenericObject, f: string) => {
  const subObject = Object.values(s.children)
    .flat()
    .filter((so) => so._id === f);
  if (!subObject || subObject.length === 0) return "Le sous objet n'existe pas";

  const hasOnlyBoolean = subObject.every((c) => c.values.every((v) => v.type === "boolean"));
  const hasEveryBooleanTrue = subObject.every((c) =>
    c.values.every((v) => v.type === "boolean" && (v.value === "true" || v.value === true)),
  );
  if (hasOnlyBoolean) return hasEveryBooleanTrue ? "✅" : "❌";

  if (subObject.every((c) => c.values.every((v) => v.type === "number")))
    return (
      subObject?.reduce((acc, cur) => {
        if (cur.values?.every((v) => v.type === "number"))
          return (
            acc +
            cur.values.reduce((a, c) => {
              if (c.label === "Total") return a;

              return a + (c.value as number);
            }, 0)
          );

        return acc + 1;
      }, 0) || 0
    );

  if (subObject.every((c) => c.values.every((v) => v.type === "string"))) {
    // TODO: change this to a more generic way (metadata.properties.contact === true)
    const isContact = subObject.every((c) => "value" in (c.values.find((v) => v.label === "Nom") || {}));

    return isContact
      ? subObject.map((c) => c.values.find((v) => v.label === "Nom")?.value).join(", ")
      : subObject.map((c) => c.values.map((v) => v.value)).join(", ");
  }

  // if subObject have mixed types
  if (Array.from(new Set(subObject.map((c) => c.values.map((v) => v.type)).flat())).length > 1) return "Valeurs mixtes";

  return "N/A";
};
