import { AuthProvider } from './contexts/AuthContext';
import { RouterProvider, useCurrentRoute } from './components/Router';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';

function AppRoutes() {
  const currentRoute = useCurrentRoute();

  switch (currentRoute) {
    case 'login':
      return <LoginPage />;
    case 'signup':
      return <SignupPage />;
    case 'dashboard':
      return <Dashboard />;
    default:
      return <LandingPage />;
  }
}

function App() {
  return (
    <AuthProvider>
      <RouterProvider>
        <AppRoutes />
      </RouterProvider>
    </AuthProvider>
  );
}

export default App;
