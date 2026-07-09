/** Shared refresh bus — Brain-backed hooks reload when user logs new evidence. */



const listeners = new Set<() => void>();



export function subscribeBrainDataRefresh(listener: () => void): () => void {

  listeners.add(listener);

  return () => {

    listeners.delete(listener);

  };

}



export function requestBrainDataRefresh(): void {

  listeners.forEach((fn) => fn());

}


