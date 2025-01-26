import { Link, useNavigate } from "react-router-dom";
import "./css/home.css"; // Import your custom CSS

const LeftSidebar = () => {
  return (
    <div id="sidebar">
      <ul>
        <Link to="/">
          <li className="sidebar-links">
            <img src="/images/feed.png" alt="Feed" />
            <span>Feed</span>
          </li>
        </Link>
        <li className="sidebar-links">
          <img src="/images/trending.png" alt="Trending" />
          <span>Trending</span>
        </li>
        <li className="sidebar-links">
          <img src="/images/school.png" alt="My Campus" />
          <span>My Campus</span>
        </li>
        <li className="sidebar-links">
          <img src="/images/school.png" alt="All Channels" />
          <span>All Channels</span>
        </li>
        <li className="sidebar-links">
          <img src="/images/badge.png" alt="Featured" />
          <span>Featured</span>
        </li>
      </ul>
    </div>
  );
};

export default LeftSidebar;
