import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GoArrowLeft } from "react-icons/go";
const NotFound = () => {
  return (
    <div className="flex  flex-col h-screen justify-center items-center">
      <h1 className="text-2xl lg:text-4xl">404</h1>
      <p className="text-xl lg:text-2xl">Page Not Found</p>
      <Button className="text-lg lg:text-xl py-5 mt-2">
        <Link to="/" className="flex justify-center items-center gap-2">
          <GoArrowLeft />
          Home
        </Link>
      </Button>
    </div>
  );
};

export default NotFound;
