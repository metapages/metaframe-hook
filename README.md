
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
  useHashParamJson,
  useHashParamBase64,
  useHashParam,
} from "@metapages/metaframe-hook";


export const App: FunctionalComponent = () => {

  // a nice hook handles all the metaframe machinery
  const metaframe: MetaframeObject = useMetaframe();

  // respond to new inputs
  // let the metapage know we are going to modify our own hash params from user interaction
  useEffect(() => {
    console.log(`I got new inputs from some other metaframe! ${inputs}`);
  }, [metaframe.inputs]);

  // somewhere set outputs
  if (metaframe.setOutputs) {
      metaframe.setOutputs({"some": "outputs"})
  }

  // let the metapage know we are going to modify our own hash params from user interaction
  useEffect(() => {
    if (metaframe.metaframe) {
      metaframe.metaframe.notifyOnHashUrlChange();
    }
  }, [metaframe.metaframe]);

  // Just render the inputs
  return <div> {metaframe.inputs} </div>
}

```

## Usage: metaframe hash params

See code in https://github.com/metapages/metaframe-editor
