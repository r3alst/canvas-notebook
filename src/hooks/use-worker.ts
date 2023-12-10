import { useEffect, useRef } from "react"
import LayoutWorker from '../workers/layoutWorker?worker'

export const useWorker = <EventType>(
  listener: (this: Worker, ev: MessageEvent<EventType>) => any
) => {
  const worker = useRef(new LayoutWorker())
  // new Worker(new URL(`../workers/layoutWorker.ts?worker&inline`, import.meta.url))

  useEffect(() => {
    worker.current.addEventListener("message", listener)

    return () => {
      worker.current.removeEventListener("message", listener)
    }
  }, [listener])

  return {
    worker: worker.current
  }
}