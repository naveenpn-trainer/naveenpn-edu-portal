/* eslint-disable react/prop-types */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { coursesList } from "@/data/global_config";
import { Fragment } from "react";
import { GoCircle } from "react-icons/go";
import { Link, useLocation } from "react-router-dom";

const LinkItem = ({ to, title, isActive, styles }) => (
  <p
    className={`${
      isActive ? "bg-gray-300 rounded-sm text-black text-xs" : `${styles}`
    } px-2 py-[7px] w-full justify-start cursor-pointer`}
  >
    <Link className="font-medium" to={to}>
      {title}
    </Link>
  </p>
);

const SubTopic = ({ topicId, subtopic, currentPath }) => {
  const isActiveSubtopic =
    currentPath.includes(topicId) && currentPath.includes(subtopic?.id);

  return (
    <>
      {subtopic?.links?.length > 0 ? (
        <Accordion
          type="single"
          collapsible
          className="w-full"
          key={subtopic?.id}
        >
          <AccordionItem
            value={subtopic?.id}
            className="justify-start border-none"
          >
            <AccordionTrigger className="text-xs font-medium text-black leading-none py-2 px-2 hover:no-underline">
              {subtopic?.title}
            </AccordionTrigger>
            <AccordionContent className="pb-0 px-2">
              {subtopic?.links?.map((link) => (
                <Fragment key={link?.id}>
                  {link?.id?.includes("external") ? (
                    <a
                      className="py-2 px-2 flex w-full text-xs font-medium"
                      referrerPolicy="no-referrer"
                      target="blank"
                      href={link?.url}
                    >
                      {link?.title}
                    </a>
                  ) : (
                    <LinkItem
                      to={`${topicId}/${subtopic.id}/${link?.id}`}
                      title={link?.title}
                      isActive={
                        isActiveSubtopic && currentPath.includes(link?.id)
                      }
                      styles={"text-xs"}
                    />
                  )}
                </Fragment>
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : subtopic?.id?.includes("external") ? (
        <a
          className="py-2 px-2 flex w-full text-xs font-medium"
          referrerPolicy="no-referrer"
          target="blank"
          href={subtopic?.url}
        >
          {subtopic?.title}
        </a>
      ) : (
        <LinkItem
          key={subtopic?.id}
          to={`${topicId}/${subtopic?.id}`}
          title={subtopic?.title}
          isActive={isActiveSubtopic}
          styles={"text-xs"}
        />
      )}
    </>
  );
};

const CourseList = () => {
  const { pathname } = useLocation();
  const courseCode = localStorage.getItem("courseCode");
  const topics = coursesList[courseCode]?.data || [];

  return (
    <div className="w-[210px] md:w-[175px] lg:w-[210px] h-full pb-1 md:max-h-[calc(100vh-6rem)] bg-white md:border-r-[1px] md:border-gray-500 overflow-y-auto">
      {topics?.map((topic) => {
        const isSelfStudyModule = topic?.class === "self-study";
        return (
          <Fragment key={topic?.id}>
            {topic?.class === "seperator" ? (
              <h1 className=" text-xs lg:text-sm font-medium py-[8px] px-2 text-white bg-gray-500">
                {topic?.title}
              </h1>
            ) : (
              <Accordion
                type="single"
                collapsible
                className="w-full"
                key={topic?.id}
              >
                <AccordionItem
                  value={topic?.id}
                  className="px-0 border-b-[0.75px] border-gray-500"
                >
                  <AccordionTrigger
                    className={`relative flex items-start text-xs text-start lg:font-medium leading-normal px-1.5 py-1 hover:no-underline`}
                  >
                    {topic?.title}
                    {isSelfStudyModule && (
                      <GoCircle
                        className="absolute right-2 bottom-2 bg-gray-400 text-gray-400 border-0 rounded-full w-3 h-3"
                        size={20}
                      />
                    )}
                  </AccordionTrigger>
                  <AccordionContent className="pb-0 px-2">
                    {topic?.subtopics?.map((subtopic) => (
                      <SubTopic
                        key={subtopic?.id}
                        topicId={topic?.id}
                        subtopic={subtopic}
                        currentPath={pathname}
                      />
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </Fragment>
        );
      })}
    </div>
  );
};

export default CourseList;
