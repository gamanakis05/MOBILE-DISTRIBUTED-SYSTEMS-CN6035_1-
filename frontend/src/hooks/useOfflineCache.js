import { useEffect, useState, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Fetches data from the network when online, falls back to AsyncStorage cache
 * when offline. Returns { data, loading, error, isOffline, refresh }.
 *
 * @param {string} cacheKey  - AsyncStorage key
 * @param {() => Promise<any>} fetcher - async function that returns the data
 */
export function useOfflineCache(cacheKey, fetcher) {
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback(async () => {
    if (mountedRef.current) { setLoading(true); setError(null); }

    const netState = await Network.getNetworkStateAsync();
    const online   = netState.isConnected && netState.isInternetReachable !== false;

    if (online) {
      try {
        const fresh = await fetcher();
        if (mountedRef.current) {
          setData(fresh);
          setIsOffline(false);
        }
        await AsyncStorage.setItem(
          cacheKey,
          JSON.stringify({ ts: Date.now(), value: fresh })
        );
      } catch (err) {
        // network error even though online — try cache
        console.log('Network error:', err.message || err);
        const cached = await _readCache(cacheKey);
        if (mountedRef.current) {
          if (cached) { 
            setData(cached); 
            setIsOffline(false); 
            setError('Προβολή αποθηκευμένων δεδομένων (σφάλμα δικτύου)'); 
          }
          else {        
            setError(`Αδυναμία φόρτωσης δεδομένων: ${err.message || 'Σφάλμα δικτύου'}`); 
          }
        }
      }
    } else {
      const cached = await _readCache(cacheKey);
      if (mountedRef.current) {
        if (cached) { setData(cached); setIsOffline(true); }
        else        { setError('Offline — δεν υπάρχουν αποθηκευμένα δεδομένα.'); setIsOffline(true); }
      }
    }

    if (mountedRef.current) setLoading(false);
  }, [cacheKey, fetcher]);

  useEffect(() => { load(); }, [load]);

  return { data, loading, error, isOffline, refresh: load };
}

async function _readCache(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const { ts, value } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null; // stale
    return value;
  } catch {
    return null;
  }
}
