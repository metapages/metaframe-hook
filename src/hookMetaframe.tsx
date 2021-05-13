// Can we export a react AND preact compatible module?
import React, { useContext, useEffect, useState, createContext } from "react";
import { Metaframe, MetaframeInputMap } from "@metapages/metapage";

export interface MetaframeObject {
  inputs: MetaframeInputMap;
  setOutputs?: (outputs: MetaframeInputMap) => void;
  // This is only set when initialized
  metaframe?: Metaframe;
}

const defaultMetaframeObject: MetaframeObject = {
  inputs: {},
};

export const MetaframeContext = createContext<MetaframeObject>(
  defaultMetaframeObject
);

export const useMetaframe = () => {
  return useContext(MetaframeContext);
};

export const WithMetaframe: React.FC<any> = (props: any) => {
  const [metaframeObject, setMetaframeObject] = useState<MetaframeObject>({
    inputs: {},
  });
  const [metaframe, setMetaframe] = useState<Metaframe | undefined>(undefined);
  const [inputs, setInputs] = useState<MetaframeInputMap>(
    metaframeObject.inputs
  );

  useEffect(() => {
    const newMetaframe = new Metaframe();
    const onInputs = (newinputs: MetaframeInputMap): void => {
      setInputs(newinputs);
    };
    newMetaframe.onInputs(onInputs);
    setMetaframe(newMetaframe);
    return () => {
      // If the metaframe is cleaned up, also remove the inputs listener
      newMetaframe.removeListener(Metaframe.INPUTS, onInputs);
      newMetaframe.dispose();
    };
  }, [setMetaframe, setInputs]);

  useEffect(() => {
    if (inputs && metaframe) {
      setMetaframeObject({
        metaframe,
        inputs,
        setOutputs: metaframe.setOutputs,
      });
    }
  }, [inputs, metaframe]);

  return (
    <MetaframeContext.Provider value={metaframeObject}>
      {props.children}
    </MetaframeContext.Provider>
  );
};
