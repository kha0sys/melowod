import { useState, useEffect } from 'react';
import { QueryConstraint } from 'firebase/firestore';
import { getCachedDoc, getCachedCollection } from '@/lib/firebase/cache';

interface UseFirestoreOptions {
  expiresIn?: number;
  forceFetch?: boolean;
}

// Hook para documentos individuales
export function useFirestoreDoc<T>(
  path: string | null,
  options: UseFirestoreOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getCachedDoc<T>(path, options);
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [path, options.forceFetch]);

  return { data, loading, error };
}

// Hook para colecciones
export function useFirestoreCollection<T>(
  path: string | null,
  queryConstraints: QueryConstraint[] = [],
  options: UseFirestoreOptions = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getCachedCollection<T>(path, queryConstraints, options);
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Error fetching collection:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [path, options.forceFetch, queryConstraints.length]);

  return { data, loading, error };
}
