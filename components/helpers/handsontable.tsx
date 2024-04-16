import "handsontable/dist/handsontable.full.css";
import dynamic from "next/dynamic";
import { HotTable, HotTableProps } from "@handsontable/react";
import { registerAllModules } from "handsontable/registry";

/**
 * A React component that displays a Handsontable table.
 *
 * @remarks The component uses the `HotTable` component from `@handsontable/react` to render the table. The component also uses the `registerAllModules` function from `handsontable/registry` to register all available Handsontable modules. The component sets several props on the `HotTable` component to configure its behavior, including `licenseKey`, `height`, `colHeaders`, `rowHeaders`, `wordWrap`, `manualRowResize`, `manualColumnResize`, `autoColumnSize`, `width`, `stretchH`, and `fillHandle`. The component is loaded dynamically using the `dynamic` function from `next/dynamic` to improve performance.
 *
 * @param props - An object that contains the props for the `HotTable` component.
 *
 * @returns A React component that displays a Handsontable table.
 */
const HandsontableComponent = (props: HotTableProps) => {
  registerAllModules();
  return (
    <HotTable
      style={{ zIndex: 0 }}
      licenseKey="non-commercial-and-evaluation"
      height={800}
      colHeaders={true}
      rowHeaders={true}
      {...props}
      wordWrap={false}
      manualRowResize
      manualColumnResize
      // autoColumnSize={false}
      width="100%"
      stretchH="all"
      fillHandle={{ autoInsertRow: false }}
    >
      {props.children}
    </HotTable>
  );
};

export const Handsontable = dynamic(() => Promise.resolve(HandsontableComponent), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center w-full h-64">Chargement</div>,
});
