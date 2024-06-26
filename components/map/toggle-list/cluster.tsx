import { useCartographie } from "@components/map/context";
import { Toggle } from "@components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/tooltip";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export const ClusterToggle = () => {
  const { isCluster, setIsCluster } = useCartographie();
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle variant="outline" pressed={isCluster} onPressedChange={setIsCluster} aria-label="Toggle cluster">
            {!isCluster ? <EyeIcon className="w-4 h-4" /> : <EyeOffIcon className="w-4 h-4" />}
          </Toggle>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {isCluster ? "Désactiver le regroupement des marqueurs" : "Activer le regroupement des marqueurs"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
