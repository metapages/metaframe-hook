import { FunctionalComponent } from "preact";
import { useEffect, useState, useCallback } from "preact/hooks";
import { useHashParamJson } from "@metapages/metaframe-hook";
import {
  Box,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Grid,
  GridItem,
  IconButton,
  Input,
  Select,
  HStack,
  Spacer,
  Switch,
  Text,
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, SettingsIcon } from "@chakra-ui/icons";

export type OptionType = "string" | "boolean" | "option" | "number";

export type Option = {
  name: string;
  displayName: string;
  default?: string | boolean | number;
  type?: OptionType; // defaults to string
  options?: string[];
  // if the type is "option" and there are suboptions then
  // the suboptions are added to all options
  suboptions?: { [name in string]: Option[] };
  validator?: (val: string | boolean | number) => string | undefined; // undefined == 👍, string is an error message
  map?: (val: string | boolean | number) => any; // convert value to proper type
};

const useOptions = (options: Option[], chosenOptions?: GenericOptions) => {
  const [optionsState, setOptionsState] = useState<Option[]>(options);

  useEffect(() => {
    let newOptions = options.concat([]);
    options.forEach((option) => {
      if (option.type === "option" && option.suboptions && chosenOptions) {
        Object.keys(chosenOptions).forEach((key) => {
          const val = chosenOptions[key] as string | undefined;
          if (val && option?.suboptions?.[val]) {
            newOptions = newOptions.concat(option.suboptions[val]);
          }
        });
      }
    });

    setOptionsState(newOptions);
  }, [chosenOptions, setOptionsState, options]);

  return [optionsState];
};

export const ButtonOptionsMenu: FunctionalComponent<{ options: Option[], hashkey?:string }> = ({
  hashkey,
  options,
}) => {
  const [open, setOpen] = useState<boolean>(false);

  const onClick = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return (
    <>
      <IconButton
        verticalAlign="top"
        aria-label="Metaframe settings"
        // @ts-ignore
        icon={<SettingsIcon />}
        size="lg"
        onClick={onClick}
      />
      <OptionsMenu hashkey={hashkey} isOpen={open} setOpen={setOpen} options={options} />
    </>
  );
};

export type GenericOptions = Record<string, string | boolean | number>;

