import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { canHaveAccess } from "@/hooks/useHabilitation";
import { usePreferences } from "@/hooks/usePreferences";
import { getIcon } from "@/lib/file/getIcon";
import { log } from "@/lib/log";
import { cn } from "@/lib/utils";
import { SubObjectType } from "@/models";
import { FileDocument } from "@/models/File";
import { GenericObject } from "@/types/generic-object";
import { roles } from "@components/habilitations/roles";
import { Suggestion } from "@components/suggestion/dialog";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { formatRelative } from "date-fns";
import { fr } from "date-fns/locale";
import { ExternalLinkIcon, PinIcon, PinOffIcon } from "lucide-react";
import { toast } from "sonner";

export const SubObject = ({ data: sub, object }: { data: SubObjectType[]; object: GenericObject }) => {
  const { user } = useAuth();
  const { revalidate, preferences } = usePreferences();
  try {
    const { pinnedSubObjects } = preferences || {};

    if (!sub || sub.length === 0) return null;
    const haveAccess = canHaveAccess(
      sub?.[0]?.metadata.entity,
      roles.find((r) => r.value === sub?.[0]?.metadata.authorization)?.level,
    );

    const isPinned = pinnedSubObjects?.find((p) => p === sub[0]._id) !== undefined;

    return (
      <>
        <AccordionItem
          className="w-full"
          value={`${object._id}/children/${sub[0]._id}/0/metadata/label/${sub[0].metadata.label}`}
        >
          <div className="inline-flex items-center w-full gap-x-2">
            <AccordionTrigger
              className="inline-flex items-center w-full pr-2 grow group gap-x-1 font-title"
              disabled={!haveAccess}
            >
              <div className="inline-flex items-center justify-between w-full pr-2 gap-x-2 grow">
                <span className="first-letter:uppercase">{sub[0].metadata.label}</span>
                {haveAccess ? (
                  <span className="inline-flex items-center gap-x-1">
                    <span className="text-xs text-neutral-400">
                      {sub.length === 0 ? `Pas d'objets` : `${sub.length} ${sub.length > 1 ? "objets" : "objet"}`}
                    </span>
                    <Badge
                      variant="secondary"
                      className="inline-flex items-center px-2 text-xs rounded gap-x-1 flex-nowrap "
                    >
                      <span className="hidden md:block">Mis à jour: </span>
                      {sub.length > 0 && sub[0]?.metadata?.updated_at
                        ? formatRelative(new Date(sub[0].metadata.updated_at), new Date(), {
                            locale: fr,
                          })
                        : "Non renseigné"}
                    </Badge>
                  </span>
                ) : (
                  <Badge
                    variant="destructive"
                    className="inline-flex items-center px-2 text-xs rounded gap-x-1 flex-nowrap "
                  >
                    {`Niveau requis: ${roles.find((r) => r.value === sub?.[0]?.metadata.authorization)?.label}`}
                  </Badge>
                )}
              </div>
            </AccordionTrigger>
            {user?.id && (
              <Button
                variant="secondary"
                size="icon"
                className="shrink-0"
                onClick={async () => {
                  let toastId = toast.loading(!isPinned ? "Épinglage en cours..." : "Détachement en cours...", {
                    icon: "📌",
                  });
                  try {
                    const res = await fetch(`/api/user/preferences`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ subobject_id: sub[0]._id }),
                    });
                    if (!res.ok)
                      throw new Error(
                        `Une erreur est survenue lors ${!isPinned ? "de l'épinglage" : "du détachement"} du sous-objet`,
                      );
                    isPinned
                      ? toast("Sous-objet détaché avec succès", { icon: "✅", id: toastId })
                      : toast.success("Sous-objet épinglé avec succès", { icon: "📌", id: toastId });
                    revalidate();
                  } catch (e) {
                    toast.error((e as Error)?.message, { icon: "🚨", id: toastId });
                  }
                }}
              >
                {isPinned ? <PinOffIcon className="w-4 h-4" /> : <PinIcon className="w-4 h-4" />}
              </Button>
            )}
          </div>

          <AccordionContent>
            <div className="flex flex-col p-2 rounded bg-gray-50 gap-y-2">
              <p className={cn("text-gray-800 text-sm", !sub[0].metadata.description && "italic text-xs")}>
                {sub[0].metadata.description || "Pas de description."}
              </p>
              {sub
                .sort((a, b) => {
                  if (a.values.some((v) => v.type === "date") && b.values.some((v) => v.type === "date")) {
                    return (
                      new Date(b.values.find((v) => v.type === "date")?.value as string).getTime() -
                      new Date(a.values.find((v) => v.type === "date")?.value as string).getTime()
                    );
                  }
                  return 0;
                })
                .map((elem, i) => (
                  <div key={`subobject-list-${i}`} className="flex flex-col gap-2 p-3 bg-white border rounded">
                    <div className="flex flex-col gap-1">
                      {elem.values.map((el, idx) => (
                        <div className="inline-flex items-start gap-x-2" key={el.value + elem._id + i + idx}>
                          <p className="font-semibold text-gray-800 min-w-[128px] first-letter:uppercase">
                            {el.label} :
                          </p>
                          <div
                            className={cn(
                              "flex justify-end gap-x-1",
                              el?.type === "file" ? "flex-col items-start" : "flex-row items-center",
                            )}
                          >
                            <div className="flex flex-col gap-1 shrink ">
                              {el?.type === "file" &&
                                el.value &&
                                (el.value as FileDocument).type?.includes("image") &&
                                "path" in (el.value as FileDocument) &&
                                "name" in (el.value as FileDocument) && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={(el.value as FileDocument).path}
                                    alt={(el.value as FileDocument).name}
                                    className="object-cover w-32 rounded-lg max-h-64"
                                  />
                                )}
                              <p className="mb-0 font-bold text-opengeo">
                                {el.value === undefined && "Non renseigné"}
                                {el.type === "file" &&
                                  el.value &&
                                  "path" in (el.value as FileDocument) &&
                                  "name" in (el.value as FileDocument) && (
                                    <a
                                      href={(el.value as FileDocument).path}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center font-bold text-opengeo gap-x-1 hover:underline"
                                    >
                                      {getIcon((el.value as FileDocument).type, "w-4 h-4")}
                                      {(el.value as FileDocument).name}
                                    </a>
                                  )}
                                {el.type === "url" && (
                                  <a
                                    href={el.value as string}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center font-bold hover:underline text-opengeo gap-x-1"
                                  >
                                    <ExternalLinkIcon className="w-3 h-3" />
                                    {el.value as string}
                                  </a>
                                )}
                                {typeof el.value !== "boolean" &&
                                  el.type !== "file" &&
                                  el.type !== "url" &&
                                  el.value?.toString()}
                                {typeof el.value === "boolean" && (el.value === true ? "Oui" : "Non")}
                              </p>
                              {el.type === "file" && (
                                <>
                                  {el.value ? (
                                    <>
                                      <p className="text-xs text-gray-500">
                                        {(el.value as FileDocument)?.createdBy?.cn || "Inconnu"}, le{" "}
                                        {new Date((el.value as FileDocument)?.createdAt.toString()).toLocaleDateString(
                                          "fr-FR",
                                          {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                          },
                                        )}
                                      </p>
                                      <p className="text-xs text-gray-500">{(el.value as FileDocument)?.type}</p>
                                    </>
                                  ) : (
                                    <p className="text-xs text-gray-500">Aucune donnée</p>
                                  )}
                                </>
                              )}
                            </div>
                            <Suggestion
                              data={el}
                              object={object}
                              path={`${
                                object._id
                              }.children["${sub[0].metadata.label.toLowerCase()}"][${i}].values[${idx}].value`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </>
    );
  } catch (e) {
    log.error(e);
    return (
      <span className="p-2 text-xs">Une erreur est survenue sur le sous-objet {sub[0].metadata.label || "?"}</span>
    );
  }
};
