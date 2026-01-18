// /* eslint-disable no-self-assign */
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import Timer from "@/components/Timer";
import Fallback from "@/components/Fallback";
import useInternetStatus from "@/hooks/InternetStatus";
import { coursesList, timer } from "@/data/global_config";
import { marked } from "marked";

const TopicDetails = () => {
  const { pathname } = useLocation();
  const isOnline = useInternetStatus();
  const { topicId, subtopicId, linkId } = useParams();
  const [wasOffline, setWasOffline] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [remainingTime, setRemainingTime] = useState(timer.duration);
  const [markdownContent, setMarkdownContent] = useState("");

  const iframeRef = useRef(null);
  const remainingTimeRef = useRef(remainingTime);

  const courseCode = localStorage.getItem("courseCode");
  const topics = coursesList[courseCode]?.data || [];

  const topic = topics?.find((t) => t.id === topicId);
  const subtopic = topic?.subtopics?.find((s) => s.id === subtopicId);
  const link = subtopic?.links?.find((l) => l.id === linkId);
  const source = link ? link.url : subtopic?.url;

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.uid;

  const formKey = `${userId}-${topic?.title}/${linkId ? `${link?.title}` : `${subtopic?.title}`}`;
  const timeKey = `time-${formKey}`;
  const dataKey = `data-${formKey}`;

  const isMarkdown = source?.endsWith(".md");

  const restoreFormStatus = () => {
    const savedFormStatus = localStorage.getItem(formKey);
    if (savedFormStatus === "submitted") {
      setFormSubmitted(true);
    }
  };

  const restoreRemainingTime = () => {
    const savedRemainingTime = localStorage.getItem(timeKey);
    if (savedRemainingTime) {
      setRemainingTime(Number(savedRemainingTime));
      remainingTimeRef.current = Number(savedRemainingTime);
    }
  };

  const restoreFormData = () => {
    const storedFormData = localStorage.getItem(dataKey);
    if (storedFormData) {
      const formEntries = JSON.parse(storedFormData);
      const iframe = iframeRef.current;
      const form = iframe?.contentDocument?.getElementById("mG61Hd");
      if (form) {
        formEntries.forEach(({ name, value }) => {
          const input = form.querySelector(`[name="${name}"]`);
          if (input) input.value = value;
        });
      }
    }
  };

  const saveRemainingTime = (time) => {
    if (time > 0) localStorage.setItem(timeKey, time);
  };

  const resetForm = () => {
    const iframe = iframeRef?.current;
    if (iframe) iframe.src = source;
    const form = iframe?.contentDocument?.getElementById("mG61Hd");
    if (form) form.reset();
    setFormSubmitted(false);
    localStorage.setItem(formKey, "not_submitted");
  };

  const saveFormData = () => {
    const iframe = iframeRef?.current;
    const form = iframe?.contentDocument?.getElementById("mG61Hd");
    if (form) {
      const formData = new FormData(form);
      const formEntries = Array.from(formData.entries());
      localStorage.setItem(dataKey, JSON.stringify(formEntries));
    }
  };

  const fetchMarkdownContent = async () => {
    try {
      const response = await fetch(`/${source}`);
      const text = await response.text();
      setMarkdownContent(text);
    } catch (error) {
      console.error("Failed to load Markdown file:", error);
      setIframeError(true);
    }
  };

  useEffect(() => {
    restoreFormStatus();
    restoreRemainingTime();
    restoreFormData();

    if (isMarkdown) {
      fetchMarkdownContent();
    }
  }, [userId, source]);

  useEffect(() => {
    const iframe = iframeRef?.current;

    const handleIframeLoad = () => {
      setIframeLoaded(true);
      setIframeError(false);

      if (iframe && iframe.contentWindow) {
        const form = iframe?.contentDocument?.getElementById("mG61Hd");
        if (form) {
          form.addEventListener("submit", () => {
            handleSubmit();
            setFormSubmitted(true);
            localStorage.setItem(formKey, "submitted");
          });
        }
      }
    };

    const handleIframeError = () => {
      setIframeLoaded(false);
      setIframeError(true);
    };

    const handleMessage = (event) => {
      if (event.origin !== source) return;
      if (event.data.type === "formSubmitted") {
        if (remainingTime > 0) handleTimeout();
        setFormSubmitted(true);
        localStorage.setItem(formKey, "submitted");
      }
    };

    if (!isMarkdown) {
      window.addEventListener("message", handleMessage);
      if (iframe) {
        iframe.addEventListener("load", handleIframeLoad);
        iframe.addEventListener("error", handleIframeError);
      }
    }

    return () => {
      if (!isMarkdown) {
        window.removeEventListener("message", handleMessage);
        if (iframe) {
          iframe.removeEventListener("load", handleIframeLoad);
          iframe.removeEventListener("error", handleIframeError);
        }
      }
    };
  }, [source, formKey, timeKey, dataKey, formSubmitted]);

  useEffect(() => {
    if (isOnline && wasOffline) {
      restoreRemainingTime();
      restoreFormData();
    } else if (!isOnline) {
      saveRemainingTime(remainingTime);
      saveFormData();
    }
    setWasOffline(!isOnline);
  }, [isOnline]);

  useEffect(() => {
    const resetTimer = () => {
      remainingTimeRef.current = timer.duration;
      setRemainingTime(timer.duration);
    };
    resetTimer();
  }, [pathname]);

  const handleTimeout = () => {
    resetForm();
    localStorage.removeItem(dataKey);
    localStorage.removeItem(timeKey);
  };

  const handleTimeUpdate = (timeLeft) => {
    setRemainingTime(timeLeft);
  };

  const handleSubmit = () => {
    setFormSubmitted((prev) => {
      localStorage.setItem(formKey, "submitted");
      localStorage.removeItem(dataKey);
      localStorage.removeItem(timeKey);
      return !prev;
    });
  };

  if (!source) return <Fallback message="File Not Found" styles="text-red-500" />;
  if (!isOnline) return <Fallback message="You are Offline" styles="text-primary" />;
  if (iframeError) return <Fallback message="Failed to load content" styles="text-red-500" />;

  return (
    <div className="w-full h-full overflow-y-auto p-3 md:p-2">
      {timer.status &&
        iframeLoaded &&
        !formSubmitted &&
        subtopic?.id === "quiz" && (
          <Timer
            duration={timer.duration}
            threshold={timer.threshold}
            onTimeout={handleTimeout}
            shouldRun={!formSubmitted}
            remainingTime={remainingTime}
            onTimeUpdate={handleTimeUpdate}
          />
        )}

    {isMarkdown ? (
  <div className="markdown-body">
    <div dangerouslySetInnerHTML={{ __html: marked(markdownContent) }} />
  </div>
) : (
  <iframe
    id="ifile"
    loading="lazy"
    ref={iframeRef}
    src={`${source}`}
    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    title={link ? link.title : subtopic?.title}
    className="h-full w-full overflow-y-scroll rounded-md pointer-events-auto"
  />
)}

    </div>
  );
};

export default TopicDetails;