const OptionsMenu: FunctionalComponent<{
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  options: Option[];
  hashkey?:string;
}> = ({ hashkey, isOpen, setOpen, options }) => {
  // isOpen = false; // for debugging/developing

  const [optionsInHashParams, setOptionsInHashParams] =
    useHashParamJson<GenericOptions>(
      hashkey ? hashkey : "options",
      Object.fromEntries(
        options
          .filter((o) => o.default)
          .map((option) => [option!.name!, option!.default!])
      )
    );

  const [localOptions, setLocalOptions] = useState<GenericOptions>(
    optionsInHashParams || {}
  );

  const [filteredOptions] = useOptions(options, localOptions);

  const [errors, setErrors] = useState<Record<string, string> | undefined>(
    undefined
  );

  const handleOnChange = useCallback(
    (event: any) => {
      const { name, value } = event.target as HTMLInputElement;
      let flattenedOptions = options.concat([]);
      options.forEach((o) => {
        if (o.suboptions) {
          const arrays = Object.values(o.suboptions);
          arrays.forEach(
            (oo) => (flattenedOptions = flattenedOptions.concat(oo))
          );
        }
      });

      const option = flattenedOptions.find((o) => o.name === name) as Option; // assume we always find one since we configured it from options
      // save boolean true as "1"
      if (!option) {
        console.error(`No option found for name=${name}`);
        return;
      }
      if (option.type === "boolean") {
        setLocalOptions({ ...localOptions, [name]: value === "1" });
      } else {
        setLocalOptions({ ...localOptions, [name]: value });
      }
    },
    [localOptions, setLocalOptions, options]
  );

  const onClose = useCallback(() => {
    setOpen(!isOpen);
  }, [setOpen, isOpen]);

  const onCloseAndAccept = useCallback(() => {
    // first validate if available
    const maybeErrors: Record<string, string> = {};
    Object.keys(localOptions).forEach((key) => {
      const option: Option | undefined = options.find((o) => o.name === key);
      if (option && option.validator && option.type !== "boolean") {
        const errorFromOption = option.validator(localOptions[key] as string);
        if (errorFromOption) {
          maybeErrors[key] = errorFromOption;
        }
      }
    });
    if (Object.keys(maybeErrors).length > 0) {
      setErrors(maybeErrors);
      return;
    }
    setErrors(undefined);

    // assume valid!
    // now maybe map to other values
    const convertedOptions: GenericOptions = {};
    Object.keys(localOptions).forEach((key) => {
      const option: Option | undefined = filteredOptions.find(
        (o) => o.name === key
      );
      if (option) {
        if (option.map) {
          convertedOptions[key] = option.map(localOptions[key]);
        } else {
          if (option.type === "boolean") {
            convertedOptions[key] =
              localOptions[key] === true ||
              localOptions[key] === "1" ||
              localOptions[key] === "true";
          } else {
            convertedOptions[key] = localOptions[key];
          }
        }
      } else {
        convertedOptions[key] = localOptions[key];
      }
    });

    setOpen(!isOpen);
    setOptionsInHashParams(convertedOptions);
  }, [
    setOpen,
    isOpen,
    options,
    localOptions,
    filteredOptions,
    setOptionsInHashParams,
    setErrors,
  ]);

  // preact complains in dev mode if this is moved out of a functional component
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyup = (e: KeyboardEvent) => {
      if (e.key === "Enter" && isOpen) onCloseAndAccept();
    };
    window.addEventListener("keyup", onKeyup);
    return () => {
      window.removeEventListener("keyup", onKeyup);
    };
  }, [onCloseAndAccept, isOpen]);

  return (
    <Drawer placement="top" onClose={onCloseAndAccept} isOpen={isOpen}>
      <DrawerOverlay>
        <DrawerContent>
          <DrawerHeader borderBottomWidth="0px">
            Configure metaframe (stored in URL hash params )
          </DrawerHeader>
          <DrawerBody>
            <Box
              maxW="80%"
              p={2}
              borderWidth="4px"
              borderRadius="lg"
              overflow="hidden"
            >
              <Grid templateColumns="repeat(12, 1fr)" gap={6}>
                {filteredOptions.map((option) => (
                  <>
                    <GridItem rowSpan={1} colSpan={4}>
                      <Box
                        w="100%"
                        h="100%"
                        display="flex"
                        alignItems="center"
                        justifyContent="flex-end"
                      >
                        <Text textAlign={"right"} verticalAlign="bottom">
                          {option.displayName || option.name}:
                        </Text>
                      </Box>
                    </GridItem>
                    <GridItem rowSpan={1} colSpan={8}>
                      {" "}
                      {renderInput(
                        option,
                        localOptions[option.name],
                        handleOnChange
                      )}
                    </GridItem>
                  </>
                ))}

                <GridItem rowSpan={1} colSpan={12}></GridItem>
                <GridItem rowSpan={1} colSpan={12}></GridItem>
                <GridItem rowSpan={1} colSpan={12}></GridItem>
                <GridItem rowSpan={1} colSpan={12}>
                  <HStack spacing={2} direction="row">
                    <Spacer />
                    {/*
                      // @ts-ignore */}
                    <IconButton
                      size="lg"
                      color="red"
                      icon={(<CloseIcon />) as any}
                      onClick={onClose}
                    />

                    {/*
                      // @ts-ignore */}
                    <IconButton
                      size="lg"
                      color="green"
                      icon={(<CheckIcon />) as any}
                      onClick={onCloseAndAccept}
                    />
                  </HStack>
                </GridItem>
              </Grid>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};

const renderInput = (option: Option, value: any, onChange: any) => {
  switch (option.type) {
    case "option":
      return (
        <Select
          name={option.name}
          value={value}
          onChange={onChange}
          placeholder="Select option"
        >
          {option.options!.map((optionChoice) => (
            <option value={optionChoice}>{optionChoice}</option>
          ))}
        </Select>
      );
    case "boolean":
      return (
        <Switch
          name={option.name}
          // @ts-ignore
          rightIcon={<CheckIcon />}
          onChange={onChange}
          isChecked={value === true || value === "1"}
          value={value ? 0 : 1}
        />
      );
    default:
      return (
        <Box w="100%" h="10">
          <Input
            name={option.name}
            type="text"
            placeholder=""
            value={value}
            onInput={onChange}
          />
        </Box>
      );
  }
};
