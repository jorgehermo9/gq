import { useEffect, useRef } from "react";
import PromiseWorker from "webworker-promise";

const useGq = () => {
  const workerRef = useRef<PromiseWorker>();

  useEffect(() => {
    workerRef.current = new PromiseWorker(
      new Worker(new URL("../lib/gq.ts", import.meta.url))
    );
    return () => workerRef.current?.terminate();
  }, []);

  return workerRef.current;
};

export default useGq;
