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
  const hashSearchParams = urlBlob.searchParams;
  if (hashSearchParams.has(key)) {
    const value = hashSearchParams.get("definition");
    if (value) {
      return value;
    }
  }
  return;
};

export const getHashParamObject = <T>(
  url: string,
  key: string
): T | undefined => {
  const valueString = getHashParamValue(url, key);
  if (valueString && valueString !== "") {
    const value = JSON.parse(valueString);
    return value;
  }
  return;
};
