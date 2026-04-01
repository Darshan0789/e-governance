import { AuthProvider } from './contexts/AuthContext';
import { RouterProvider, useCurrentRoute } from './components/Router';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import Dashboard from './components/Dashboard';
import OfficerLoginPage from './components/OfficerLoginPage';
import AdminLoginPage from './components/AdminLoginPage';
import OfficerDashboard from './components/OfficerDashboard';
import AdminDashboard from './components/AdminDashboard';
import CitizenRto from './components/citizen/CitizenRto';
import DepartmentPageTemplate from './components/citizen/DepartmentPageTemplate';
import CitizenTrackStatus from './components/citizen/CitizenTrackStatus';
import { FileText, Users, MapPin, Shield } from 'lucide-react';

function AppRoutes() {
  const currentRoute = useCurrentRoute();

  switch (currentRoute) {
    case 'login':
      return <LoginPage />;
    case 'signup':
      return <SignupPage />;
    case 'dashboard':
      return <Dashboard />;
    case 'officerLogin':
      return <OfficerLoginPage />;
    case 'adminLogin':
      return <AdminLoginPage />;
    case 'officerDashboard':
      return <OfficerDashboard />;
    case 'adminDashboard':
      return <AdminDashboard />;
    case 'citizenRto':
      return <CitizenRto />;
    case 'citizenCivilRevenue':
      return (
        <DepartmentPageTemplate
          title="Civil & Revenue"
          subtitle="Certificates, land records, and tax services"
          icon={FileText}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
          deptPrefix="CRV"
          services={[
            { id: 'rtc', name: 'Land Records (RTC) Lookup' },
            { id: 'mutation', name: 'Mutation Status Check' },
            { id: 'property-tax', name: 'Property Tax Payment' },
            { id: 'land-revenue', name: 'Land Revenue Payment' },
            { id: 'water-charges', name: 'Water Charges Payment' },
            { id: 'birth-cert', name: 'Birth Certificate' },
            { id: 'death-cert', name: 'Death Certificate' },
            { id: 'caste-cert', name: 'Caste Certificate' },
            { id: 'income-cert', name: 'Income Certificate' },
            { id: 'marriage-reg', name: 'Marriage Registration & Certificate' },
          ]}
        />
      );
    case 'citizenSocialWelfare':
      return (
        <DepartmentPageTemplate
          title="Social Welfare & Grievance"
          subtitle="Pension schemes, benefits, and grievance redressal"
          icon={Users}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          deptPrefix="SWG"
          services={[
            { id: 'old-age', name: 'Old Age Pension Application' },
            { id: 'widow-pension', name: 'Widow Pension Scheme' },
            { id: 'disability-benefits', name: 'Disability Certificate & Benefits' },
            { id: 'scholarship', name: 'SC/ST Scholarship Application' },
            { id: 'grievance', name: 'Grievance Lodge' },
            { id: 'grievance-status', name: 'Grievance Status Tracker' },
          ]}
        />
      );
    case 'citizenFoodSupplies':
      return (
        <DepartmentPageTemplate
          title="Food & Civil Supplies"
          subtitle="Ration cards, entitlements, and fair price shops"
          icon={MapPin}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          deptPrefix="FCS"
          services={[
            { id: 'ration-new', name: 'New Ration Card Application' },
            { id: 'ration-members', name: 'Add/Remove Family Member in Ration Card' },
            { id: 'ration-surrender', name: 'Ration Card Surrender' },
            { id: 'fps-locator', name: 'Fair Price Shop Locator' },
            { id: 'entitlement', name: 'Check Monthly Entitlement' },
            { id: 'fps-complaint', name: 'File Complaint (short supply / quality issue)' },
            { id: 'kerosene', name: 'Subsidized Kerosene Allocation Status' },
          ]}
        />
      );
    case 'citizenCitizenServices':
      return (
        <DepartmentPageTemplate
          title="Citizen Services"
          subtitle="Identity cards, certificates, and NOCs"
          icon={Shield}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          deptPrefix="CTS"
          services={[
            { id: 'voter-id', name: 'Voter ID Services (Apply / Correction / Download)' },
            { id: 'domicile', name: 'Domicile Certificate' },
            { id: 'character-cert', name: 'Character Certificate' },
            { id: 'noc', name: 'NOC Applications' },
            { id: 'senior-id', name: 'Senior Citizen ID Card' },
            { id: 'disability-id', name: 'Disability ID Card' },
            { id: 'pan-aadhaar', name: 'Pan–Aadhaar Link Status Check (mock)' },
            { id: 'feedback', name: 'Feedback & Suggestion Box' },
          ]}
        />
      );
    case 'citizenTrackStatus':
      return <CitizenTrackStatus />;
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
