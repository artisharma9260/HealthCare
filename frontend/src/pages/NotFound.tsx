import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Home, ChevronLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F8F7]">
      <div className="text-center max-w-sm px-6">
        <p className="text-6xl font-bold font-mono text-[#1C4A45]/20 mb-4">404</p>
        <h1 className="font-serif text-2xl font-semibold text-[#1A2523] mb-2">Page not found</h1>
        <p className="text-sm text-[#1A2523]/50 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or you may not have permission to view it.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#E8EFEC] text-[#1C4A45] text-sm font-medium rounded-lg hover:bg-[#D0E2DA] transition-colors"
          >
            <ChevronLeft size={15} /> Go Back
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1C4A45] text-white text-sm font-medium rounded-lg hover:bg-[#163D38] transition-colors"
          >
            <Home size={15} /> Return Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
