import { useEffect } from 'react';
import ConfirmActionDialog from '@/components/ConfirmActionDialog';
import { allowNextLeave, confirmDiscard, currentDirtyMessage, resolveDiscard, useDiscardRequest } from '@/lib/unsavedChanges';

// Mounted once in App. Shows the "Discard changes?" confirm, and while a page
// has unsaved changes it stops: in-app link clicks, browser back/forward, and
// closing or reloading the tab (the browser's own prompt).
export default function UnsavedChangesGuard() {
  const pending = useDiscardRequest();

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!currentDirtyMessage()) return;
      event.preventDefault();
      event.returnValue = '';
    };

    // Capture phase, so this runs before wouter's <Link> handler.
    const onClick = (event: MouseEvent) => {
      const message = currentDirtyMessage();
      if (!message || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      event.preventDefault();
      event.stopPropagation();
      confirmDiscard(true, () => {
        allowNextLeave();
        window.history.pushState(null, '', url.pathname + url.search + url.hash);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, { message });
    };

    // Browser back/forward: undo the move, then ask.
    let ignoreNextPop = false;
    const here = () => window.location.pathname + window.location.search + window.location.hash;
    let lastUrl = here();
    const onPopState = (event: PopStateEvent) => {
      if (ignoreNextPop) {
        ignoreNextPop = false;
        lastUrl = here();
        return;
      }
      const message = currentDirtyMessage();
      if (!message) {
        lastUrl = here();
        return;
      }
      // Keep the router from switching pages (which would unmount the form).
      event.stopImmediatePropagation();
      const target = here();
      window.history.pushState(null, '', lastUrl);
      confirmDiscard(true, () => {
        allowNextLeave();
        ignoreNextPop = true;
        window.history.pushState(null, '', target);
        window.dispatchEvent(new PopStateEvent('popstate'));
      }, { message });
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onClick, true);
    // Capture phase on window, before wouter's listener re-renders the route.
    window.addEventListener('popstate', onPopState, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState, true);
    };
  }, []);

  return (
    <ConfirmActionDialog
      open={pending !== null}
      onOpenChange={(open) => !open && resolveDiscard(false)}
      tone="destructive"
      title={pending?.title ?? 'Discard changes?'}
      description={pending?.message}
      confirmLabel="Discard"
      cancelLabel="Keep editing"
      onConfirm={() => resolveDiscard(true)}
    />
  );
}
