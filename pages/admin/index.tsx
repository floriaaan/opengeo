import { useAuth } from "@/hooks/useAuth";
import { useFetch } from "@/hooks/useFetch";
import { RoleGuard } from "@/hooks/useHabilitation";
import { ResultGET } from "@/pages/api/admin";
import { APIResult } from "@/types/api";
import { Count } from "@components/admin/dashboard/count";
import { Histories } from "@components/admin/dashboard/history";
import { VisitsChart } from "@components/admin/dashboard/visits";
import { HeadTitle } from "@components/helpers/head/title";
import { AdminLayout } from "@components/layouts/admin";
import { Button } from "@components/ui/button";
import classNames from "classnames";
import {
  Boxes,
  BriefcaseBusiness,
  CalendarClockIcon,
  CalendarDaysIcon,
  CalendarFold,
  LockKeyhole,
  RefreshCwIcon,
  Shapes,
} from "lucide-react";
import { NextPage } from "next";

const DEFAULT_VISITS_DATA = {
  last: 0,
  current: 0,
  percent: {
    day: 0,
    month: 0,
  },
  chart: [],
  distinct: {
    current: 0,
    last: 0,
    total: 0,
    today: 0,
    yesterday: 0,
  },
  users: [],
} as ResultGET["visits"];
const DEFAULT_COUNTS_DATA = {
  habilitations: { count: 0, last: "" },
  genericObjects: 0,
  subObjects: 0,
  entities: [],
} as unknown as ResultGET["counts"];
const DEFAULT_HISTORY_DATA = [] as unknown as ResultGET["history"];
const DEFAULT_DATA = { visits: DEFAULT_VISITS_DATA, counts: DEFAULT_COUNTS_DATA, history: DEFAULT_HISTORY_DATA };

const Admin: NextPage = () => {
  const { user } = useAuth();
  const { data: api, loading, error, revalidate } = useFetch<APIResult<ResultGET>>("/api/admin", user);
  const data = api?.data;

  const { visits, counts, history } = loading ? DEFAULT_DATA : data ?? DEFAULT_DATA;

  return (
    <RoleGuard level={100}>
      <HeadTitle title="Tableau de bord" />

      <AdminLayout>
        <div className="container relative flex flex-col w-full gap-4 mt-6">
          <div className="inline-flex items-center justify-between w-full">
            <div className="flex flex-col">
              <div className="text-xl font-extrabold sm:text-3xl font-title">Tableau de bord</div>
              <div className="text-sm text-gray-600 sm:text-base font-public">
                {"Statistiques sur les données de l'application"}
              </div>
            </div>
            <div className="inline-flex items-center px-2 py-2 mt-4 space-x-4 w-fit">
              <Button onClick={revalidate} disabled={loading}>
                <RefreshCwIcon className={classNames("w-4 h-4", loading && "animate-spin")} />
                Rafraîchir
              </Button>
            </div>
          </div>

          <hr className="border-gray-200 " />

          {!error && (
            <div className="relative flex flex-col gap-4">
              <div className="grid gap-4 lg:grid-cols-6">
                <VisitsChart loading={loading} data={visits} />
                <Histories data={history} loading={loading} />
                <Count
                  data={visits.distinct.total}
                  loading={loading}
                  title="Visites totales"
                  icon={(props) => <CalendarFold {...props} />}
                />
                <Count
                  data={visits.distinct.current}
                  loading={loading}
                  title="Visites du mois"
                  icon={(props) => <CalendarClockIcon {...props} />}
                  percent={
                    <p>
                      {visits.percent.month > 0 ? "▲" : "▼"} {visits.percent.month} % depuis le mois dernier
                    </p>
                  }
                />
                <Count
                  data={visits.distinct.today}
                  loading={loading}
                  title="Visites aujourd'hui"
                  icon={(props) => <CalendarDaysIcon {...props} />}
                  percent={
                    <p>
                      {visits.percent.day > 0 ? "▲" : "▼"} {visits.percent.day} % depuis hier
                    </p>
                  }
                />
                <Count
                  title="Habilitations"
                  loading={loading}
                  data={counts.habilitations.count}
                  icon={(props) => <LockKeyhole {...props} />}
                  percent={
                    <p>
                      dernière hab. :{" "}
                      <span className="font-bold">
                        {new Date(counts.habilitations.last).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </p>
                  }
                />
              </div>
              <hr className="border-gray-200 " />
              <div className="my-4 text-2xl font-bold text-gray-700 font-title">Volumétrie</div>
              <div className="grid gap-4 lg:grid-cols-6">
                <Count
                  title="Objets"
                  loading={loading}
                  data={counts.genericObjects}
                  icon={(props) => <Boxes {...props} />}
                />
                <Count
                  title="Sous-objets"
                  loading={loading}
                  data={counts.subObjects}
                  icon={(props) => <Shapes {...props} />}
                />
                <Count
                  title="Entités distinctes"
                  loading={loading}
                  data={counts.entities.length}
                  icon={(props) => <BriefcaseBusiness {...props} />}
                />
              </div>
            </div>
          )}
          {error && (
            <div className="p-12 text-center">
              <p className="text-lg font-bold text-red-600 font-title">
                Une erreur est survenue lors du chargement des données.
              </p>
              <p className="text-sm text-gray-500">Veuillez réessayer ultérieurement.</p>
            </div>
          )}
        </div>
      </AdminLayout>
    </RoleGuard>
  );
};

export default Admin;
