# @metapages/metaframe-hook

Use hooks to interact with metaframe inputs and outputs

Also useful hooks for getting/setting parameters into the URL hash parameters

## Installation

```sh
npm i @metapages/metaframe-hook
```

## Usage: metaframe inputs + outputs

Example listening to inputs and setting outputs:

```typescript

import {
  MetaframeObject,
  useMetaframe,
} from "@metapages/metaframe-hook";


export const App: FunctionalComponent = () => {

  // a nice hook handles all the metaframe machinery
  const metaframeObj: MetaframeObject = useMetaframe();

  // Respond to new inputs two ways:
  //   1) this listening mode is bound to reacts render hooks. It is convenient, but less efficient
  useEffect(() => {
    console.log(`I got new inputs from some other metaframe! ${inputs}`);
  }, [metaframeObj.inputs]);

  // Respond to new inputs two ways:
  //   2) bind the listener and cleanup
  useEffect(() => {
    if (!metaframeObj.metaframe) {
      return;
    }
    const disposer = metaframeObj.metaframe.onInput("someInputName", (inputValue) => {
      console.log(`I got new inputs from on channel someInputName! ${inputValue}`);
    });

    return () => {
      disposer();
    }

  }, [metaframeObj.metaframe]);

  // somewhere set outputs
  if (metaframeObj.setOutputs) {
      metaframeObj.setOutputs({"some": "outputs"})
  }

  // let the metapage know we are going to modify our own hash params from user interaction
  useEffect(() => {
    if (metaframeObj.metaframe) {
      metaframeObj.metaframe.notifyOnHashUrlChange();
    }
  }, [metaframeObj.metaframe]);

  // Just render the inputs
  return <div> {metaframeObj.inputs} </div>
}

```

## Usage: metaframe hash params

See code in https://github.com/metapages/metaframe-editor
