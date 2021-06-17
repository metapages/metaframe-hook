import { useCallback, useEffect, useState } from "react";
import { useHashParam, SetHashParamOpts } from "./hookHashParam";

/**
 * Hook for getting/setting a hash param int (safely encoded)
 */
export const useHashParamInt = (
  key: string,
  defaultValue?: number
): [
  number | undefined,
  (v: number | undefined, opts?: SetHashParamOpts) => void
] => {
  const [hashParamString, setHashParamString] = useHashParam(
    key,
    defaultValue ? defaultValue.toString() : undefined
  );
  const [hashInt, setHashInt] = useState<number | undefined>(
    hashParamString ? parseInt(hashParamString) : undefined
  );

  // if the hash string value changes
  useEffect(() => {
    setHashInt(hashParamString ? parseInt(hashParamString) : undefined);
  }, [key, hashParamString, setHashInt]);

  const setInt = useCallback(
    (val: number | undefined, opts?: SetHashParamOpts) => {
      if (val) {
        setHashParamString(val.toString(), opts);
      } else {
        setHashParamString(undefined, opts);
      }
    },
    [setHashParamString]
  );

  return [hashInt, setInt];
};
