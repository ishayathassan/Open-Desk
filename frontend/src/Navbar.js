import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Check if the user is logged in by checking localStorage
  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    setIsLoggedIn(!!userId); // Update state based on user presence
  }, []);

  // Logout function
  const handleLogout = () => {
    localStorage.clear(); // Clear all user data from localStorage
    setIsLoggedIn(false); // Update login state
    navigate("/login"); // Redirect to login page
  };

  return (
    <nav>
      <div id="nav-left">
        <div id="brand-logo">
          <Link to="/">
            <img src="/images/Icon.png" alt="Brand Logo" />
          </Link>
        </div>
        <div className="search-container">
          <i className="fa fa-search"></i>
          <input type="text" className="search-input" placeholder="Search..." />
        </div>
      </div>
      <div id="nav-right">
        <ul>
          <li>
            <Link to="/create_post" className="nav-links">
              <img src="/images/edit.png" alt="Create" />
              <span>Create</span>
            </Link>
          </li>
          <li className="nav-links">
            <img src="/images/bell.png" alt="Notifications" />
          </li>
          <li className="nav-links">
            <img src="/images/user.png" alt="Profile" />
          </li>
          {isLoggedIn ? (
            // Show Logout Button if logged in
            <li id="logout" className="nav-btns">
              <button onClick={handleLogout}>Logout</button>
            </li>
          ) : (
            // Show Sign In and Sign Up if not logged in
            <>
              <li id="sign-in" className="nav-btns">
                <Link to="/login">Sign In</Link>
              </li>
              <li className="nav-btns">
                <Link to="/signup">Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
