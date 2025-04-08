import { ComponentChildren } from "preact";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ComponentChildren;
  footer?: ComponentChildren;
}

export default function Modal(
  { isOpen, onClose, title, children, footer }: ModalProps,
) {
  if (!isOpen) return null;

  return (
    <div
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          class="fixed inset-0 transition-opacity bg-background/80 backdrop-blur-sm"
          aria-hidden="true"
          onClick={onClose}
        >
        </div>

        {/* Modal panel */}
        <div class="inline-block w-full max-w-lg p-0 my-8 overflow-hidden text-left align-middle transition-all transform bg-card border border-border rounded-12 shadow-xl sm:align-middle sm:max-w-lg">
          <div class="relative">
            {/* Header */}
            <div class="flex items-center justify-between p-4 sm:p-6 border-b border-border">
              <h3
                class="text-lg sm:text-xl font-semibold text-card-foreground"
                id="modal-title"
              >
                {title}
              </h3>
              <button
                type="button"
                class="text-muted-foreground hover:text-foreground p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-300"
                onClick={onClose}
                aria-label="Close"
              >
                <span class="material-symbols-outlined text-2xl">close</span>
              </button>
            </div>

            {/* Body */}
            <div class="p-4 sm:p-6">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div class="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t border-border">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
