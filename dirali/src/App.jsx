import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import MortgageBar from './components/layout/MortgageBar';
import QuickAddFAB from './components/layout/QuickAddFAB';
import Dashboard from './pages/Dashboard';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import PropertyForm from './pages/PropertyForm';
import EquityManager from './pages/EquityManager';
import Compare from './pages/Compare';
import MortgageCalc from './pages/MortgageCalc';
import Tasks from './pages/Tasks';
import AiAdvisors from './pages/AiAdvisors';
import Timeline from './pages/Timeline';
import Scenarios from './pages/Scenarios';
import PropertyImport from './pages/PropertyImport';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0B1120] text-[#E2E8F0] flex flex-col">
        <Header />
        <MortgageBar />
        <main className="flex-1 pb-24 pt-2">
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
          </Routes>
        </main>
        <QuickAddFAB />
        <BottomNav />
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
