DEPRECATED: use [@metapages/metaframe-react](https://www.npmjs.com/package/@metapages/metaframe-react) instead

# @metapages/metaframe-react-hook

Use hooks to interact with [metaframe](https://docs.metapage.io/) inputs and outputs

## Installation

```sh
npm i @metapages/metaframe-react-hook
```

## Usage: [metaframe](https://docs.metapage.io/) inputs + outputs in a react app

Example listening to inputs and setting outputs:

First in your main root render:


```typescript
render(
    <WithMetaframe>
      <App />
    </WithMetaframe>,
  document.getElementById("root")!
);
```

Then anywhere else:


```typescript

import {
  MetaframeObject,
  useMetaframe,
} from "@metapages/metaframe-react-hook";


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
<!-- 
## Examples:

In the repo: https://github.com/metapages/metaframe-js

1. Setup [metaframe](https://docs.metapage.io/) provider: https://github.com/metapages/metaframe-javascript/blob/main/src/index.tsx
2. Access [metaframe](https://docs.metapage.io/) inputs/outputs: https://github.com/metapages/metaframe-javascript/blob/main/src/hooks/useExecuteCodeWithMetaframe.ts
3. See [live example](https://app.metapages.org/#?definition=IntcbiAgXCJ2ZXJzaW9uXCI6IFwiMC4zXCIsXG4gIFwibWV0YVwiOiB7XG4gICAgXCJsYXlvdXRzXCI6IHtcbiAgICAgIFwiZmxleGJveGdyaWRcIjoge1xuICAgICAgICBcImRvY3NcIjogXCJodHRwOi8vZmxleGJveGdyaWQuY29tL1wiLFxuICAgICAgICBcImxheW91dFwiOiBbXG4gICAgICAgICAgW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICBcIm5hbWVcIjogXCJnZW5lcmF0ZVwiLFxuICAgICAgICAgICAgICBcIndpZHRoXCI6IFwiY29sLXhzLTNcIixcbiAgICAgICAgICAgICAgXCJzdHlsZVwiOiB7XG4gICAgICAgICAgICAgICAgXCJtYXhIZWlnaHRcIjogXCI2MDBweFwiLFxuICAgICAgICAgICAgICAgIFwib3ZlcmZsb3dZXCI6IFwiaGlkZGVuXCJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgXCJuYW1lXCI6IFwiamF2YXNjcmlwdFwiLFxuICAgICAgICAgICAgICBcIndpZHRoXCI6IFwiY29sLXhzLTdcIlxuICAgICAgICAgICAgfVxuICAgICAgICAgIF1cbiAgICAgICAgXVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgXCJtZXRhZnJhbWVzXCI6IHtcbiAgICBcImdlbmVyYXRlXCI6IHtcbiAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9tZXRhcGFnZXMuZ2l0aHViLmlvL21ldGFmcmFtZS1nZW5lcmF0b3IvIz9vcHRpb25zPWV5Sm1jbVZ4ZFdWdVkza2lPakl3TENKa2FYTjBjbWxpZFhScGIyNGlPaUp6YVc0aUxDSnBibU55WlcxbGJuUWlPakF1TVgwPVwiXG4gICAgfSxcbiAgICBcImphdmFzY3JpcHRcIjoge1xuICAgICAgXCJ1cmxcIjogXCJodHRwczovL21ldGFwYWdlcy5naXRodWIuaW8vbWV0YWZyYW1lLWphdmFzY3JpcHQvIz9vcHRpb25zPWV5SnRiMlJsSWpvaWFtRjJZWE5qY21sd2RDSXNJblJvWlcxbElqb2liR2xuYUhRaUxDSm9hV1JsWldScGRHOXlJanBtWVd4elpYMCZ0ZXh0PVkyOXVjM1FnWkdsemNHOXpaWEp6SUQwZ1cxMDdDZ3BqYjI1emRDQnliMjkwSUQwZ1pHOWpkVzFsYm5RdVoyVjBSV3hsYldWdWRFSjVTV1FvSjNKbGJtUmxjaWNwT3dwM2FHbHNaU0FvY205dmRDNW1hWEp6ZEVOb2FXeGtLU0I3Q2lBZ0lDQnliMjkwTG5KbGJXOTJaVU5vYVd4a0tISnZiM1F1YkdGemRFTm9hV3hrS1RzS0lDQjlDblpoY2lCallXNTJZWE1nUFNCa2IyTjFiV1Z1ZEM1amNtVmhkR1ZGYkdWdFpXNTBLQ2RqWVc1MllYTW5LVHNLWTJGdWRtRnpMbmRwWkhSb0lEMGdNakF3T3dwallXNTJZWE11YUdWcFoyaDBJRDBnTWpBd093cHliMjkwTG1Gd2NHVnVaRU5vYVd4a0tHTmhiblpoY3lrN0NncGpiMjV6ZENCamRIZ2dQU0JqWVc1MllYTXVaMlYwUTI5dWRHVjRkQ2duTW1RbktUc0tZMjl1YzNRZ1czY3NJR2hkSUQwZ1d5QXlNQ3dnWTJGdWRtRnpMbWhsYVdkb2RDQmRPd3BqYjI1emRDQmJlQ3dnZVYwZ1BTQmJZMkZ1ZG1GekxuZHBaSFJvSUM4Z01pd2dZMkZ1ZG1GekxtaGxhV2RvZENBdklESmRPd3BqYjI1emIyeGxMbXh2WnlnbmMzUjFabVluS1FwamIyNXpkQ0JrY21GM0lEMGdLSEpoWkNrZ1BUNGdld29nSUNBZ1kzUjRMbU5zWldGeVVtVmpkQ2d3TENBd0xDQmpZVzUyWVhNdWQybGtkR2dzSUdOaGJuWmhjeTVvWldsbmFIUXBPd29LSUNBZ0lDOHZJR1pwY25OMElITmhkbVVnZEdobElIVnVkSEpoYm5Oc1lYUmxaQzkxYm5KdmRHRjBaV1FnWTI5dWRHVjRkQW9nSUNBZ1kzUjRMbk5oZG1Vb0tUc0tDaUFnSUNCamRIZ3VZbVZuYVc1UVlYUm9LQ2s3Q2lBZ0lDQXZMeUJ0YjNabElIUm9aU0J5YjNSaGRHbHZiaUJ3YjJsdWRDQjBieUIwYUdVZ1kyVnVkR1Z5SUc5bUlIUm9aU0J5WldOMENpQWdJQ0JqZEhndWRISmhibk5zWVhSbEtIZ2dMQ0JvSUM4Z01pazdDaUFnSUNBdkx5QnliM1JoZEdVZ2RHaGxJSEpsWTNRS0lDQWdJR04wZUM1eWIzUmhkR1VvY21Ga0tUc0tDaUFnSUNBdkx5QmtjbUYzSUhSb1pTQnlaV04wSUc5dUlIUm9aU0IwY21GdWMyWnZjbTFsWkNCamIyNTBaWGgwQ2lBZ0lDQmpkSGd1Y21WamRDZ3RkeUF2SURJc0lDMW9JQzhnTWl3Z2R5d2dhQ2s3Q2dvZ0lDQWdZM1I0TG1acGJHeFRkSGxzWlNBOUlDSmliSFZsSWpzS0lDQWdJR04wZUM1bWFXeHNLQ2s3Q2dvZ0lDQWdZM1I0TG5KbGMzUnZjbVVvS1RzS2ZRb0tMeThnVEdsemRHVnVJSFJ2SUdGdUlHbHVjSFYwQ21ScGMzQnZjMlZ5Y3k1d2RYTm9LRzFsZEdGbWNtRnRaUzV2YmtsdWNIVjBLQ0p5WVdScFlXNXpJaXdnWkhKaGR5a3BPd29LTHk4Z1VtVjBkWEp1SUdFZ1kyeGxZVzUxY0NCbWRXNWpkR2x2YmdweVpYUjFjbTRnS0NrZ1BUNGdld29nSUNBZ2QyaHBiR1VvWkdsemNHOXpaWEp6TG14bGJtZDBhQ0ErSURBcElIc0tJQ0FnSUNBZ0lDQmthWE53YjNObGNuTXVjRzl3S0Nrb0tUc0tJQ0FnSUgwS2ZRPT1cIixcbiAgICAgIFwiaW5wdXRzXCI6IFtcbiAgICAgICAge1xuICAgICAgICAgIFwibWV0YWZyYW1lXCI6IFwiZ2VuZXJhdGVcIixcbiAgICAgICAgICBcInNvdXJjZVwiOiBcInZcIixcbiAgICAgICAgICBcInRhcmdldFwiOiBcInJhZGlhbnNcIlxuICAgICAgICB9XG4gICAgICBdXG4gICAgfVxuICB9LFxuICBcInBsdWdpbnNcIjogW1xuICAgIFwiaHR0cHM6Ly9tZXRhcGFnZXMuZ2l0aHViLmlvL21ldGFmcmFtZS1lZGl0b3IvXCJcbiAgXVxufSI=) -->
