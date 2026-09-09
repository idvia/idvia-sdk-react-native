"use strict";

import { useCallback, useRef, useState } from 'react';
import { openTrustCloudSession } from './openTrustCloudSession';
export function useTrustCloudSession() {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const generationRef = useRef(0);
  const present = useCallback(async options => {
    const generation = ++generationRef.current;
    setStatus('presenting');
    setResult(null);
    setError(null);
    try {
      const sessionResult = await openTrustCloudSession(options);
      if (generationRef.current === generation) {
        setStatus(sessionResult.outcome);
        setResult(sessionResult);
      }
      return sessionResult;
    } catch (e) {
      if (generationRef.current === generation) {
        setStatus('error');
        setError(e);
      }
      throw e;
    }
  }, []);
  return {
    status,
    result,
    error,
    present
  };
}
//# sourceMappingURL=useTrustCloudSession.js.map