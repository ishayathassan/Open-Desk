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
import PostDetail from "./PostDetail.js"; // Create this new component
import SingleChannel from "./SingleChannel.js";
import UniversityDetails from "./UniversityDetails.js";
import AllChannels from "./AllChannels.js";

const isLoggedIn = () => {
  return !!localStorage.getItem("user_id");
};

const ProtectedRoute = ({ element }) => {
  return isLoggedIn() ? element : <Navigate to="/login" replace />;
};

const App = () => {
  const location = useLocation();
  const excludeSidebarRoutes = ["/login", "/signup"];

  return (
    <div className="App">
      <Navbar />

      <div className="main">
        {!excludeSidebarRoutes.includes(location.pathname) && <LeftSidebar />}

        <div>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<ProtectedRoute element={<Home />} />} />
            <Route
              path="/create_post"
              element={<ProtectedRoute element={<CreatePost />} />}
            />
            {/* Add this new route for post details */}
            <Route
              path="/posts/:id"
              element={<ProtectedRoute element={<PostDetail />} />}
            />
            <Route path="/channels/:channelId" element={<SingleChannel />} />
            <Route
              path="/universities/:uniId"
              element={<UniversityDetails />}
            />

            <Route path="/channels" element={<AllChannels />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

const WrappedApp = () => (
  <Router>
    <App />
  </Router>
);

export default WrappedApp;
