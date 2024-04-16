import { CSSProperties, ReactNode, useEffect, useRef } from "react";
import { DraggableProvided } from "react-beautiful-dnd";
import { createPortal } from "react-dom";

type RenderFunction = (provided: DraggableProvided, ...args: any[]) => ReactNode;

export const useDraggableInPortal = () => {
  const self = useRef({}).current;

  useEffect(() => {
    const div = document.createElement("div");
    div.style.position = "absolute";
    div.style.pointerEvents = "none";
    div.style.top = "0";
    div.style.width = "100%";
    div.style.height = "100%";
    // @ts-expect-error - portal is not in types yet
    self.elt = div;
    document.body.appendChild(div);
    return () => {
      document.body.removeChild(div);
    };
  }, [self]);

  return (render: RenderFunction) =>
    (provided: DraggableProvided, ...args: any[]): ReactNode => {
      const element = render(provided, ...args);
      if ((provided.draggableProps.style as CSSProperties)?.position === "fixed") {
        // @ts-expect-error - portal is not in types yet
        return createPortal(element, self.elt);
      }
      return element;
    };
};
