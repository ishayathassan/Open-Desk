import { Link, useNavigate } from "react-router-dom";
import "./css/home.css"; // Import your custom CSS

const LeftSidebar = () => {
  const universityId = localStorage.getItem("university_id");
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
          <Link to={`/universities/${universityId}`}>
            <img src="/images/school.png" alt="My Campus" />
            <span>My Campus</span>
          </Link>
        </li>
        <Link to="/channels">
          <li className="sidebar-links">
            <img src="/images/school.png" alt="All Channels" />
            <span>All Channels</span>
          </li>
        </Link>

        <li className="sidebar-links">
          <img src="/images/badge.png" alt="Featured" />
          <span>Featured</span>
        </li>
      </ul>
    </div>
  );
};

export default LeftSidebar;
