import { useState } from "react";
import { useEventListener } from "usehooks-ts";

const konami = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "KeyB",
  ["KeyA", "KeyQ"],
];

export const useKonami = () => {
  let position = 0;

  const [easter, setEaster] = useState(false);
  useEventListener("keydown", (e) => {
    const key: string = e.code;
    const requiredKey = konami[position];
    if (key === requiredKey || (Array.isArray(requiredKey) && requiredKey.includes(key))) {
      position++;
      console.log(position, konami.length);
      if (position === konami.length) {
        setEaster(true);
        position = 0;
      }
    } else {
      setEaster(false);
      position = 0;
    }
  });
  return { ee: easter };
};
