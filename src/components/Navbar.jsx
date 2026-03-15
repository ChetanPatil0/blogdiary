import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Logo from "../components/Logo";
import Avatar from "../components/Avatar";
import { FiMenu, FiX } from "react-icons/fi";
import { useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const isActive = (path) => {
    if (path === "/blogs") {
      return (
        location.pathname.startsWith("/blogs") ||
        location.pathname.startsWith("/blog")
      );
    }
    return location.pathname === path;
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Blogs", path: "/blogs" },
    { name: "About", path: "/about" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Logo size="sm" />
            <span className="font-bold text-xl text-gray-900 hidden sm:block">
              BlogDiary
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`
                    font-medium text-sm transition-colors
                    ${isActive(link.path)
                      ? "text-blue-600"
                      : "text-gray-600 hover:text-gray-900"
                    }
                  `}
                >
                  {link.name}
                </button>
              ))}
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Avatar
                    name={user?.fullName}
                    url={user?.profileImage?.url}
                    verified={user?.isVerified}
                    size="sm"
                  />
                </button>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                >
                  Dashboard
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-5 space-y-4">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  block w-full text-left py-2 px-3 rounded-md font-medium
                  ${isActive(link.path)
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                {link.name}
              </button>
            ))}

            {isAuthenticated ? (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center gap-3 px-3 py-2">
                  <Avatar
                    name={user?.fullName}
                    url={user?.profileImage?.url}
                    verified={user?.isVerified}
                    size="md"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{user?.fullName}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                  className="mt-3 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Dashboard
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 flex flex-col gap-3">
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    navigate("/signup");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Sign up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;