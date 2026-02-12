import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import MortgageBar from './components/layout/MortgageBar';
import QuickAddFAB from './components/layout/QuickAddFAB';
import ErrorBoundary from './components/shared/ErrorBoundary';
import WelcomeModal from './components/shared/WelcomeModal';

// Eagerly loaded (always visible)
import Dashboard from './pages/Dashboard';

// Lazy-loaded pages
const Properties = lazy(() => import('./pages/Properties'));
const PropertyDetail = lazy(() => import('./pages/PropertyDetail'));
const PropertyForm = lazy(() => import('./pages/PropertyForm'));
const EquityManager = lazy(() => import('./pages/EquityManager'));
const Compare = lazy(() => import('./pages/Compare'));
const MortgageCalc = lazy(() => import('./pages/MortgageCalc'));
const Tasks = lazy(() => import('./pages/Tasks'));
const AiAdvisors = lazy(() => import('./pages/AiAdvisors'));
const Timeline = lazy(() => import('./pages/Timeline'));
const Scenarios = lazy(() => import('./pages/Scenarios'));
const PropertyImport = lazy(() => import('./pages/PropertyImport'));
const Settings = lazy(() => import('./pages/Settings'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: '#3B82F6', borderTopColor: 'transparent' }}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0B1120] text-[#E2E8F0] flex flex-col">
        <Header />
        <MortgageBar />
        <main className="flex-1 pb-24 pt-2">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/new" element={<PropertyForm />} />
                <Route path="/properties/import" element={<PropertyImport />} />
                <Route path="/properties/:id" element={<PropertyDetail />} />
                <Route path="/properties/:id/edit" element={<PropertyForm />} />
                <Route path="/equity" element={<EquityManager />} />
                <Route path="/compare" element={<Compare />} />
                <Route path="/mortgage" element={<MortgageCalc />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/ai" element={<AiAdvisors />} />
                <Route path="/timeline" element={<Timeline />} />
                <Route path="/scenarios" element={<Scenarios />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <QuickAddFAB />
        <BottomNav />
        <WelcomeModal />
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: '#1E293B',
              color: '#E2E8F0',
              border: '1px solid #334155',
              direction: 'rtl',
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
