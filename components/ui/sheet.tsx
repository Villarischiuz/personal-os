"use client";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "@/lib/icons";
import { cn } from "@/lib/utils";

const Sheet = DialogPrimitive.Root;
const SheetTrigger = DialogPrimitive.Trigger;
const SheetClose = DialogPrimitive.Close;

function SheetOverlay({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm", className)}
      {...props}
    />
  );
}

interface SheetContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
  side?: "bottom" | "right";
}

function SheetContent({ side = "right", className, children, ...props }: SheetContentProps) {
  return (
    <DialogPrimitive.Portal>
      <SheetOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 bg-[hsl(222,47%,7%)] shadow-2xl transition ease-in-out",
          "data-[state=open]:animate-in data-[state=closed]:animate-out duration-300",
          side === "bottom"
            ? "inset-x-0 bottom-0 rounded-t-3xl border-t border-white/12 max-h-[92vh] flex flex-col data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom"
            : "right-0 top-0 h-full w-full max-w-md border-l border-white/12 flex flex-col data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
          className
        )}
        {...props}
      >
        {side === "bottom" && (
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div className="h-1 w-10 rounded-full bg-white/20" />
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 pb-8 pt-4">{children}</div>
        <SheetClose className="absolute right-4 top-4 rounded-lg p-2 text-white/30 hover:text-white/70 transition-colors z-10">
          <X size={16} />
        </SheetClose>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-5", className)} {...props} />;
}

function SheetTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-base font-semibold text-white", className)} {...props} />;
}

export { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetTitle };
