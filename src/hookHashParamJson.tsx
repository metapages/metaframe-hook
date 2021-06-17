import { useCallback, useEffect, useState } from "react";
import { useHashParam, SetHashParamOpts } from "./hookHashParam";

/**
 * Hook for getting/setting a hash param JSON blob (safely encoded)
 */
export const useHashParamJson = <T,>(
  key: string,
  defaultBlob?: T
): [T | undefined, (v: T | undefined, opts?: SetHashParamOpts) => void] => {
  const [hashParamString, setHashParamString] = useHashParam(
    key,
    defaultBlob ? blobToBase64String(defaultBlob) : undefined
  );
  const [hashBlob, setHashBlob] = useState<T>(
    blobFromBase64String(hashParamString)
  );

  // if the hash string value changes
  useEffect(() => {
    setHashBlob(blobFromBase64String(hashParamString));
  }, [key, hashParamString, setHashBlob]);

  const setJsonBlob = useCallback(
    (blob: T | undefined, opts?: SetHashParamOpts) => {
      if (blob === null || blob === undefined) {
        setHashParamString(undefined, opts);
      } else {
        const base64Json = blobToBase64String(blob);
        setHashParamString(base64Json, opts);
      }
    },
    [setHashParamString]
  );

  return [hashBlob, setJsonBlob];
};

export const blobToBase64String = (blob: Record<string, any>) => {
  return btoa(JSON.stringify(blob));
};

export const blobFromBase64String = (value: string | undefined) => {
  if (value && value.length > 0) {
    try {
      const blob = JSON.parse(atob(value));
      return blob;
    } catch (err) {
      console.error(err);
    }
  }
  return undefined;
};
