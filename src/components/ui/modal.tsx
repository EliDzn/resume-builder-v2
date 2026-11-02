import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

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
      className="modal-scrollbar max-h-4/5 w-9/10 lg:w-3/5 max-w-2xl overflow-y-auto rounded-lg bg-background p-0 text-foreground  backdrop:bg-foreground/50 fixed left-1/2 top-1/2 m-0 -translate-x-1/2 -translate-y-1/2"
    >
      <div className="space-y-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button className="hover:cursor-pointer" onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="space-y-4 text-sm leading-6">{children}</div>
      </div>
    </dialog>
  );
}
