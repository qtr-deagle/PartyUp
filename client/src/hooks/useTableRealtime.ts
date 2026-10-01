import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// Calls onChange whenever rows in any of `tables` are inserted, updated or
// deleted (RLS limits what each user receives), and when the tab regains focus
// in case the socket dropped while the laptop slept. Bursts are coalesced so a
// multi-row write triggers one refetch.
export function useTableRealtime(tables: string | string[], onChange: () => void) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const key = (Array.isArray(tables) ? tables : [tables]).join(',');

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const trigger = () => {
      clearTimeout(timer);
      timer = setTimeout(() => onChangeRef.current(), 300);
    };

    let channel = supabase.channel(`live:${key}:${Math.random().toString(36).slice(2)}`);
    for (const table of key.split(',')) {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table }, trigger);
    }
    channel.subscribe();

    const onVisible = () => {
      if (document.visibilityState === 'visible') trigger();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [key]);
}
