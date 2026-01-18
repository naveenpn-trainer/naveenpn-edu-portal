/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useToast } from "./ui/use-toast";
import TimerDialog from "./TimerDialog";

const Timer = ({
  duration,
  threshold,
  onTimeout,
  shouldRun,
  remainingTime,
  onTimeUpdate,
}) => {
  let time = remainingTime ? remainingTime : duration;
  const { toast } = useToast();
  const [open, setOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(time);
  const [alertShown, setAlertShown] = useState(false);

  useEffect(() => {
    setTimeLeft(time);
  }, []);

  useEffect(() => {
    onTimeUpdate(timeLeft);
  }, [timeLeft]);

  useEffect(() => {
    if (!shouldRun) return;
    if (timeLeft === 0) return;
    const timerId = setInterval(() => {
      setTimeLeft((prevTimeLeft) => {
        if (prevTimeLeft <= 0) {
          clearInterval(timerId);
          return 0;
        }
        if (prevTimeLeft <= threshold && !alertShown && prevTimeLeft > 0) {
          setAlertShown(true);
        } else if (prevTimeLeft > threshold) {
          setAlertShown(false);
        }
        return prevTimeLeft - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [threshold, alertShown, timeLeft, shouldRun]);

  const DisplayAlert = () => {
    return toast({
      variant: "warning",
      title: `Please Hurry up!`,
      description: `Only ${Math.floor(threshold / 60)} minutes left!`,
    });
  };

  useEffect(() => {
    if (alertShown) {
      DisplayAlert();
    }
  }, [alertShown]);

  const handleReset = () => {
    setOpen(true);
    setAlertShown(false);
    setTimeLeft(duration);
    onTimeout();
  };

  if (timeLeft === 0) {
    return <TimerDialog open={open} setOpen={setOpen} onReset={handleReset} />;
  }

  const formatTimeLeft = (time) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;
    return `${String(hours).padStart(2, "0")} :
    ${String(minutes).padStart(2, "0")} :
    ${String(seconds).padStart(2, "0")}`;
  };

  return (
    <>
      <div
        className={`absolute top-[6.5rem] text-sm right-3 px-4 py-3 bg-white rounded-md shadow-lg`}
      >
        Time Left :
        <span className={`${timeLeft <= threshold && "text-red-500 "} ml-1`}>
          {formatTimeLeft(timeLeft)}
        </span>
      </div>
    </>
  );
};

export default Timer;
