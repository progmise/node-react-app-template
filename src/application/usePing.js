// Use case: backend reachability check — the template's hello-world flow.
import { useEffect, useState } from 'react';
import { systemApi } from '../infrastructure/api/systemApi.js';

export const usePing = () => {
  const [pong, setPong] = useState(null);
  useEffect(() => { systemApi.ping().then(setPong); }, []);
  return pong;
};
