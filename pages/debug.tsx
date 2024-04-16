import { useAuth } from "@/hooks/useAuth";
import { canHaveAccess } from "@/hooks/useHabilitation";
import { usePreferences } from "@/hooks/usePreferences";
import { fetcher } from "@/lib/fetchers";
import { deleteAllCollections } from "@/lib/fetchers/collections";
import { seedHabilitations } from "@/lib/fetchers/habilitation";
import { DebugImportForm } from "@components/debug/import/form";
import { ErrorPage } from "@components/helpers/error/page";
import { HeadTitle } from "@components/helpers/head/title";
import { Button } from "@components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@components/ui/dialog";

import { toast } from "sonner";

/**
 * A React component that renders a debug page for displaying user data and migrating data from the V1 version of the application.
 *
 * @remarks The component uses the `useAuth` hook from the `UserContext` module to retrieve the current user data. The component renders a section for displaying the user data as a JSON object, and a button for migrating data from the V1 version of the application.
 *
 * @returns A React component that renders a debug page for displaying user data and migrating data from the V1 version of the application.
 */
const Debug = () => {
  const { user } = useAuth();
  const { preferences } = usePreferences();

  if (!user)
    return (
      <ErrorPage
        {...{
          http: "Non autorisé",
          message: "Vous n'êtes pas connecté, veuillez revenir à l'accueil.",
        }}
      />
    );

  if (!preferences?.isDeveloper)
    return (
      <ErrorPage
        {...{
          http: "Non autorisé",
          message: "Vous n'êtes pas développeur, veuillez revenir à l'accueil.",
          // description: "(Konami...)",
        }}
      />
    );
  return (
    <>
      <HeadTitle title="Debug" />
      <div className="relative flex flex-col h-full p-6 mx-auto mt-6 gap-y-4 xl:px-0 max-w-7xl lg:mt-0">
        <section className="flex flex-row flex-wrap gap-2 p-4 border rounded-xl">
          <h3 className="w-full mb-2 text-2xl font-black text-gray-700 font-title">Données utilisateur</h3>
          <div className="flex flex-col md:flex-row w-full gap-4 md:max-h-[32rem]">
            <div className="w-full overflow-auto md:w-1/2">
              <pre className="w-full p-4 overflow-x-auto font-mono text-xs text-green-500 bg-gray-900 rounded-xl ">
                {JSON.stringify(user, undefined, 2)}
              </pre>
            </div>
            <div className="w-full overflow-auto md:w-1/2">
              <pre className="w-full p-4 overflow-x-auto font-mono text-xs text-green-500 bg-gray-900 rounded-xl ">
                {JSON.stringify(preferences, undefined, 2)}
              </pre>
            </div>
          </div>
        </section>
        <div className="grid grid-cols-1 gap-4 mb-8">
          <section className="flex flex-row flex-wrap gap-2 p-4 border rounded-xl">
            <h3 className="w-full mb-2 text-2xl font-black text-gray-700 font-title">Actions</h3>
            {canHaveAccess(undefined, 1000) && (
              <Button
                variant="outline"
                onClick={() =>
                  deleteAllCollections()
                    .then(() =>
                      toast("Les collections ont été supprimées", {
                        icon: "🗑️",
                        description: "Vous pouvez maintenant importer les données depuis la V1",
                      }),
                    )
                    .catch(() =>
                      toast.error("Une erreur est survenue lors de la suppression des collections", { icon: "🚨" }),
                    )
                }
              >
                ⚠️ Supprimer toutes les collections
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() =>
                seedHabilitations()
                  .then(() =>
                    toast("Les habilitations minimales ont été créés", {
                      icon: "👷",
                      description: "Vous pouvez maintenant accéder à toute l'application",
                    }),
                  )
                  .catch(() =>
                    toast.error("Une erreur est survenue lors de la création de l'habilitation", { icon: "🚨" }),
                  )
              }
            >
              👷 Ajouter les habilitations minimales
            </Button>

            <div className="inline-flex items-center w-full gap-2 pt-2 border-t">
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const res = await fetcher("/api/_/repair?model=logs");
                    if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
                    toast("Les données ont été réparées", {
                      icon: "🛠️",
                      description: "Les logs sont maintenant prêts à être utilisés",
                    });
                  } catch {
                    toast.error("Une erreur est survenue lors de la réparation des logs", { icon: "🚨" });
                  }
                }}
              >
                🛠️ Réparer les logs
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const res = await fetcher("/api/_/repair?model=habilitations");
                    if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
                    toast("Les données ont été réparées", {
                      icon: "🛠️",
                      description: "Les doublons ont été supprimés des habilitations",
                    });
                  } catch {
                    toast.error("Une erreur est survenue lors de la réparation des logs", { icon: "🚨" });
                  }
                }}
              >
                🛠️ Réparer les habilitations
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  try {
                    const res = await fetcher("/api/_/migrate-from-picup.company");
                    if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
                    toast("Les données ont été migrées", {
                      icon: "🛠️",
                      description: "Les données de Picup ont été migrées vers la structure OpenGeo",
                    });
                  } catch {
                    toast.error("Une erreur est survenue lors de la migration des données", { icon: "🚨" });
                  }
                }}
              >
                🛠️ Migrer les données de Picup
              </Button>
            </div>
            <div className="inline-flex items-center w-full gap-2 pt-2 border-t">
              {canHaveAccess(undefined, 1000) && (
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      const res = await fetcher("/api/_/export-database");
                      if (!res.ok) throw new Error(`Erreur ${res.status}: ${res.statusText}`);
                      toast("Les données ont été exportées", {
                        icon: "🤡",
                        description: "Disponible dans la console du navigateur",
                      });
                    } catch {
                      toast.error("Une erreur est survenue lors de l'export des données", { icon: "🚨" });
                    }
                  }}
                >
                  🤡 Exporter la base de données
                </Button>
              )}
              {canHaveAccess(undefined, 1000) && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">🤡 Importer la base de données</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-6xl">
                    <DebugImportForm />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default Debug;
