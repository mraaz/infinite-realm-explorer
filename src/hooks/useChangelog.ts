import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ChangelogEntry {
  id: string;
  version: string;
  release_date: string;
  title: string;
  content: string;
  type: 'added' | 'changed' | 'deprecated' | 'removed' | 'fixed' | 'security';
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export const useChangelog = (limit?: number) => {
  const [changelog, setChangelog] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        let query = supabase
          .from('changelog')
          .select('*')
          .eq('is_published', true)
          .order('release_date', { ascending: false })
          .order('created_at', { ascending: false });

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
          setError(error.message);
          return;
        }

        setChangelog((data || []) as ChangelogEntry[]);
      } catch (err) {
        setError('Failed to fetch changelog');
      } finally {
        setLoading(false);
      }
    };

    fetchChangelog();
  }, [limit]);

  return { changelog, loading, error };
};