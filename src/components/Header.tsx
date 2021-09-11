import { FunctionalComponent } from "preact";
import {
  Box,
  Flex,
  Heading,
  Spacer,
  Text,
} from "@chakra-ui/react";
import {
  ButtonHelp,
} from "./ButtonHelp";
import {
  ButtonOptionsMenu,
  Option,
} from "./ButtonOptionsMenu";

const options: Option[] = [
  {
    name: "someoption",
    displayName: "A boolean option",
    default: true,
    type: "boolean",
  },
];

export const Header: FunctionalComponent = () => {
  return (
    <Flex>
      <Flex flexDirection="column">
        <Heading size="md">
          This is a template starter pack metaframe. You can use it right away.
        </Heading>
        <Box w="10px" h="20px" />
        <Text>Documentation: click the help ❔ button ➡️</Text>
      </Flex>

      <Spacer />
      <ButtonHelp />
      <ButtonOptionsMenu options={options} />
    </Flex>
  );
};
