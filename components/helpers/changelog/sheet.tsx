import { Button } from "@components/ui/button";
import { Sheet, SheetTrigger } from "@components/ui/sheet";

import { ChangelogSheetContent } from "@components/helpers/changelog/sheet-content";
import packageInfo from "package.json";
const { version } = packageInfo;

export const ChangelogSheet = () => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          className="inline-flex gap-1 text-xs items-center ml-auto rounded-full select-none py-0.5 h-auto px-2 bg-opengeo-200 text-opengeo hover:bg-opengeo-300/20 border-none hover:text-opengeo font-medium font-title "
        >
          version
          <strong>{version}</strong>
        </Button>
      </SheetTrigger>
      <ChangelogSheetContent />
    </Sheet>
  );
};
