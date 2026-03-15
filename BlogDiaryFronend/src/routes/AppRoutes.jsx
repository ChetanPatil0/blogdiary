import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

import Landing from "../pages/Landing";
import About from "../pages/About";
import Dashboard from "../pages/Dashboard";
import Profile from "../pages/Profile";
import Analytics from "../pages/Analytics";
import Notifications from "../pages/Notifications";
import Settings from "../pages/Settings";
import NotFound from "../pages/NotFound";


import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AuthLayout from "../layouts/Authlayout";
import EditBlog from "../pages/blog/EditBlog";
import VerifyEmail from "../pages/auth/VerifyEmail";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import BlogDetail from "../pages/blog/BlogDetail";
import Blogs from "../pages/blog/Blogs";
import CreateBlog from "../pages/blog/CreateBlog";
import MyBlogs from "../pages/blog/MyBlogs";
import AllBlogs from "../pages/blog/AllBlogsPage";
import SuperAdminDashboard from "../pages/admins/SuperAdminDashboard";
import ManageUsers from "../pages/admins/ManageUsers";
import UserDetails from "../pages/auth/UserDetails";
import ManageBlogs from "../pages/admins/ManageBlogs";


const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuthStore();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const RoleBasedDashboard = () => {
    const { user } = useAuthStore();

    console.log("User role in RoleBasedDashboard:", user?.role);

    if (user?.role === "admin" || user?.role === "superadmin") {
        return <SuperAdminDashboard />;
    }

    return <Dashboard />;
};

const AppRoutes = () => {
    return (
        <Routes>


            {/* PUBLIC ROUTES */}
            <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
                <Route path="/about" element={<About />} />
                {/* <Route path="/blogs" element={<Blogs/>} /> */}
                <Route path="blogs" element={<AllBlogs />} />
                <Route path="/blogs/:id" element={<BlogDetail />} />
            </Route>



            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
            </Route>



            {/* DASHBOARD ROUTES */}
            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >

                <Route path="/dashboard" element={<RoleBasedDashboard />} />
                <Route path="/my-blogs/create-blog" element={<CreateBlog />} />
                <Route path="/my-blogs" element={<MyBlogs />} />
                <Route path="/my-blogs/edit/:id" element={<EditBlog />} />

                <Route path="/profile" element={<Profile />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/settings" element={<Settings />} />

                <Route path="/blogs/author-profile/:id" element={<UserDetails />} />
                <Route path="/users/:id" element={<UserDetails />} />
                <Route path="/users" element={<ManageUsers />} />
                <Route path="/manage-blogs" element={<ManageBlogs />} />

            </Route>


            {/* 404 */}
            <Route path="*" element={<NotFound />} />

        </Routes>
    );
};

export default AppRoutes;