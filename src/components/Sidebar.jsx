
import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiBarChart2,
  FiBell,
  FiX,
  FiLogOut,
  FiFileText,
  FiUser,
  FiUsers
} from "react-icons/fi";

import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const baseLink =
    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all";

  const inactiveLink =
    "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";

  const activeLink =
    "bg-primary-500 text-white dark:bg-primary-600 font-medium";

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed md:static z-50
        top-0 left-0 h-full w-64
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        flex flex-col
      `}
      >
        <div className="p-6 flex items-center justify-between">
          <Logo />
          <button
            className="md:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="flex-1 flex flex-col gap-1 px-3">

          <NavLink
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : inactiveLink}`
            }
          >
            <FiGrid size={20} />
            <span>Dashboard</span>
          </NavLink>

          {!isAdmin && (
            <NavLink
              to="/my-blogs"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : inactiveLink}`
              }
            >
              <FiFileText size={20} />
              <span>My Blogs</span>
            </NavLink>
          )}


          {isAdmin && (
            <NavLink
              to="/manage-blogs"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : inactiveLink}`
              }
            >
              <FiFileText size={20} />
              <span>Manage Blogs</span>
            </NavLink>
          )}

           <NavLink
              to="/blogs"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : inactiveLink}`
              }
            >
              <FiFileText size={20} />
              <span>Blogs</span>
            </NavLink>

          {isAdmin && (
            <NavLink
              to="/users"
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `${baseLink} ${isActive ? activeLink : inactiveLink}`
              }
            >
              <FiUsers size={20} />
              <span>Manage Users</span>
            </NavLink>
          )}

          <NavLink
            to="/analytics"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : inactiveLink}`
            }
          >
            <FiBarChart2 size={20} />
            <span>Analytics</span>
          </NavLink>

          <NavLink
            to="/notifications"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : inactiveLink}`
            }
          >
            <FiBell size={20} />
            <span>Notifications</span>
          </NavLink>

          <NavLink
            to="/profile"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `${baseLink} ${isActive ? activeLink : inactiveLink}`
            }
          >
            <FiUser size={20} />
            <span>Profile</span>
          </NavLink>
        </nav>

        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium"
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
