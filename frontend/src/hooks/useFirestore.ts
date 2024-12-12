import { useState, useEffect, useCallback } from 'react';
import { QueryConstraint } from 'firebase/firestore';
import { getCachedDoc, getCachedCollection } from '@/lib/firebase/cache';
import { withRetry } from '@/lib/utils/retry';
import { ErrorHandler } from '@/lib/utils/error-handler';

interface UseFirestoreOptions {
  expiresIn?: number;
  forceFetch?: boolean;
  enableOptimisticUpdates?: boolean;
}

// Hook para documentos individuales
export function useFirestoreDoc<T>(
  path: string | null,
  options: UseFirestoreOptions = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [optimisticData, setOptimisticData] = useState<T | null>(null);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await withRetry(() => getCachedDoc<T>(path, options));
        setData(result);
        setOptimisticData(result);
        setError(null);
      } catch (err) {
        const handledError = ErrorHandler.handle(err);
        console.error('Error fetching document:', handledError);
        setError(handledError);
        setData(null);
        setOptimisticData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [path, options.forceFetch]);

  const updateOptimistically = useCallback(async (
    updateFn: (current: T | null) => T,
    callback: () => Promise<void>
  ) => {
    if (!options.enableOptimisticUpdates) {
      await callback();
      return;
    }

    const previousData = data;
    const newData = updateFn(data);
    
    try {
      setOptimisticData(newData);
      await callback();
      setData(newData);
    } catch (err) {
      setOptimisticData(previousData);
      setData(previousData);
      throw err;
    }
  }, [data, options.enableOptimisticUpdates]);

  return { 
    data: options.enableOptimisticUpdates ? optimisticData : data, 
    loading, 
    error,
    updateOptimistically 
  };
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
  const [optimisticData, setOptimisticData] = useState<T[]>([]);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await withRetry(() => 
          getCachedCollection<T>(path, queryConstraints, options)
        );
        setData(result);
        setOptimisticData(result);
        setError(null);
      } catch (err) {
        const handledError = ErrorHandler.handle(err);
        console.error('Error fetching collection:', handledError);
        setError(handledError);
        setData([]);
        setOptimisticData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [path, queryConstraints, options.forceFetch]);

  const updateOptimistically = useCallback(async (
    updateFn: (current: T[]) => T[],
    callback: () => Promise<void>
  ) => {
    if (!options.enableOptimisticUpdates) {
      await callback();
      return;
    }

    const previousData = data;
    const newData = updateFn(data);
    
    try {
      setOptimisticData(newData);
      await callback();
      setData(newData);
    } catch (err) {
      setOptimisticData(previousData);
      setData(previousData);
      throw err;
    }
  }, [data, options.enableOptimisticUpdates]);

  return { 
    data: options.enableOptimisticUpdates ? optimisticData : data, 
    loading, 
    error,
    updateOptimistically 
  };
}
