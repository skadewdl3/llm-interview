import { useCallback, useState } from "react";

type GenericFunction<T> = (...args: any[]) => T
type UseAsyncFunctionResult<T> = {
  execute: GenericFunction<Promise<T>>,
  result: T | null,
  loading: boolean,
  error: any
}
export default function useAsyncFunction<T>(asyncFunction: GenericFunction<T>): UseAsyncFunctionResult<T> {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<T | null>(null);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args: any[]) => {
      setLoading(true);
      setError(null);
      try {
        const res = await asyncFunction(...args);
        setResult(res);
        return res;
      } catch (err: any) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  return { execute, result, loading, error };
}
