import { useEffect, useRef } from "react";

type PropsWithName = {
  name: string;
  property?: never;
};

type PropsWithProperty = {
  name?: never;
  property: string;
};

type ControlledMetaProps = {
  content: string;
} & (PropsWithName | PropsWithProperty);

const ControlledMeta = ({ name, property, content }: ControlledMetaProps) => {
  const initialMeta = useRef<HTMLMetaElement | null>(null);
  const selector = name
    ? `meta[name="${name}"]`
    : property
      ? `meta[property="${property}"]`
      : null;

  useEffect(() => {
    if (!selector) {
      throw new Error("Either 'name' or 'property' must be provided for ControlledMeta.");
    }

    let meta = document.head.querySelector<HTMLMetaElement>(selector);

    if (meta) {
      initialMeta.current = meta.cloneNode(true) as HTMLMetaElement;
    } else {
      meta = document.createElement("meta");

      if (name) meta.setAttribute("name", name);
      if (property) meta.setAttribute("property", property);

      document.head.appendChild(meta);
    }

    meta.setAttribute("content", content);

    return () => {
      const completelyRemoveMeta = () =>
        meta && meta.parentNode === document.head && document.head.removeChild(meta);

      if (initialMeta.current) {
        const existingMeta = document.head.querySelector<HTMLMetaElement>(selector);

        if (existingMeta) {
          existingMeta.setAttribute("content", initialMeta.current.content);
        } else {
          completelyRemoveMeta();
        }
      } else {
        completelyRemoveMeta();
      }
    };
  }, [name, property]);

  return null;
};

export { ControlledMeta };
