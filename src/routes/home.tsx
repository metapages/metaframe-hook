import { FunctionalComponent } from "preact";
import {
  SimpleGrid,
} from "@chakra-ui/react";
import { Header } from "/@/components/Header";

export const Route: FunctionalComponent = () => (
  <SimpleGrid columns={1} spacing={10}>
    <Header />
  </SimpleGrid>
);
