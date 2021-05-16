import { useCallback, useEffect, useState } from "react";
import { useHashParam } from "./hookHashParam";

/**
 * Hook for getting/setting a hash param int (safely encoded)
 */
export const useHashParamInt = (
  key: string,
  defaultValue?: number
): [number | undefined, (v: number | undefined) => void] => {
  const [hashParamString, setHashParamString] = useHashParam(
    key,
    defaultValue ? defaultValue.toString() : undefined
  );
  const [hashInt, setHashInt] = useState<number|undefined>(
    hashParamString ? parseInt(hashParamString) : undefined
  );

  // if the hash string value changes
  useEffect(() => {
    setHashInt(hashParamString ? parseInt(hashParamString) : undefined);
  }, [key, hashParamString, setHashInt]);

  const setInt = useCallback(
    (val: number | undefined) => {
      if (val) {
        setHashParamString(val.toString());
      } else {
        setHashParamString(undefined);
      }
    },
    [setHashParamString]
  );

  return [hashInt, setInt];
};
