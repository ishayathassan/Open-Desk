import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import Navbar from "./Navbar.js";
import Home from "./Home.js";
import Login from "./Login.js";
import Signup from "./Signup.js";
import LeftSidebar from "./LeftSidebar.js";
import CreatePost from "./CreatePost.js";

// Check if a user is logged in (use localStorage or a state manager)
const isLoggedIn = () => {
  return !!localStorage.getItem("user_id"); // Change key based on your session data
};

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  return isLoggedIn() ? element : <Navigate to="/login" replace />;
};

const App = () => {
  const location = useLocation();

  // Define routes where the sidebar should not be shown
  const excludeSidebarRoutes = ["/login", "/signup"];

  return (
    <div className="App">
      <Navbar />

      <div className="main">
        {!excludeSidebarRoutes.includes(location.pathname) && <LeftSidebar />}

        {/* Main content */}
        <div>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute element={<Home />} />} />
            <Route
              path="/create_post"
              element={<ProtectedRoute element={<CreatePost />} />}
            />
          </Routes>
        </div>
      </div>
    </div>
  );
};

// Wrap App in Router for useLocation
const WrappedApp = () => (
  <Router>
    <App />
  </Router>
);

export default WrappedApp;
