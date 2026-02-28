import { createContext, useContext, useState, ReactNode } from 'react';

type Route = 'landing' | 'login' | 'signup' | 'dashboard';

interface RouterContextType {
  currentRoute: Route;
  navigate: (route: Route) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [currentRoute, setCurrentRoute] = useState<Route>('landing');

  const navigate = (route: Route) => {
    setCurrentRoute(route);
  };

  return (
    <RouterContext.Provider value={{ currentRoute, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useNavigate() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useNavigate must be used within RouterProvider');
  }
  return context.navigate;
}

export function useCurrentRoute() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useCurrentRoute must be used within RouterProvider');
  }
  return context.currentRoute;
}
