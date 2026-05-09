import { useEffect, useRef } from "react";

export function useClickOutside(ref, onOutside) {
  const onOutsideRef = useRef(onOutside);
  onOutsideRef.current = onOutside;

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      onOutsideRef.current?.(e);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [ref]);
}
