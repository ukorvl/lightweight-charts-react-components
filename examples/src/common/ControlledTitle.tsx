import { useEffect, useRef } from "react";

type ControlledTitleProps = {
  title?: string;
};

const ControlledTitle = ({ title }: ControlledTitleProps) => {
  const initialTitle = useRef(document.title);

  useEffect(() => {
    const initialPageTitle = initialTitle.current;

    if (title) {
      document.title = title;
    } else {
      document.title = initialPageTitle;
    }

    return () => {
      if (initialPageTitle) {
        document.title = initialPageTitle;
      }
    };
  }, [title]);

  return null;
};

export { ControlledTitle };
