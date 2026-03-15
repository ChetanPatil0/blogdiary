import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Avatar from "./Avatar";
import { FiMenu, FiBell, FiUser, FiFileText, FiInfo, FiLogOut, FiGrid } from "react-icons/fi";
import { useState, useRef, useEffect } from "react";

import NotificationDrawer from "./NotificationDrawer";
import { getUnreadActivitesCount } from "../services/activitiesApi";

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const fetchUnread = async () => {
      const count = await getUnreadActivitesCount();
      setUnreadCount(count);
    };

    fetchUnread();

    const interval = setInterval(fetchUnread, 45000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setDrawerOpen(true);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <FiMenu size={20} className="text-gray-700" />
          </button>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={handleBellClick}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <FiBell size={20} className="text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Avatar
                name={user?.fullName}
                url={user?.profileImage?.url}
                verified={user?.isVerified}
                size="sm"
              />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                <div className="px-4 py-3 text-center border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                  {user?.username && (
                    <p className="text-xs text-gray-500 mt-0.5">@{user.username}</p>
                  )}
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate("/dashboard");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                  >
                    <FiGrid size={16} />
                    Dashboard
                  </button>

                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                  >
                    <FiUser size={16} />
                    Profile
                  </button>

                  <button
                    onClick={() => {
                      navigate("/blogs");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                  >
                    <FiFileText size={16} />
                    Blogs
                  </button>

                  <button
                    onClick={() => {
                      navigate("/about");
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition duration-150"
                  >
                    <FiInfo size={16} />
                    About
                  </button>
                </div>

                <div className="my-1 border-t border-gray-200"></div>

                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition duration-150"
                >
                  <FiLogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <NotificationDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};

export default Header;