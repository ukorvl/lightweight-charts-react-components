import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode, RefObject } from "react";

type FullScreenProps<T> = {
  onEnter?: () => void;
  onLeave?: () => void;
  render: (props: { ref: RefObject<T | null> }) => ReactNode;
};

type FullScreenContextType = {
  isFullScreen: boolean;
  isFullScreenEnabled: boolean;
  enterFullScreen: () => void;
  leaveFullScreen: () => void;
  toggleFullScreen: () => void;
};

type VendorAPI = {
  fullscreenEnabledKey: keyof Document;
  fullscreenElementKey: keyof Document;
  requestFullscreenKey: keyof Element;
  exitFullscreenKey: keyof Document;
  fullscreenChangeEvent: string;
  fullscreenErrorEvent: string;
};

const detectVendor = (): VendorAPI => {
  const vendors: VendorAPI[] = [
    {
      fullscreenEnabledKey: "fullscreenEnabled",
      fullscreenElementKey: "fullscreenElement",
      requestFullscreenKey: "requestFullscreen",
      exitFullscreenKey: "exitFullscreen",
      fullscreenChangeEvent: "fullscreenchange",
      fullscreenErrorEvent: "fullscreenerror",
    },
    {
      fullscreenEnabledKey: "webkitFullscreenEnabled" as keyof Document,
      fullscreenElementKey: "webkitFullscreenElement" as keyof Document,
      requestFullscreenKey: "webkitRequestFullscreen" as keyof Element,
      exitFullscreenKey: "webkitExitFullscreen" as keyof Document,
      fullscreenChangeEvent: "webkitfullscreenchange",
      fullscreenErrorEvent: "webkitfullscreenerror",
    },
    {
      fullscreenEnabledKey: "mozFullScreenEnabled" as keyof Document,
      fullscreenElementKey: "mozFullScreenElement" as keyof Document,
      requestFullscreenKey: "mozRequestFullScreen" as keyof Element,
      exitFullscreenKey: "mozCancelFullScreen" as keyof Document,
      fullscreenChangeEvent: "mozfullscreenchange",
      fullscreenErrorEvent: "mozfullscreenerror",
    },
    {
      fullscreenEnabledKey: "msFullscreenEnabled" as keyof Document,
      fullscreenElementKey: "msFullscreenElement" as keyof Document,
      requestFullscreenKey: "msRequestFullscreen" as keyof Element,
      exitFullscreenKey: "msExitFullscreen" as keyof Document,
      fullscreenChangeEvent: "MSFullscreenChange",
      fullscreenErrorEvent: "MSFullscreenError",
    },
  ];

  return (
    vendors.find(
      v =>
        v.fullscreenEnabledKey in document &&
        v.fullscreenElementKey in document &&
        v.exitFullscreenKey in document &&
        v.requestFullscreenKey in Element.prototype
    ) || vendors[0]
  );
};

const vendor = detectVendor();

const FullScreenContext = createContext<FullScreenContextType | null>(null);
FullScreenContext.displayName = "FullScreenContext";

const getFullScreenEnabled = () => {
  return Boolean(document[vendor.fullscreenEnabledKey]);
};

const enterFullScreenHandler = (el: Element) => {
  const fn = el[vendor.requestFullscreenKey] as unknown as () => Promise<void>;
  if (typeof fn === "function") return fn.call(el);

  throw new Error(`Element does not support full screen request: ${el.tagName}`);
};

const leaveFullScreenHandler = () => {
  const fn = document[vendor.exitFullscreenKey] as unknown as () => Promise<void>;
  if (typeof fn === "function") return fn.call(document);
  throw new Error("exitFullscreen not supported");
};

const useFullScreenContext = () => {
  const currentContextValue = useContext(FullScreenContext);

  if (!currentContextValue) {
    const ctxName = FullScreenContext.displayName ?? "FullScreenContext";
    throw new Error(
      `useFullScreenContext must be used within a FullScreenProvider.
      Make sure to wrap your component tree with <FullScreenProvider> before using useFullScreenContext.
      Context name: ${ctxName}`
    );
  }

  return currentContextValue;
};

const FullScreen = <T extends Element>({
  render,
  onEnter,
  onLeave,
}: FullScreenProps<T>) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const ref = useRef<T>(null);
  const isFullScreenEnabled = getFullScreenEnabled();

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isNowFullScreen = Boolean(document[vendor.fullscreenElementKey]);
      setIsFullScreen(isNowFullScreen);
      if (isNowFullScreen && onEnter) {
        onEnter();
      } else if (!isNowFullScreen && onLeave) {
        onLeave();
      }
    };

    document.addEventListener(vendor.fullscreenChangeEvent, handleFullScreenChange);
    return () => {
      document.removeEventListener(vendor.fullscreenChangeEvent, handleFullScreenChange);
    };
  }, [onEnter, onLeave]);

  const enterFullScreen = useCallback(() => {
    if (ref.current) {
      enterFullScreenHandler(ref.current as unknown as Element);
    }
  }, []);

  const leaveFullScreen = useCallback(() => {
    leaveFullScreenHandler();
  }, []);

  const toggleFullScreen = useCallback(() => {
    if (isFullScreen) {
      leaveFullScreen();
    } else {
      enterFullScreen();
    }
  }, [isFullScreen, enterFullScreen, leaveFullScreen]);

  return (
    <FullScreenContext.Provider
      value={{
        isFullScreenEnabled,
        enterFullScreen,
        leaveFullScreen,
        isFullScreen,
        toggleFullScreen,
      }}
    >
      {render({
        ref,
      })}
    </FullScreenContext.Provider>
  );
};

export { FullScreen, useFullScreenContext };
