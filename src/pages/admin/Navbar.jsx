import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = ({ companyName }) => {
  const handleLogout = () => {
    localStorage.clear(); // or just remove tokens/user data
    window.location.href = "/"; // or use useNavigate for SPA
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h1>{companyName}</h1>
      </div>

      <div className="navbar-links">
        <Link to="/admin">Student</Link>
        <Link to="/update-attendance">Attendance</Link>
        <Link to="/update-marks">Score</Link>
        <Link to="/add-module">Modules</Link>
		<Link to="/feedback">Feedback</Link>
        <Link to="/share">Notify</Link>
      </div>

      <div className="navbar-right">
        <div className="profile-info">
          <span></span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
