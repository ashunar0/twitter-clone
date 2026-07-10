import type { ComponentProps } from "react";
import { Dialog } from "./dialog";

type RootProps = Omit<ComponentProps<typeof Dialog.Root>, "role">;

function Root(props: RootProps) {
  return <Dialog.Root role="alertdialog" {...props} />;
}

export const AlertDialog = {
  ...Dialog,
  Root,
};
