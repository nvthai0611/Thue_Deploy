import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import React from "react";

interface CustomAlertDialogProps {
  triggerText: React.ReactNode;
  title: string;
  description: string;
  onContinue: () => void;
  cancelText?: string;
  continueText?: string;
  triggerProps?: React.ComponentProps<typeof Button>;
  triggerClassName?: string;
}

export function CustomAlertDialog({
  triggerText,
  title,
  description,
  onContinue,
  cancelText = "Cancel",
  continueText = "Continue",
  triggerProps,
  triggerClassName,
}: CustomAlertDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          {...triggerProps}
          className={`bg-red-500 text-white hover:bg-red-600 ${triggerClassName}`}
        >
          {triggerText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-red-600">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onContinue}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {continueText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
