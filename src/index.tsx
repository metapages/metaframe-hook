import { render } from "preact";
import { WithMetaframe } from "@metapages/metaframe-hook";
import { ChakraProvider } from "@chakra-ui/react";
import { App } from "./App";

render(
  <ChakraProvider>
    <WithMetaframe>
      <App />
    </WithMetaframe>
  </ChakraProvider>,
  document.getElementById("root")!
);
