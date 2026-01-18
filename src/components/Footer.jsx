import { coursesList } from "@/data/global_config";

const Footer = () => {
  const courseCode = localStorage.getItem("courseCode");
  const {footer} = coursesList[courseCode]?.globalTitles || {};
  return (
    <div>
      <h1 className="text-white bg-primary h-12 w-full flex flex-col md:flex-row text-sm lg:text-base justify-center md:justify-between items-center px-3 md:px-16">
        <p>{footer?.copyRights}</p>
        <p>{footer?.maintainence}</p>
      </h1>
    </div>
  );
};

export default Footer;
