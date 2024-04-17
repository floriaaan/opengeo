import { fetcher } from "@/lib/fetchers";
import { log } from "@/lib/log";
import { SyntheseType } from "@/types/synthese";
import { Button, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@components/ui";
import { TrashIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

export const SyntheseDeleteDialog = ({
  synthese,
  onCloseModal,
}: {
  synthese: SyntheseType;
  onCloseModal: () => void;
}) => {
  const deleteSynthese = async () => {
    let toastId = toast.loading("Suppression en cours...");
    try {
      const res = await fetcher("/api/synthese/delete", {
        method: "DELETE",
        body: JSON.stringify({ _id: synthese._id }),
      });
      if (!res.ok) throw new Error("Une erreur est survenue lors de la suppression de la fiche de synthèse");
      toast.success("La fiche de synthèse a été supprimée avec succès", { id: toastId, icon: "✅" });
      onCloseModal();
    } catch (e) {
      log.error(e);
      toast.error((e as Error).message, { id: toastId, icon: "❌" });
    }
  };

  return (
    <DialogContent className="flex flex-col gap-y-4 max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{`Supprimer la fiche de synthèse "${synthese.metadata.label}"`}</DialogTitle>
        <DialogDescription>
          Êtes-vous sûr de vouloir supprimer la fiche de synthèse <strong>{synthese.metadata.label}</strong> ? Cette
          action est irréversible.
        </DialogDescription>
      </DialogHeader>
      <div className="inline-flex justify-end w-full gap-2">
        <Button onClick={() => onCloseModal()} variant="outline">
          <XIcon className="w-4 h-4" />
          Annuler
        </Button>
        <Button onClick={() => deleteSynthese()} variant="destructive">
          <TrashIcon className="w-4 h-4" />
          Supprimer
        </Button>
      </div>
    </DialogContent>
  );
};
