import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLocation, useNavigate } from "react-router-dom";
import { IoMdTime } from "react-icons/io";

const TimerDialog = ({ open, setOpen, onReset }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleClick = () => {
    setOpen(false);
    onReset();
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="w-[300px] md:w-[450px] md:min-h-[200px]">
        <AlertDialogHeader className="text-red-600">
          <AlertDialogTitle className="flex text-lg lg:text-xl font-bold gap-2 justify-center items-center">
            <IoMdTime />
            Time&apos;s Up!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base lg:text-lg text-center text-gray-600 font-medium">
            Your test time is over.
            <br />
            You can retake the test later
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter
          onClick={handleClick}
          className="flex mx-auto w-fit justify-center items-center gap-2 lg:gap-5"
        >
          <AlertDialogCancel onClick={() => navigate(pathname)}>
            Retake
          </AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600"
            onClick={() => navigate("/")}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default TimerDialog;
