"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2 } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  variant?: "default" | "destructive"
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  variant = "destructive"
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            {variant === "destructive" && (
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
              </div>
            )}
            <div className="flex-1">
              <AlertDialogTitle className="text-lg font-semibold">
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-muted-foreground mt-1">
                {description}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="sm:w-auto">
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={onConfirm}
              className="sm:w-auto"
            >
              {confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}