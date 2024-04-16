import { cn } from "@/lib/utils";
import { ResultGET } from "@/pages/api/admin";
import { Card } from "@components/ui";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";

export const dates = {
  last: new Date(new Date().setMonth(new Date().getMonth() - 2)),
  current: new Date(new Date().setMonth(new Date().getMonth() - 1)),
};

export const calculatePercentageChange = (current: number, previous: number) =>
  parseFloat(previous !== 0 ? (((current - previous) / previous) * 100).toFixed(2) : "100");

export const VisitsChart = ({ data, loading }: { data: ResultGET["visits"]; loading: boolean }) => {
  let { last, current, chart } = data;
  const percent = calculatePercentageChange(current, last);
  return (
    <Card className="relative h-full row-span-2 p-3 overflow-hidden transition duration-500 rounded-lg shadow-none min-h-72 lg:col-span-4 bg-opengeo-500/5 text-opengeo">
      <div className="flex flex-col w-full h-full">
        <h6 className="text-xs font-bold tracking-wider uppercase ">Visites</h6>
        <p className="inline-flex items-end gap-1 text-5xl font-black font-title">{loading ? "en attente" : current}</p>
        <p
          className={cn(
            "inline-flex items-center gap-1 text-xs font-bold leading-tight",
            !loading && last <= current ? "text-green-500" : "text-red-500",
          )}
        >
          {!loading && last <= current ? "▲" : "▼"} {percent} %
          <span>
            {last} → {current}
          </span>
        </p>
      </div>
      <div className="absolute inset-x-0 bottom-0">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              data={loading ? [] : chart.map((el) => ({ name: el.date, pv: el.users }))}
            >
              <YAxis
                type="number"
                hide
                domain={[0, chart.reduce((acc, el) => Math.max(acc, el.users), -Infinity) + 5]}
              />

              <Area
                fill="hsl(var(--primary)/0.25)"
                type="monotone"
                dataKey="pv"
                stroke="hsl(var(--primary))"
                dot={false}
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="absolute top-0 right-0 m-3 group">
        <QuestionMarkCircledIcon className="w-4 h-4 text-muted-foreground" />
        <span className="mt-2 absolute w-auto p-2 text-xs text-white transition-all inline-flex items-center gap-x-1 duration-100 origin-top scale-0 bg-gray-900 rounded-md shadow-md min-w-max right-0 group-hover:scale-100 z-[61]">
          <span>Les visites sont comptabilisées du</span>
          <strong>{format(dates.last, "dd/MM/yyyy", { locale: fr })}</strong>
          <span>au</span>
          <strong>{format(dates.current, "dd/MM/yyyy", { locale: fr })}</strong>
          <span>et du</span>
          <strong>{format(dates.current, "dd/MM/yyyy", { locale: fr })}</strong>
          <span>au</span>
          <strong>{format(new Date(), "dd/MM/yyyy", { locale: fr })}</strong>
        </span>
      </div>
    </Card>
  );
};
