"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { X } from "lucide-react"
import type { ReactNode } from "react"

interface HrmsModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: "sm" | "md" | "lg" | "xl"
}

export function HrmsModal({ isOpen, onClose, title, description, children, footer, size = "md" }: HrmsModalProps) {
  // Map size to width class
  const sizeClasses = {
    sm: "sm:max-w-[425px]",
    md: "sm:max-w-[550px]",
    lg: "sm:max-w-[700px]",
    xl: "sm:max-w-[900px]",
  }

  const widthClass = sizeClasses[size]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={`${widthClass} p-0`}>
        <div className="flex items-center justify-between border-b p-4">
          <DialogHeader className="p-0">
            <DialogTitle>{title}</DialogTitle>
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
          {/* <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button> */}
        </div>
        <div className="p-4">{children}</div>
        {footer && <DialogFooter className="border-t p-4">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}
