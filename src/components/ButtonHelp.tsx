import { FunctionalComponent } from "preact";
import { useCallback, useState } from "preact/hooks";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerBody,
  IconButton,
  DrawerCloseButton,
} from "@chakra-ui/react";
import { isIframe } from "@metapages/metaframe-hook";
import { QuestionIcon } from "@chakra-ui/icons";

export const ButtonHelp: FunctionalComponent<{ url?: string }> = ({ url }) => {
  const [open, setOpen] = useState<boolean>(isIframe() ? false : true);

  url = url
    ? url
    : `${window.location.origin}${window.location.pathname}/README.md`;

  const onClick = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return (
    <>
      <IconButton
        verticalAlign="top"
        aria-label="Help"
        // @ts-ignore
        icon={<QuestionIcon />}
        size="lg"
        onClick={onClick}
        mr="4"
      />
      <HelpPanel url={url} isOpen={open} setOpen={setOpen} />
    </>
  );
};

const HelpPanel: FunctionalComponent<{
  url: string;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}> = ({ isOpen, setOpen, url }) => {
  const onClose = useCallback(() => {
    setOpen(!isOpen);
  }, [setOpen, isOpen]);

  const onOverlayClick = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const iframeUrl = `https://metapages.github.io/metaframe-markdown/#?url=${url}`;

  return (
    <Drawer
      size="full"
      placement="top"
      onClose={onClose}
      isOpen={isOpen}
      onOverlayClick={onOverlayClick}
    >
      <DrawerOverlay>
        <DrawerContent>
          <DrawerCloseButton size="lg" bg="gray.100" />
          <DrawerBody>
            <iframe width="100%" height="100%" src={iframeUrl} />
          </DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};
