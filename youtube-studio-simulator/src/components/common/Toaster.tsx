import { useStudio } from '../../store/StudioContext';

export function Toaster() {
  const { toasts, dismissToast } = useStudio();
  return (
    <div className="pointer-events-none fixed bottom-6 left-6 z-[90] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto flex min-w-[288px] max-w-[560px] animate-slide-up items-center gap-6 rounded-lg bg-[#0f0f0f] px-4 py-3 text-sm text-white shadow-lg">
          <span className="flex-1">{t.message}</span>
          {t.actionLabel && (
            <button
              className="font-medium text-[#3ea6ff] hover:text-[#65b8ff]"
              onClick={() => {
                t.onAction?.();
                dismissToast(t.id);
              }}
            >
              {t.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
