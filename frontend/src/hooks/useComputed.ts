import { useEffect, useState } from "react";

export default function useComputed<T>(computeFn: () => T, dependencies: any[]) {
  const [computedValue, setComputedValue] = useState(() => computeFn());

  useEffect(() => {
    setComputedValue(computeFn());
  }, dependencies);

  return computedValue;
}

