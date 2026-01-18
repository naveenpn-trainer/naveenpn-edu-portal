import { Label } from "@radix-ui/react-label";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { FaBars } from "react-icons/fa";
import CourseList from "./CourseList";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";

const MobileSidebar = () => {
  const { pathname } = useLocation();

  return (
    <div className="flex md:hidden">
      <Sheet className="z-[999] ">
        <SheetTrigger asChild className="p-1">
          <Label className=" text-primary font-bold scale-125">
            <FaBars />
          </Label>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="h-full w-fit px-2 py-2 pt-11 max-h-[100vh] max-w-[310px] flex gap-0 "
        >
          <Sidebar />
          {pathname.includes("curriculum") && <CourseList />}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSidebar;
