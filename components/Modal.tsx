import { JSX } from "preact";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: JSX.Element | JSX.Element[] | string;
}

export default function Modal(
  { isOpen, onClose, title, children }: ModalProps,
) {
  if (!isOpen) return null;

  return (
    <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-background rounded-12 shadow-xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
        <div class="p-4 border-b border-border flex justify-between items-center">
          <h3 class="text-lg font-medium text-foreground">{title}</h3>
          <button
            onClick={onClose}
            class="text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        <div class="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}
