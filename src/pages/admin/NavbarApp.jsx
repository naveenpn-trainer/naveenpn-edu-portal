import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const NavbarApp = ({ companyName = "Company", orgCode = "" }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1>{companyName}</h1>
      </div>

      <div className="navbar-links">
        <Link to={`/app/admin_panel/${orgCode}`}>Student</Link>
        <Link to="/app/update-attendance">Attendance</Link>
        <Link to="/app/update-marks">Score</Link>
        <Link to="/app/add-module">Modules</Link>
		<Link to="/app/feedback">Feedback</Link>
        <Link to="/app/share_app">Notify</Link>
      </div>

      <div className="navbar-right">
        <div className="profile-info">
          <span>Admin</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default NavbarApp;
