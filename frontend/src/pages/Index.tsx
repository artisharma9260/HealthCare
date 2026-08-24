import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#F6F8F7] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#1C4A45]/20 border-t-[#1C4A45] rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/" replace />;
  if (user.role === 'doctor') return <Navigate to="/doctor" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/patient" replace />;
}
