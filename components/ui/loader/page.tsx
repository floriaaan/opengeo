import { Logo } from "@components/ui/Logo";

export const PageLoader = () => (
  <div className="absolute top-0 left-0 flex flex-col items-center justify-center w-screen h-screen p-8 gap-y-1 ">
    <Logo className="h-12" />

    <>
      <div className="relative w-32 h-1 mt-3 overflow-x-hidden bg-gray-200">
        <div className="absolute w-8 h-1 bg-opengeo animate-bounce-horizontal"></div>
      </div>
      <p className="text-xs font-bold tracking-tighter text-gray-300 uppercase">Chargement...</p>
    </>
  </div>
);
