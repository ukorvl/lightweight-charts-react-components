import { useLayoutEffect, useRef } from "react";

type ReactivePrimitiveApiRef<TPrimitive> = {
  _primitive: TPrimitive | null;
  api(): TPrimitive | null;
  init(): TPrimitive | null;
  clear(): void;
};

type PrimitiveAttachment<TPrimitive> = {
  primitive: TPrimitive;
  detach: () => void;
};

type UseReactivePrimitiveOptions<TPrimitive, TProps> = {
  isReady: boolean;
  props: TProps;
  primitiveIdentity: unknown;
  mountPrimitive: (props: TProps) => PrimitiveAttachment<TPrimitive> | null;
};

export const useReactivePrimitive = <TPrimitive, TProps>({
  isReady,
  props,
  primitiveIdentity,
  mountPrimitive,
}: UseReactivePrimitiveOptions<TPrimitive, TProps>) => {
  const propsRef = useRef(props);
  const primitiveIdentityRef = useRef(primitiveIdentity);
  const mountPrimitiveRef = useRef(mountPrimitive);
  const detachCurrentPrimitiveRef = useRef<(() => void) | null>(null);

  propsRef.current = props;
  mountPrimitiveRef.current = mountPrimitive;

  const primitiveApiRef = useRef<ReactivePrimitiveApiRef<TPrimitive>>({
    _primitive: null,
    api() {
      return this._primitive;
    },
    init() {
      if (!this._primitive) {
        const attachment = mountPrimitiveRef.current(propsRef.current);

        if (!attachment) {
          return null;
        }

        detachCurrentPrimitiveRef.current = attachment.detach;
        this._primitive = attachment.primitive;
      }

      return this._primitive;
    },
    clear() {
      if (this._primitive !== null) {
        detachCurrentPrimitiveRef.current?.();
        detachCurrentPrimitiveRef.current = null;
        this._primitive = null;
      }
    },
  });

  useLayoutEffect(() => {
    if (!isReady) {
      return;
    }

    if (primitiveIdentityRef.current !== primitiveIdentity) {
      primitiveApiRef.current.clear();
      primitiveIdentityRef.current = primitiveIdentity;
    }

    primitiveApiRef.current.init();
  }, [isReady, primitiveIdentity]);

  useLayoutEffect(() => {
    return () => {
      primitiveApiRef.current.clear();
    };
  }, []);

  return primitiveApiRef;
};
