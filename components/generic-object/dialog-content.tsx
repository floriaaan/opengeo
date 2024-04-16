import { useAuth } from "@/hooks/useAuth";
import { canHaveAccess } from "@/hooks/useHabilitation";
import { getIcon } from "@/lib/file/getIcon";
import { cn } from "@/lib/utils";
import { SubObjectType } from "@/models";
import { FileDocument } from "@/models/File";
import { GenericField, GenericObject } from "@/types/generic-object";
import { Suggestion } from "@components/suggestion/dialog";
import { Button } from "@components/ui/button";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { DrawingPinFilledIcon, DrawingPinIcon, ExternalLinkIcon, Pencil1Icon } from "@radix-ui/react-icons";
import Link from "next/link";
import { toast } from "sonner";

export const SubObjectDialogContent = ({
  subObjects,
  object,
  isPinned,
  revalidate,
}: {
  subObjects: SubObjectType[];
  object: GenericObject;
  isPinned: boolean;
  revalidate: () => void;
}) => {
  const { user } = useAuth();
  const preview = subObjects[0];
  return (
    <DialogContent className="my-8  sm:max-w-2xl w-full overflow-y-auto max-h-[80vh]">
      <DialogHeader className="flex flex-row items-center justify-between w-full flex-nowrap">
        <div className="flex flex-col m-0">
          <DialogTitle>
            Sous-objet : <span className="first-letter:uppercase">{preview.metadata.label}</span>
          </DialogTitle>
          <DialogDescription>{preview.metadata.description || "Pas de description."}</DialogDescription>
        </div>
        <div className="inline-flex items-center gap-2 m-0 mr-6">
          {user?.id && (
            <Button
              size="icon"
              variant="outline"
              onClick={async () => {
                let toastId = toast.loading(!isPinned ? "Épinglage en cours..." : "Détachement en cours...", {
                  icon: "📌",
                });
                try {
                  const res = await fetch(`/api/user/preferences`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ subobject_id: preview._id }),
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
              {isPinned ? <DrawingPinFilledIcon className="w-4 h-4" /> : <DrawingPinIcon className="w-4 h-4" />}
              <span className="sr-only">{isPinned ? "Détacher" : "Épingler"}</span>
            </Button>
          )}
          {canHaveAccess(preview.metadata.entity, 100) && (
            <Button size="icon" asChild>
              <Link href={`/admin/plugins/sub-object/${preview._id}`}>
                <Pencil1Icon className="w-4 h-4" />
                <span className="sr-only">Modifier</span>
              </Link>
            </Button>
          )}
        </div>
      </DialogHeader>
      {subObjects
        .sort((a, b) => {
          if (a.values.some((v) => v.type === "date") && b.values.some((v) => v.type === "date")) {
            return (
              new Date((b.values.find((v) => v.type === "date") as GenericField).value as string).getTime() -
              new Date((a.values.find((v) => v.type === "date") as GenericField).value as string).getTime()
            );
          }
          return 0;
        })
        .map((elem, i) => (
          <div key={`subobject-list-${i}`} className="flex flex-col gap-2 p-3 border rounded">
            <div className="inline-flex items-center justify-between pb-2 border-b ">
              <p className="text-sm font-bold text-gray-400">#{i + 1}</p>
            </div>
            <div className="flex flex-col gap-1">
              {elem.values.map((el, idx) => (
                <div className="inline-flex items-start gap-x-2" key={el.value + elem._id + i + idx}>
                  <p className="font-semibold text-gray-800 min-w-[128px] first-letter:uppercase">{el.label} :</p>
                  <div
                    className={cn(
                      "flex justify-end gap-x-1",
                      el.type === "file" ? "flex-col items-start" : "flex-row items-center",
                    )}
                  >
                    <div className="flex flex-col gap-1 shrink ">
                      {el.type === "file" && (el.value as FileDocument).type.includes("image") && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={(el.value as FileDocument).path}
                          alt={(el.value as FileDocument).name}
                          className="object-cover w-32 rounded-lg max-h-64"
                        />
                      )}
                      <p className="mb-0 font-bold text-opengeo">
                        {el.value === undefined && "Non renseigné"}
                        {el.type === "file" && (
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
                          <p className="text-xs text-gray-500">
                            {(el.value as FileDocument).createdBy?.cn || "Inconnu"} à{" "}
                            {(el.value as FileDocument).createdAt.toString()}
                          </p>
                          <p className="text-xs text-gray-500">{(el.value as FileDocument).type}</p>
                        </>
                      )}
                    </div>
                    <Suggestion
                      data={el}
                      object={object}
                      path={`${
                        object._id
                      }.children["${subObjects[0].metadata.label.toLowerCase()}"][${i}].values[${idx}].value`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </DialogContent>
  );
};
