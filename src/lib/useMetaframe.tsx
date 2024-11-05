import React, { useContext, useEffect, useState, createContext } from "react";
import { Metaframe, MetaframeInputMap, isIframe } from "@metapages/metapage";

export interface MetaframeObject {
  // This is only set when initialized
  metaframe?: Metaframe;
}

export interface MetaframeAndInputsObject extends MetaframeObject {
  inputs: MetaframeInputMap;
  setOutputs?: (outputs: MetaframeInputMap) => void;
}

const defaultMetaframeAndInputsObject: MetaframeAndInputsObject = {
  inputs: {},
};

const defaultMetaframeObject: MetaframeObject = {};

export const MetaframeContext = createContext<MetaframeObject>(
  defaultMetaframeObject
);
export const MetaframeAndInputsContext =
  createContext<MetaframeAndInputsObject>(defaultMetaframeAndInputsObject);

export const useMetaframe = () => {
  return useContext(MetaframeContext);
};

export const useMetaframeAndInput = () => {
  return useContext(MetaframeAndInputsContext);
};

/**
 * For convenience, return inputs as they arrive as hooks.
 * If performance is a concern, use WithMetaframe and listen
 * to the inputs yourself (as implemented here, but not updating
 * a hook function every single input update)
 *
 * @returns
 */
export const WithMetaframeAndInputs: React.FC<any> = (props: any) => {
  const [metaframeObject, setMetaframeObject] =
    useState<MetaframeAndInputsObject>({
      inputs: {},
    });
  const [metaframe, setMetaframe] = useState<Metaframe | undefined>(undefined);
  const [inputs, setInputs] = useState<MetaframeInputMap>(
    metaframeObject.inputs
  );

  useEffect(() => {
    let cancelled = false;
    const newMetaframe = new Metaframe();
    const disposeListener = newMetaframe.onInputs((newinputs: MetaframeInputMap): void => {
      setInputs(newinputs);
    });
    // if we are an iframe, wait until connected before setting the metaframe
    if (isIframe()) {
      (async () => {
        await newMetaframe.connected();
        if (!cancelled) {
          setMetaframe(newMetaframe);
        }
      })();
    } else {
      // no iframe so cannot connect so just set right away
      setMetaframe(newMetaframe);
    }

    return () => {
      cancelled = true;
      // If the metaframe is cleaned up, also remove the inputs listener
      disposeListener();
      newMetaframe.dispose();
    };
  }, []);

  useEffect(() => {
    if (!metaframe) {
      return;
    }
    setMetaframeObject({
      metaframe,
      inputs,
      setOutputs: metaframe?.setOutputs,
    });
  }, [inputs, metaframe]);

  return (
    <MetaframeAndInputsContext.Provider value={metaframeObject}>
      {props.children}
    </MetaframeAndInputsContext.Provider>
  );
};

export const WithMetaframe: React.FC<any> = (props: any) => {
  const [metaframeObject, setMetaframeObject] = useState<MetaframeObject>({});
  const [metaframe, setMetaframe] = useState<Metaframe | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    const newMetaframe = new Metaframe();
    // if we are an iframe, wait until connected before setting the metaframe
    if (isIframe()) {
      (async () => {
        await newMetaframe.connected();
        if (!cancelled) {
          setMetaframe(newMetaframe);
        }
      })();
    } else {
      // no iframe so cannot connect so just set right away
      setMetaframe(newMetaframe);
    }

    return () => {
      cancelled = true;
      newMetaframe.dispose();
    };
  }, []);

  useEffect(() => {
    if (metaframe) {
      setMetaframeObject({
        metaframe,
      });
    }
  }, [metaframe]);

  return (
    <MetaframeContext.Provider value={metaframeObject}>
      {props.children}
    </MetaframeContext.Provider>
  );
};
