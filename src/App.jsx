import { useState } from "react";
import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Repositories from "./pages/Repositories";
import PullRequests from "./pages/PullRequests";
import Reviews from "./pages/Reviews";
import ReviewDetails from "./pages/ReviewDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Sidebar from "./components/Sidebar";
import ProfileMenu from "./components/ProfileMenu";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";


function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="auth-loading">
                Loading...
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return children;
}


function PublicRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="auth-loading">
                Loading...
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}


function ProtectedApp() {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div
            className={`app-layout ${
                sidebarOpen ? "sidebar-open" : "sidebar-closed"
            }`}
        >
            <ProfileMenu />

            <Sidebar
                open={sidebarOpen}
                onToggle={() =>
                    setSidebarOpen((value) => !value)
                }
            />

            <main className="app-main">
                <Routes>
                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />

                    <Route
                        path="/repositories"
                        element={<Repositories />}
                    />

                    <Route
                        path="/pull-requests"
                        element={<PullRequests />}
                    />

                    <Route
                        path="/reviews"
                        element={<Reviews />}
                    />

                    <Route
                        path="/reviews/:id"
                        element={<ReviewDetails />}
                    />

                    <Route
                        path="/profile"
                        element={<Profile />}
                    />

                    <Route
                        path="/settings"
                        element={<Settings />}
                    />
                </Routes>
            </main>
        </div>
    );
}


function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <AuthProvider>
                    <Routes>
                        <Route
                            path="/"
                            element={<Landing />}
                        />

                        <Route
                            path="/login"
                            element={
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            }
                        />

                        <Route
                            path="/register"
                            element={
                                <PublicRoute>
                                    <Register />
                                </PublicRoute>
                            }
                        />

                        <Route
                            path="/*"
                            element={
                                <ProtectedRoute>
                                    <ProtectedApp />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
        </ThemeProvider>
    );
}

export default App;
