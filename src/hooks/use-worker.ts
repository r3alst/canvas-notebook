import { useCallback, useEffect, useRef, useState } from "react";
import LayoutWorker from "../workers/layoutWorker?worker";

export const useWorker = <EventType>(
  listener: (this: Worker, ev: MessageEvent<EventType>) => any
) => {
  const worker = useRef(new LayoutWorker());
  const [processing, setProcessing] = useState(false);
  // new Worker(new URL(`../workers/layoutWorker.ts?worker&inline`, import.meta.url))

  useEffect(() => {
    const _listener = (ev: MessageEvent<EventType>) => {
      setProcessing(false);
      listener.bind(worker.current, ev)();
      // Destroying previous worker
      const _worker = worker.current;
      worker.current = new LayoutWorker();
      _worker.terminate();
      worker.current.addEventListener("message", _listener);
    };
    worker.current.addEventListener("message", _listener);

    return () => {
      worker.current.removeEventListener("message", _listener);
    };
  }, [listener, setProcessing]);

  const postMessage = useCallback(
    (message: EventType) => {
      setProcessing(true);
      worker.current.postMessage(message);
    },
    [setProcessing]
  );

  return {
    worker,
    processing,
    postMessage,
  };
};
