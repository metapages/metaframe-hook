import stringify from "fast-json-stable-stringify";

export type SetHashParamOpts = {
  modifyHistory?: boolean;
};

export const isIframe = (): boolean => {
  //http://stackoverflow.com/questions/326069/how-to-identify-if-a-webpage-is-being-loaded-inside-an-iframe-or-directly-into-t
  try {
    return window !== window.top;
  } catch (ignored) {
    return false;
  }
};

export const blobToBase64String = (blob: Record<string, any>) => {
  return btoa(stringify(blob));
};

export const blobFromBase64String = (value: string | undefined) => {
  if (value && value.length > 0) {
    const blob = JSON.parse(atob(value));
    return blob;
  }
  return undefined;
};

export const getHashParams = (): [string, Record<string, string>] => {
  return getUrlHashParams(window.location.href);
};

// Get everything after # then after ?
export const getUrlHashParams = (
  url: string
): [string, Record<string, string>] => {
  const urlBlob = new URL(url);
  let hashString = urlBlob.hash.substr(1);
  const queryIndex = hashString.indexOf("?");
  if (queryIndex === -1) {
    return [hashString, {}];
  }
  const preHashString = hashString.substr(0, queryIndex);
  hashString = hashString.substr(queryIndex + 1);
  // @ts-ignore
  const hashObject = Object.fromEntries(
    hashString
      .split("&")
      .filter((s) => s.length > 0)
      .map((s) => s.split("="))
  );
  Object.keys(hashObject).forEach(
    (key) => (hashObject[key] = decodeURI(hashObject[key]))
  );
  return [preHashString, hashObject];
};

export const getHashParamValue = (
  url: string,
  key: string
): string | undefined => {
  const [_, hashParams] = getUrlHashParams(url);
  return hashParams[key];
};

export const getHashParamObject = (
  url: string,
  key: string
): any | undefined => {
  const valueString = getHashParamValue(url, key);
  if (valueString && valueString !== "") {
    const value = JSON.parse(atob(valueString));
    return value;
  }
  return;
};

export const setHashParam = (
  key: string,
  value: string | undefined,
  opts?: SetHashParamOpts
) => {
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
      return `${key}=${encodeURI(paramHash[key])}`;
    })
    .join("&");
  // replace after the ? but keep before that
  let hashString = window.location.hash.substr(1);
  const queryIndex = hashString.indexOf("?");
  let preHashString = "";
  if (queryIndex > -1) {
    preHashString = hashString.substr(0, queryIndex);
  }

  const urlBlob = new URL(window.location.href);
  urlBlob.hash = `${preHashString}?${hash}`;
  if (opts?.modifyHistory) {
    // adds to browser history, so affects back button
    // fires "hashchange" event
    window.location.hash = `${preHashString}?${hash}`;
  } else {
    // The following will NOT work to trigger a 'hashchange' event:
    // Replace the state so the back button works correctly
    window.history.replaceState(
      null,
      document.title,
      `${urlBlob.pathname}${urlBlob.search}${urlBlob.hash}`
    );
    // Manually trigger a hashchange event:
    // I don't know how to add the previous and new url parameters
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  }
};
