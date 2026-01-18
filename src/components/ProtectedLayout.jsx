import { Navigate, Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";
import useInternetStatus from "@/hooks/InternetStatus";
import Footer from "./Footer";
import { useAuth } from "@/context/AuthContext";
import CourseHeader from "./CourseHeader";
import Sidebar from "./Sidebar";
import { coursesList } from "@/data/global_config";

const ProtectedLayout = () => {
  const { toast } = useToast();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isOnline = useInternetStatus();
  const [wasOffline, setWasOffline] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const courseCode = localStorage.getItem("courseCode");

  useEffect(() => {
    if (isOnline && wasOffline) {
      toast({
        variant: "success",
        title: "Back Online",
        description: "Continue your learning",
      });
    } else if (!isOnline) {
      toast({
        variant: "destructive",
        title: "No Internet",
        description: "Please check your connection",
      });
    }
    setWasOffline(!isOnline);
  }, [isOnline, wasOffline, toast]);

  if (!courseCode || !coursesList[courseCode]) {
    logout();
    navigate("/login");
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <main className="w-screen min-h-screen overflow-hidden">
      <Navbar />
      <CourseHeader />
      <section className="w-full flex justify-between pt-24">
        <div className="hidden md:flex">
          <Sidebar />
        </div>
        <section className="flex-1 h-[calc(100vh-6rem)] overflow-y-auto bg-white">
          <Outlet />
        </section>
      </section>
      <Footer />
    </main>
  );
};

export default ProtectedLayout;
