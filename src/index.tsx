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
