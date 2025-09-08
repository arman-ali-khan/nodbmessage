import { useState, useEffect } from 'react';
import { Router, RouteParams } from '../utils/router';

export const useRouter = () => {
  const [params, setParams] = useState<RouteParams>(Router.getParams());
  const [path, setPath] = useState(Router.getCurrentPath());

  useEffect(() => {
    const handlePopState = () => {
      setParams(Router.getParams());
      setPath(Router.getCurrentPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return {
    params,
    path,
    navigateToRoom: Router.navigateToRoom,
    navigateToHome: Router.navigateToHome,
    isRoomPath: Router.isRoomPath(),
  };
};