import { useEffect, useRef } from "react";

const useWorker = (callback: (event: MessageEvent) => void) => {
  const workerRef = useRef<Worker>();

  useEffect(() => {
    workerRef.current = new Worker(
      new URL("../lib/worker.ts", import.meta.url)
    );
    workerRef.current.onmessage = callback;
    return () => workerRef.current?.terminate();
  }, [callback]);

  return workerRef.current;
};

export default useWorker;
