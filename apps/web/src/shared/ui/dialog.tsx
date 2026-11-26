import type { ReactNode } from 'react';

export function Dialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4'
      onClick={onClose}
    >
      <div
        role='dialog'
        aria-modal='true'
        aria-labelledby='dialog-title'
        className='w-full max-w-md rounded-lg border border-border bg-card p-6 text-card-foreground'
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <h2
          id='dialog-title'
          className='text-lg font-semibold text-foreground'
        >
          {title}
        </h2>
        <div className='mt-4'>{children}</div>
      </div>
    </div>
  );
}
