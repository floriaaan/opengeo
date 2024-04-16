import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ReactNode } from "react";

export const Count = ({
  data,
  loading,
  title,
  icon,
  percent,
}: {
  data?: ReactNode;
  loading: boolean;
  title: string;
  icon?: (props: { className: string }) => ReactNode;
  percent?: ReactNode;
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && icon({ className: "w-4 h-4 text-muted-foreground" })}
      </CardHeader>
      <CardContent>
        {!loading ? (
          <>
            <div className="text-2xl font-bold">{data}</div>
            <p className="text-xs text-muted-foreground">{percent}</p>
          </>
        ) : (
          <>
            <div className="w-full h-6 mt-1 mb-2 bg-gray-200 rounded animate-pulse"></div>
            <p className="w-1/3 h-3 bg-gray-200 rounded animate-pulse"></p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
