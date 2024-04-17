import { FileIcon, ImageIcon, LayersIcon, TableIcon, VideoIcon } from "lucide-react";

export const getIcon = (type: string | undefined, className: string) => {
  if (!type) return <FileIcon className={className} />;
  if (type.includes("image")) return <ImageIcon className={className} />;
  if (type.includes("video")) return <VideoIcon className={className} />;
  if (type.includes("presentation")) return <LayersIcon className={className} />;
  if (type.includes("sheet")) return <TableIcon className={className} />;

  return <FileIcon className={className} />;
};
