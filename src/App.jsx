import {
    BrowserRouter,
    Navigate,
    Route,
    Routes,
    useLocation,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Repositories from "./pages/Repositories";
import PullRequests from "./pages/PullRequests";
import Reviews from "./pages/Reviews";
import ReviewDetails from "./pages/ReviewDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";

import { AuthProvider, useAuth } from "./context/AuthContext";


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
        return <Navigate to="/" replace />;
    }

    return children;
}


function ProtectedApp() {
    return (
        <>
            <Navbar />

            <main>
                <Routes>
                    <Route
                        path="/"
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
                </Routes>
            </main>
        </>
    );
}


function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
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
    );
}

export default App;
