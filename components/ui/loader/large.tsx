import { cn } from "@/lib/utils";

export const LargeLoader = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center h-full max-h-[calc(100vh-8rem)] aspect-square  w-full ",
        className,
      )}
    >
      <video autoPlay loop muted className="object-cover w-64 h-64">
        <source src="/videos/loader.webm" type="video/webm" />
      </video>
    </div>
  );
};
