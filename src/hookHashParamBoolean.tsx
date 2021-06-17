import { useCallback, useEffect, useState } from "react";
import { useHashParam, SetHashParamOpts } from "./hookHashParam";

/**
 * Hook for getting/setting a hash param boolean (safely encoded)
 */
export const useHashParamBoolean = (
  key: string,
  defaultValue?: boolean
): [
  boolean | undefined,
  (v: boolean | undefined, opts?: SetHashParamOpts) => void
] => {
  const [hashParamString, setHashParamString] = useHashParam(
    key,
    defaultValue ? `${defaultValue}` : undefined
  );
  const [hashBoolean, setHashBoolean] = useState<boolean>(
    hashParamString === "true" ? true : false
  );

  // if the hash string value changes
  useEffect(() => {
    setHashBoolean(hashParamString === "true");
  }, [key, hashParamString, setHashBoolean]);

  const setBoolean = useCallback(
    (val: boolean | undefined, opts?: SetHashParamOpts) => {
      if (val === null || val === undefined || val === false) {
        setHashParamString(undefined, opts);
      } else {
        setHashParamString("true", opts);
      }
    },
    [setHashParamString]
  );

  return [hashBoolean, setBoolean];
};
