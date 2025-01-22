import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav>
      <div id="nav-left">
        <div id="brand-logo">
          <a href="/">
            <img src="/images/Icon.png" alt="Brand Logo" />
          </a>
        </div>
        <div className="search-container">
          <i className="fa fa-search"></i>
          <input type="text" className="search-input" placeholder="Search..." />
        </div>
      </div>
      <div id="nav-right">
        <ul>
          <li className="nav-links">
            <img src="/images/edit.png" alt="Create" />
            <span>Create</span>
          </li>
          {/* <li className="nav-links">
            <img src="/images/messenger.png" alt="Messages" />
          </li> */}
          <li className="nav-links">
            <img src="/images/bell.png" alt="Notifications" />
          </li>
          <li className="nav-links">
            <img src="/images/user.png" alt="Profile" />
            <span></span>
          </li>
          {/* <li id="logout" className="nav-btns">
            <button>Logout</button>
          </li> */}
          <li id="sign-in" className="nav-btns">
            <Link to="/login">Sign In</Link>
          </li>
          <li className="nav-btns">
            <Link to="/signup">Sign Up</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
