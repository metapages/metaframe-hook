import { useCallback, useEffect, useState } from "react";

/**
 * Hook for getting/setting hash params
 */
export const useHashParam = (
  key: string,
  defaultValue?: string
): [string | undefined, (v: string | undefined) => void] => {
  const [hashParam, setHashParamInternal] = useState<string | undefined>(
    getHashParams()[1][key] || defaultValue
  );

  useEffect(() => {
    const onHashChange = (_: HashChangeEvent) => {
      const paramHash = getHashParams()[1];
      setHashParamInternal(paramHash[key]);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const setParam: (v: string | undefined) => void = useCallback(
    (value: string | undefined) => {
      const paramHash = getHashParams()[1];

      let changed = false;
      if (
        (paramHash.hasOwnProperty(key) && value === null) ||
        value === undefined
      ) {
        delete paramHash[key];
        changed = true;
      } else {
        if (paramHash[key] !== value) {
          paramHash[key] = value;
          changed = true;
        }
      }

      // don't do work if unneeded
      if (!changed) {
        return [];
      }

      const keys = Object.keys(paramHash);
      keys.sort();
      const hash = keys
        .map((key, i) => {
          return `${key}=${paramHash[key]}`;
        })
        .join("&");
      // replace after the ? but keep before that
      let hashString = window.location.hash.substr(1);
      const queryIndex = hashString.indexOf("?");
      let preHashString = "";
      if (queryIndex > -1) {
        preHashString = hashString.substr(0, queryIndex);
      }

      window.location.hash = `${preHashString}?${hash}`
      // The following will NOT work to trigger a 'hashchange' event:
      // Replace the state so the back button works correctly
      // const urlBlob = new URL(window.location.href);
      // urlBlob.hash = `${preHashString}?${hash}`;
      // window.history.replaceState(
      //   null,
      //   document.title,
      //   `${urlBlob.pathname}${urlBlob.search}${urlBlob.hash}`
      // );
    },
    []
  );

  return [hashParam, setParam];
};

// Get everything after # then after ?
export const getHashParams = (): [string, Record<string, string>] => {
  let hashString = window.location.hash.substr(1);
  const queryIndex = hashString.indexOf("?");
  if (queryIndex === -1) {
    return [hashString, {}];
  }
  const preHashString = hashString.substr(0, queryIndex);
  hashString = hashString.substr(queryIndex + 1);
  const hashObject = Object.fromEntries(
    hashString
      .split("&")
      .filter((s) => s.length > 0)
      .map((s) => s.split("="))
  );
  return [preHashString, hashObject];
};
