import { useEffect, useRef, useState } from "react";

export function useOverflowDetect<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) {
      return;
    }

    const checkOverflow = () => {
      setIsOverflowing(element.scrollHeight > element.clientHeight);
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(checkOverflow);
    resizeObserver.observe(element);

    const mutationObserver = new MutationObserver(checkOverflow);
    mutationObserver.observe(element, {
      childList: true,
      subtree: true,
      attributes: true
    });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);

  return { ref, isOverflowing };
}
