import { canHaveAccess } from "@/hooks/useHabilitation";
import { usePreferences } from "@/hooks/usePreferences";
import { getIcon } from "@/lib/file/getIcon";
import { FileDocument } from "@/models/File";
import { GenericObject } from "@/types/generic-object";
import { SubObjectDialogContent } from "@components/generic-object/dialog-content";
import { roles } from "@components/habilitations/roles";
import { Badge } from "@components/ui/badge";
import { Dialog, DialogTrigger } from "@components/ui/dialog";
import { format, formatRelative } from "date-fns";
import { fr } from "date-fns/locale";

export const PinnedSubObject = ({ data: sub, object }: { data: GenericObject[]; object: GenericObject }) => {
  const { revalidate, preferences } = usePreferences();
  const { pinnedSubObjects } = preferences || {};
  const isPinned = pinnedSubObjects?.find((p) => p === sub[0]._id) !== undefined;

  if (!sub || sub.length === 0) return null;
  const haveAccess = canHaveAccess(
    sub?.[0]?.metadata.entity,
    roles.find((r) => r.value === sub?.[0]?.metadata.authorization)?.level,
  );

  const preview = sub.some((s) => s.values.some((v) => v.type === "date"))
    ? // get the most recent subObject based on value that is type date
      sub.reduce((latest, current) => {
        const currentDateValue = current.values.find((v) => v.type === "date")?.value;
        const latestDateValue = latest.values.find((v) => v.type === "date")?.value;

        if (currentDateValue !== undefined && (latestDateValue === undefined || currentDateValue > latestDateValue))
          return current;

        return latest;
      }, sub[0])
    : sub[0];
  const lastUpdated = sub
    .sort((a, b) => new Date(b.metadata.updated_at).getTime() - new Date(a.metadata.updated_at).getTime())
    .at(0);

  return (
    <Dialog>
      <DialogTrigger disabled={!haveAccess}>
        <div className="relative flex flex-col w-full h-full p-4 text-sm font-medium transition-colors bg-transparent border rounded-md border-input hover:bg-accent hover:text-accent-foreground whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
          <span className="first-letter:uppercase w-fit">{preview.metadata.label}</span>
          {haveAccess ? (
            <span className="inline-flex items-center gap-x-1">
              <span className="text-xs text-neutral-400">
                {sub.length === 0 ? `Pas d'objets` : `${sub.length} ${sub.length > 1 ? "objets" : "objet"}`}
              </span>
              <Badge variant="secondary" className="inline-flex items-center px-2 text-xs rounded gap-x-1 flex-nowrap ">
                <span className="hidden md:block">Mis à jour: </span>
                {sub.length > 0 && lastUpdated?.metadata?.updated_at
                  ? formatRelative(new Date(lastUpdated.metadata.updated_at), new Date(), {
                      locale: fr,
                    })
                  : "Non renseigné"}
              </Badge>
            </span>
          ) : (
            <Badge variant="destructive" className="inline-flex items-center px-2 text-xs rounded gap-x-1 flex-nowrap ">
              {`Niveau requis: ${roles.find((r) => r.value === preview?.metadata.authorization)?.label}`}
            </Badge>
          )}
          {haveAccess && (
            <>
              <hr className="my-2" />
              {/* Overview of the first one */}

              <div className="flex flex-col gap-0.5 text-xs">
                {preview.values.map((el, i) => (
                  <div className="inline-flex items-start gap-x-2" key={el.value + preview._id + i}>
                    <p className="font-semibold text-gray-800 min-w-[48px] 2xl:min-w-[72px] text-left first-letter:uppercase">
                      {el.label} :
                    </p>
                    <div className="flex flex-col text-right grow">
                      <p className="h-full mb-0 font-bold whitespace-pre-wrap text-opengeo">
                        {el.value === undefined && "Non renseigné"}
                        {el.type === "file" && (
                          <a
                            href={(el.value as FileDocument).path}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center font-bold text-opengeo gap-x-1"
                          >
                            {getIcon((el.value as FileDocument).type, "w-4 h-4")}
                            {(el.value as FileDocument).name}
                          </a>
                        )}
                        {typeof el.value !== "boolean" && el.type !== "file" && el.value?.toString()}
                        {typeof el.value === "boolean" && (el.value === true ? "Oui" : "Non")}
                      </p>
                      {el.type === "file" && (
                        <>
                          <p className="text-xs text-gray-500 line-clamp-2 whitespace-pre-wrap">
                            {(el.value as FileDocument).createdBy?.cn || "Inconnu"} le{" "}
                            {format(new Date((el.value as FileDocument).createdAt.toString()), "dd/MM/yyyy à HH:mm", {
                              locale: fr,
                            })}
                          </p>
                          <p className="text-xs text-gray-500">{(el.value as FileDocument).type}</p>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {haveAccess && sub.length > 1 && (
            <div className="absolute top-1 right-1">
              <Badge>+{sub.length - 1}</Badge>
            </div>
          )}
        </div>
      </DialogTrigger>
      {sub && sub.length > 0 && (
        <SubObjectDialogContent subObjects={sub} revalidate={revalidate} isPinned={isPinned} object={object} />
      )}
    </Dialog>
  );
};
