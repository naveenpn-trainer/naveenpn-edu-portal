import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Session = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex flex-col w-full bg-[#f3f9fd] h-screen justify-center items-center text-lg lg:text-2xl text-center gap-y-4">
      An active session is detected.
      <br /> Please logout from current session.
      <div className="flex items-center justify-center gap-x-4">
        <Button
          variant="secondary"
          className="text-white"
          onClick={handleLogout}
        >
          Logout
        </Button>
        <Button onClick={() => navigate("/")}>Home</Button>
      </div>
    </div>
  );
};

export default Session;
