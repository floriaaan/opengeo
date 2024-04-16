import { Footer } from "@components/layouts/footer";
import { Navbar } from "@components/layouts/navbar";
import { ReactNode } from "react";

/**
 * A React component that serves as the layout for the entire application.
 *
 * @remarks The component renders a `Navbar` component at the top of the page, a `Footer` component at the bottom of the page, and its children in the middle of the page. The `children` prop is a required prop that represents the actual content of the application, which is rendered between the navbar and the footer. The component uses the `flex` and `h-screen` classes to make the layout fill the entire height of the screen. The component uses the `mt-16` and `grow` classes to add margin and to make the content grow to fill the available space.
 *
 * @param children - The children of the component, which represent the actual content of the application.
 *
 * @returns A React component that serves as the layout for the entire application.
 */
export const AppLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="flex flex-col h-screen">
      <Navbar />
      <div className="mt-16 grow">{children}</div>
      <Footer></Footer>
    </main>
  );
};
