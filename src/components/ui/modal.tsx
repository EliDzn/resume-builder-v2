import { useEffect, useRef, type ReactNode } from "react";
import Button from "./button";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="max-h-[85vh] w-11/12 max-w-2xl overflow-y-auto rounded-lg border border-foreground bg-background p-0 text-foreground shadow-xl backdrop:bg-black/50"
    >
      <div className="space-y-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="Secondary" onClick={onClose}>
            Close
          </Button>
        </div>

        <div className="space-y-4 text-sm leading-6">{children}</div>
      </div>
    </dialog>
  );
}
