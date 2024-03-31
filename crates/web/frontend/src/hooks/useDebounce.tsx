import { useEffect, useRef } from "react";

const useDebounce = (
  callback: Function,
  delay: number,
  dependencies: any[]
) => {
  const timer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timer.current && clearTimeout(timer.current);
    timer.current = setTimeout(() => callback(), delay);
  }, [...dependencies]);
};

export default useDebounce;
