import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import LoginPage from "./pages/LoginPage";
import PatientDashboard from "./pages/patient/PatientDashboard";
import SearchDoctors from "./pages/patient/SearchDoctors";
import BookAppointment from "./pages/patient/BookAppointment";
import PatientAppointments from "./pages/patient/PatientAppointments";
import PatientAppointmentDetail from "./pages/patient/PatientAppointmentDetail";
import DoctorSchedule from "./pages/doctor/DoctorSchedule";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorAppointmentDetail from "./pages/doctor/DoctorAppointmentDetail";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDoctors from "./pages/admin/AdminDoctors";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function RequireAuth({ children, role }: { children: React.ReactNode; role: 'patient' | 'doctor' | 'admin' }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#1C4A45]/20 border-t-[#1C4A45] rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) {
    if (user.role === 'patient') return <Navigate to="/patient" replace />;
    if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#1C4A45]/20 border-t-[#1C4A45] rounded-full animate-spin" />
    </div>
  );
  if (!user) return <LoginPage />;
  if (user.role === 'patient') return <Navigate to="/patient" replace />;
  if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <LoginPage />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />

            {/* Patient Portal */}
            <Route path="/patient" element={<RequireAuth role="patient"><PatientDashboard /></RequireAuth>} />
            <Route path="/patient/search" element={<RequireAuth role="patient"><SearchDoctors /></RequireAuth>} />
            <Route path="/patient/book/:doctorId" element={<RequireAuth role="patient"><BookAppointment /></RequireAuth>} />
            <Route path="/patient/appointments" element={<RequireAuth role="patient"><PatientAppointments /></RequireAuth>} />
            <Route path="/patient/appointments/:id" element={<RequireAuth role="patient"><PatientAppointmentDetail /></RequireAuth>} />

            {/* Doctor Portal */}
            <Route path="/doctor" element={<RequireAuth role="doctor"><DoctorSchedule /></RequireAuth>} />
            <Route path="/doctor/appointments" element={<RequireAuth role="doctor"><DoctorAppointments /></RequireAuth>} />
            <Route path="/doctor/appointments/:id" element={<RequireAuth role="doctor"><DoctorAppointmentDetail /></RequireAuth>} />
            <Route path="/doctor/patients" element={<RequireAuth role="doctor"><DoctorPatients /></RequireAuth>} />

            {/* Admin Portal */}
            <Route path="/admin" element={<RequireAuth role="admin"><AdminDashboard /></RequireAuth>} />
            <Route path="/admin/doctors" element={<RequireAuth role="admin"><AdminDoctors /></RequireAuth>} />
            <Route path="/admin/appointments" element={<RequireAuth role="admin"><AdminAppointments /></RequireAuth>} />
            <Route path="/admin/settings" element={<RequireAuth role="admin"><AdminSettings /></RequireAuth>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
