import { _get } from "@/lib/deep-get-set";
import { acceptSuggestion, rejectSuggestion } from "@/lib/fetchers/suggestion";
import { GenericObjectDocument } from "@/models";
import { SuggestionDocument } from "@/models/Suggestion";
import { Badge } from "@components/ui/badge";
import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@components/ui/dialog";
import { ArrowRightIcon, CheckIcon, EyeOpenIcon, TrashIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { toast } from "sonner";

export const SuggestionDialog = ({
  document,
  revalidate,
}: {
  document: SuggestionDocument & { original: GenericObjectDocument };
  revalidate: () => void;
}) => {
  const { original: object, path, suggestion, _id, initialValue, message } = document;
  const isOnSubObject = path.includes("children");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"} size="icon">
          <EyeOpenIcon className="w-4 h-4" />
          <span className="sr-only">Voir la suggestion</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-between w-full flex-nowrap">
          <div className="flex flex-col gap-1">
            <DialogTitle className="inline-flex flex-nowrap items-center gap-1">
              Suggestion pour le champ{" "}
              <span className="first-letter:uppercase">
                {_get(
                  object,
                  path
                    .split(".")
                    .slice(1)
                    .join(".")
                    .replace(/\.value$/, ".label"),
                )}
              </span>
            </DialogTitle>
            <small className="inline-flex items-center gap-1">
              {isOnSubObject && (
                <>
                  Sous-objet:
                  <span className="first-letter:uppercase">
                    {_get(object, "children" + path.split("children")[1].split(".")[0] + ".metadata.label")}
                  </span>
                  <span>&middot;</span>
                </>
              )}
              {object.values?.find((v) => v.label === "Nom")?.value.toString() ?? "Inconnu"}{" "}
              <Badge className="shrink-0 w-fit">{object.metadata.entity}</Badge>
            </small>
          </div>
          <div className="inline-flex items-center gap-2 m-0 mr-6">
            <Button variant="outline" size="icon" asChild>
              <Link target="_blank" href={`/generic-object/${object._id}`} rel="noopener noreferrer">
                <EyeOpenIcon className="w-4 h-4" />
                <span className="sr-only">Voir le site</span>
              </Link>
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={async () => {
                let toastId = toast.loading("Validation de la suggestion en cours...", {
                  icon: "👍",
                });
                try {
                  const data = await acceptSuggestion(_id);
                  if (!data) throw new Error("Une erreur est survenue lors de la validation de la suggestion");
                  toast("Suggestion validée avec succès", { icon: "✅", id: toastId });
                  revalidate();
                } catch (e) {
                  toast.error((e as Error)?.message, { icon: "🚨", id: toastId });
                }
              }}
            >
              <CheckIcon className="w-4 h-4" />
              <span className="sr-only">Accepter</span>
            </Button>
            <Button
              variant="destructive"
              size="icon"
              onClick={async () => {
                let toastId = toast.loading("Rejet de la suggestion en cours...", {
                  icon: "👎",
                });
                try {
                  const data = await rejectSuggestion(_id);
                  if (!data) throw new Error("Une erreur est survenue lors du rejet de la suggestion");
                  toast("Suggestion rejetée avec succès", { icon: "✅", id: toastId });
                  revalidate();
                } catch (e) {
                  toast.error((e as Error)?.message, { icon: "🚨", id: toastId });
                }
              }}
            >
              <TrashIcon className="w-4 h-4" />
              <span className="sr-only">Rejeter</span>
            </Button>
          </div>
        </DialogHeader>
        <hr className="" />
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <p className="font-bold">Suggestion</p>
            <div className="inline-flex items-center gap-1">
              <p className="text-sm">{initialValue.toString()}</p>
              <ArrowRightIcon className="w-4 h-4" />
              <strong className="text-sm">{suggestion.toString()}</strong>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-bold">Commentaire</p>
            <p className="text-sm">{message ?? "Pas de commentaire"}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
