import { ClusterToggle } from "@components/map/toggle-list/cluster";
import { Table } from "@components/map/toggle-list/table";
import dynamic from "next/dynamic";

const ToggleWrapper = (): JSX.Element => {
  return (
    <div className="absolute right-0 z-[11] flex justify-end  w-36 md:w-40 pointer-events-auto">
      <div className="bg-white p-1.5 lg:shadow-md inline-flex items-center gap-x-1.5 lg:rounded-bl-lg">
        <Table />
        <ClusterToggle />
      </div>
    </div>
  );
};

export const ToggleList = dynamic(() => Promise.resolve(ToggleWrapper), {
  ssr: false,
});
