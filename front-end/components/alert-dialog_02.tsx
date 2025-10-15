import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

export interface CustomAlertDialogProps {
  triggerText: React.ReactNode;
  title: string;
  description: string;
  onContinue: (e: React.MouseEvent) => void;
  cancelText: string;
  continueText: string;
  triggerProps?: Record<string, any>;
  noRedBorder?: boolean;
}

export function CustomAlertDialog({
  triggerText,
  title,
  description,
  onContinue,
  cancelText,
  continueText,
  triggerProps,
  noRedBorder = false,
}: CustomAlertDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        {...triggerProps}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        className={
          (triggerProps?.className ? triggerProps.className + " " : "") +
          (noRedBorder
            ? "border border-transparent hover:text-red-600 "
            : "border border-red-600 hover:bg-red-700 mt-3 hover:text-red-700")
        }
      >
        {triggerText}
      </Button>
      <Dialog open={open} onOpenChange={(newOpen) => setOpen(newOpen)}>
        <DialogContent className="bg-neutral-900 text-neutral-100 border-neutral-700">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <p>{description}</p>
          <DialogFooter>
            <Button
              variant="outline"
              className="text-black border-neutral-700"
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
            >
              {cancelText}
            </Button>
            <Button
              variant="destructive"
              className="bg-red-700 text-black hover:bg-red-800"
              onClick={(e) => {
                e.stopPropagation();
                onContinue(e);
                setOpen(false);
              }}
            >
              {continueText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
