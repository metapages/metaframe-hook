export * from "./hookHashParam";
export * from "./hookHashParamBase64";
export * from "./hookHashParamBoolean";
export * from "./hookHashParamFloat";
export * from "./hookHashParamInt";
export * from "./hookHashParamJson";
export * from "./hookMetaframe";

export const isIframe = (): boolean => {
  //http://stackoverflow.com/questions/326069/how-to-identify-if-a-webpage-is-being-loaded-inside-an-iframe-or-directly-into-t
  try {
    return window !== window.top;
  } catch (ignored) {
    return false;
  }
};

export const getHashParamValue = (
  url: string,
  key: string
): string | undefined => {
  const urlBlob = new URL(url);
  let hashString = urlBlob.hash;
  const queryIndex = hashString.indexOf("?");
  if (queryIndex === -1) {
    return;
  }
  hashString = hashString.substr(queryIndex + 1);
  const params = new URLSearchParams(hashString);
  if (params.has(key)) {
    const value = params.get(key);
    if (value) {
      return value;
    }
  }
  return;
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
