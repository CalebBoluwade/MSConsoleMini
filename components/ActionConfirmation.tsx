import React from "react";
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

interface ActionConfirmationDialogProps {
  // Dialog state
  open: boolean;
  onOpenChange: (open: boolean) => void;

  triggerButtonLabel: string;
  triggerButtonIcon?: React.ReactNode;
  triggerVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  triggerClassName?: string;

  // Dialog content
  dialogTitle: string;
  dialogDescription: string;

  // Action buttons
  cancelButtonLabel?: string;
  actionButtonLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;

  // Loading state
  isLoading?: boolean;

  // Custom trigger (optional - if you want to use your own trigger element)
  customTrigger?: React.ReactNode;
  additionalContent?: React.ReactNode;
}

const ActionConfirmation: React.FC<ActionConfirmationDialogProps> = ({
  open,
  onOpenChange,
  triggerButtonLabel,
  triggerButtonIcon,
  triggerVariant = "outline",
  triggerClassName = "",
  dialogTitle,
  dialogDescription,
  cancelButtonLabel = "Cancel",
  actionButtonLabel = "Continue",
  onConfirm,
  onCancel,
  isLoading = false,
  customTrigger,
  additionalContent,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        {customTrigger || (
          <Button
            variant={triggerVariant}
            className={triggerClassName}
            disabled={isLoading}
          >
            {triggerButtonIcon && (
              <span className="mr-2">{triggerButtonIcon}</span>
            )}
            {triggerButtonLabel}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="space-y-5">
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
        </AlertDialogHeader>

        {additionalContent}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {cancelButtonLabel}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {actionButtonLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ActionConfirmation;
