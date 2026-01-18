import { Button } from "./ui/button";
import { MdLogout } from "react-icons/md";
import MobileSidebar from "./MobileSidebar";
import { useAuth } from "@/context/AuthContext";
import { coursesList } from "@/data/global_config";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const courseCode = localStorage.getItem("courseCode");
  const { header, socialHandles, appointment } =
    coursesList[courseCode]?.globalTitles || {};

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="fixed w-full z-10 top-0 bg-white h-12">
      <div className="w-full py-3 md:py-2 px-4 mx-auto bg-transparent flex items-center justify-between">
        <MobileSidebar />
        <Link className="flex items-center gap-x-3 md:gap-x-2" to="/">
          <img
            src={header?.logo}
            alt="Logo"
            className="h-7 w-7 md:h-8 md:w-8 p-0.5 scale-125 md:scale-100 bg-white rounded-full"
          />
          <span className="text-base lg:text-xl text-primary font-medium">
            {header?.title}
          </span>
        </Link>
        <div className="flex items-center justify-end gap-x-4 lg:gap-x-5">
          <div className="flex justify-between items-center w-fit font-bold text-2xl gap-x-4 xl:gap-x-6 text-black">
            {socialHandles?.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  rel="noreferer"
                  target="blank"
                  href={item.url}
                  key={item.id}
                  className="text-primary"
                >
                  <Icon />
                </a>
              );
            })}
            {appointment && (
              <a
                href={appointment}
                rel="noreferer"
                target="blank"
                className="hidden md:block md:font-medium lg:font-bold md:text-xs lg:text-sm md:py-1.5 md:px-3 border-secondary border-2 text-secondary rounded-lg"
              >
                Book a session
              </a>
            )}
            <div onClick={handleLogout}>
              <Button
                variant="secondary"
                className="hidden md:block text-white font-medium"
              >
                Logout
              </Button>
              <button className="block md:hidden text-primary font-bold text-2xl">
                <MdLogout />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
