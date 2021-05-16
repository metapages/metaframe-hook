import { useCallback, useEffect, useState } from "react";
import { useHashParam } from "./hookHashParam";

/**
 * Hook for getting/setting a hash param float (safely encoded)
 */
export const useHashParamFloat = (
  key: string,
  defaultValue?: number
): [number | undefined, (v: number | undefined) => void] => {
  const [hashParamString, setHashParamString] = useHashParam(
    key,
    defaultValue ? defaultValue.toString() : undefined
  );
  const [hashNumber, setHashNumber] = useState<number|undefined>(
    hashParamString ? parseFloat(hashParamString) : undefined
  );

  // if the hash string value changes
  useEffect(() => {
    setHashNumber(hashParamString ? parseFloat(hashParamString) : undefined);
  }, [key, hashParamString, setHashNumber]);

  const setNumber = useCallback(
    (val: number | undefined) => {

      if (val) {
        setHashParamString(val.toString());
      } else {
        setHashParamString(undefined);
      }
    },
    [setHashParamString]
  );

  return [hashNumber, setNumber];
};
