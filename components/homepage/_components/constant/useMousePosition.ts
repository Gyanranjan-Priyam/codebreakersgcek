import { useState, useEffect, useRef } from "react";

const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const rafId = useRef<number | null>(null);
  const mousePos = useRef({ x: 0, y: 0 });

  const updateMousePosition = (e: MouseEvent) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
    
    if (rafId.current === null) {
      rafId.current = requestAnimationFrame(() => {
        setMousePosition(mousePos.current);
        rafId.current = null;
      });
    }
  };

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  return mousePosition;
};

export default useMousePosition;