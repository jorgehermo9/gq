import { useEffect, useRef } from "react";
import PromiseWorker from "webworker-promise";

const useFormat = () => {
  const workerRef = useRef<PromiseWorker>();

  useEffect(() => {
    workerRef.current = new PromiseWorker(
      new Worker(new URL("../lib/format.ts", import.meta.url))
    );
    return () => workerRef.current?.terminate();
  }, []);

  return workerRef.current;
};

export default useFormat;
