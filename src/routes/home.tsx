import { FunctionalComponent } from "preact";
import { useContext } from "preact/hooks";
import { MetaframeContext } from "@metapages/metaframe-hook";
import { Badge } from "@chakra-ui/react"

export const Home: FunctionalComponent = () => {
    const metaframe = useContext(MetaframeContext);
    return <div><Badge>metaframe inputs:</Badge> {metaframe ? JSON.stringify(metaframe.inputs) : "none yet"}</div>;
};
