// Use case: current session — resolves the signed-in user once on mount.
import { useEffect, useState } from 'react';
import { systemApi } from '../infrastructure/api/systemApi.js';

export const useSession = () => {
  const [user, setUser] = useState(null);
  useEffect(() => { systemApi.me().then(setUser); }, []);
  return user;
};
