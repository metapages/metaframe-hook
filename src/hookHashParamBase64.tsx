import { useCallback, useEffect, useState } from "react";
import { useHashParam } from "./hookHashParam";

/**
 * Hook for getting/setting hash param string value, but base64 encoded
 * because it might be complex text
 */
export const useHashParamBase64 = (
  key: string,
  defaultValue?: string
): [string | undefined, (v: string | undefined) => void] => {
  const [hashParamString, setHashParamString] = useHashParam(
    key,
    defaultValue ? stringToBase64String(defaultValue) : undefined
  );
  const [decodedString, setDecodedString] = useState<string | undefined>(
    defaultValue
  );

  // if the hash string value changes
  useEffect(() => {
    setDecodedString(stringFromBase64String(hashParamString));
  }, [key, hashParamString, setDecodedString]);

  const encodeAndSetStringParam = useCallback(
    (rawString: string | undefined) => {
      if (rawString === null || rawString === undefined) {
        setHashParamString(undefined);
      } else {
        const base64Json = stringToBase64String(rawString);
        setHashParamString(base64Json);
      }
    },
    [setHashParamString]
  );

  return [decodedString, encodeAndSetStringParam];
};

export const stringToBase64String = (value: string) => {
  return btoa(value);
};

export const stringFromBase64String = (value: string | undefined) => {
  if (value && value.length > 0) {
    return atob(value);
  }
  return undefined;
};
