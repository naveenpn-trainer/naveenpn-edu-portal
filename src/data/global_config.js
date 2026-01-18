import { FaYoutube, FaLinkedin, FaVideo, FaCode } from "react-icons/fa";

import data_engineering_with_databricks from "./data_engineering_with_databricks.json";
import sdet_npntraining from "./sdet_npntraining.json";
import azure_data_engineering_corporate from "./data_engineering_on_microsoft_azure_corporate.json";
import java_for_backend_development from "./java_for_backend_development.json";
import databricks_certified_data_engineer_associate from "./databricks_certified_data_engineer_associate.json";
import mern from "./full_stack_web_development_with_mern.json";

export const timer = {
  status: true,
  duration: 15 * 60,
  threshold: 5 * 60,
};

export const sessionDuration = 1000 * 60 * 60; // Default time 1 hour (in milliseconds)

export const coursesList = {
  256701: {
    homePage:
      "https://docs.google.com/document/d/e/2PACX-1vRw2tdvwW_ZjY0Zt-qSos1Vhzm23hpwo7cNfcrp88LUK91tEUkmyan9CdJxcwMMkJoYxaE1fZIPIAmT/pub?embedded=true",
    reportPage: "https://example.com/report",
    plannerPage:
	"https://docs.google.com/spreadsheets/d/e/2PACX-1vRhOyBvPyIi95p5twm3MHL_bq45zTMTV0GdldMunCaogGI2pZq5GxRI1jh82SSAeFB8kkYSjSVh6_ce/pubhtml?widget=true&amp;headers=false"
      ,
    evaluationPage: "",
    courseWelcomePage:
      "https://docs.google.com/document/d/e/2PACX-1vSjiTOCRoVS9wh30N_mHqO00Df1NhyeXfnlPqBoC3jXJcm5t6X-UYD3I4Z9PkpMVNAAc-4CQ5ytcNZZ/pub?embedded=true",
    askQuestionsPage:
      "https://docs.google.com/forms/d/e/1FAIpQLSdvAAHRaiHHJrdBv-xS053Ky2TZEEh2K-y4Su7RiQfMFTZM5w/viewform?usp=sf_link",
    data: data_engineering_with_databricks,
    expiryDate: "12/30/2026",
    globalTitles: {
      header: {
        logo: "/Logo.png",
        title: "NPN Training",
        courseTitle: "Data Engineering with Databricks",
      },
      socialHandles: [
        {
          id: "youtube",
          url: "https://www.youtube.com/npntraining",
          icon: FaYoutube,
        },
        {
          id: "linkedIn",
          url: "https://www.linkedin.com/NPNTraining",
          icon: FaLinkedin,
        },
        {
          id: "googlemeet",
          url: "https://meet.google.com/uux-tpip-xqt",
          icon: FaVideo,
        },
        {
          id: "code",
          url: "https://codeshare.io/9bz4E4",
          icon: FaCode,
        },
      ],
      appointment: "https://topmate.io/naveenpn",
      footer: {
        copyRights: `@ ${new Date().getFullYear()} NPN Training PVT Ltd. All Rights Reserved`,
        maintainence: "Developed and Managed by NPN Training",
      },
    },
  },

  sdet_npntraining: {
    homePage:
      "https://docs.google.com/document/d/1RGVi5VKP9mggcliQd3RSih8jgWWMitCQC-zj7YtHAG4/pub?embedded=true",
    reportPage: "https://example.com/report",
    plannerPage:  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSQVjYpjYip3c_JZBP7GMPogIPDUYNSGPhUDDKQmx976oyno_3LcTxtk8_k949Q4VlwpycJ_U5V89jx/pubhtml?widget=true&amp;headers=false",
    evaluationPage: "https://example.com/report",
    courseWelcomePage:
      "https://docs.google.com/document/d/1I_XlJDniw6Yq6jfGkPIe008DckBEe5mt1IvTB1mEbyQ/preview",
    askQuestionsPage:
      "https://docs.google.com/forms/d/e/1FAIpQLSdvAAHRaiHHJrdBv-xS053Ky2TZEEh2K-y4Su7RiQfMFTZM5w/viewform?usp=sf_link",
    data: sdet_npntraining,
    expiryDate: "12/30/2025",
    globalTitles: {
      header: {
        logo: "/Logo.png",
        title: "NPN Training",
        courseTitle: "Data Engineering on Microsoft Azure",
      },
      socialHandles: [
        {
          id: "youtube",
          url: "https://www.youtube.com/npntraining",
          icon: FaYoutube,
        },
        {
          id: "linkedIn",
          url: "https://www.linkedin.com/NPNTraining",
          icon: FaLinkedin,
        },
        {
          id: "googlemeet",
          url: "https://meet.google.com/uux-tpip-xqt",
          icon: FaVideo,
        },
      ],
      appointment: "https://topmate.io/naveenpn",
      footer: {
        copyRights: `@ ${new Date().getFullYear()} NPN Training PVT Ltd. All Rights Reserved`,
        maintainence: "Developed and Managed by NPN Training",
      },
    },
  },
  greystar18112024: {
    homePage: "https://example.com/course",
    reportPage: "",
    plannerPage: "",
    evaluationPage: "",
    courseWelcomePage: "https://example.com/course",
    askQuestionsPage:
      "https://docs.google.com/forms/d/e/1FAIpQLSdvAAHRaiHHJrdBv-xS053Ky2TZEEh2K-y4Su7RiQfMFTZM5w/viewform?usp=sf_link",
    data: azure_data_engineering_corporate,
    expiryDate: "04/30/2025",
    globalTitles: {
      header: {
        logo: "/Logo.png",
        title: "Naveen Trainer",
        courseTitle: "Data Engineering with Azure Databricks",
      },
      socialHandles: [
        {
          id: "linkedIn",
          url: "https://www.linkedin.com/naveen-pn",
          icon: FaLinkedin,
        },
      ],
	  appointment: "https://topmate.io/naveenpn",
      footer: {
        copyRights: `@ ${new Date().getFullYear()} NPN EdTech Pvt Ltd. All Rights Reserved`,
        maintainence: "Developed and Managed by NPN EdTech Pvt. Ltd.",
      },
    },
  },
  
  gsk03022025a: {
    homePage: "https://example.com/course",
    reportPage: "",
    plannerPage: "",
    evaluationPage: "",
    courseWelcomePage: "https://example.com/course",
    askQuestionsPage:
      "https://docs.google.com/forms/d/e/1FAIpQLSdvAAHRaiHHJrdBv-xS053Ky2TZEEh2K-y4Su7RiQfMFTZM5w/viewform?usp=sf_link",
    data: java_for_backend_development,
    expiryDate: "04/30/2025",
    globalTitles: {
      header: {
        logo: "/Logo.png",
        title: "Naveen Trainer",
        courseTitle: "Java For Backend Development",
      },
      socialHandles: [
        {
          id: "linkedIn",
          url: "https://www.linkedin.com/naveen-pn",
          icon: FaLinkedin,
        },
      ],
	  appointment: "https://topmate.io/naveenpn",
      footer: {
        copyRights: `@ ${new Date().getFullYear()} NPN EdTech Pvt Ltd. All Rights Reserved`,
        maintainence: "Developed and Managed by NPN EdTech Pvt. Ltd.",
      },
    },
  }, gsk03022025b: {
    homePage: "https://example.com/course",
    reportPage: "",
    plannerPage: "",
    evaluationPage: "",
    courseWelcomePage: "https://example.com/course",
    askQuestionsPage:
      "https://docs.google.com/forms/d/e/1FAIpQLSdvAAHRaiHHJrdBv-xS053Ky2TZEEh2K-y4Su7RiQfMFTZM5w/viewform?usp=sf_link",
    data: mern,
    expiryDate: "04/30/2025",
    globalTitles: {
      header: {
        logo: "/Logo.png",
        title: "Naveen Trainer",
        courseTitle: "Full Stack Web Development using MERN",
      },
      socialHandles: [
        {
          id: "linkedIn",
          url: "https://www.linkedin.com/naveen-pn",
          icon: FaLinkedin,
        },
      ],
	  appointment: "https://topmate.io/naveenpn",
      footer: {
        copyRights: `@ ${new Date().getFullYear()} NPN EdTech Pvt Ltd. All Rights Reserved`,
        maintainence: "Developed and Managed by NPN EdTech Pvt. Ltd.",
      },
    },
  },
  mern101: {
    homePage: "https://example.com/course",
    reportPage: "",
    plannerPage: "",
    evaluationPage: "",
    courseWelcomePage: "https://example.com/course",
    askQuestionsPage:
      "https://docs.google.com/forms/d/e/1FAIpQLSdvAAHRaiHHJrdBv-xS053Ky2TZEEh2K-y4Su7RiQfMFTZM5w/viewform?usp=sf_link",
    data: mern,
    expiryDate: "04/30/2025",
    globalTitles: {
      header: {
        logo: "/Logo.png",
        title: "Naveen Trainer",
        courseTitle: "Full Stack Web Development using MERN",
      },
      socialHandles: [
        {
          id: "linkedIn",
          url: "https://www.linkedin.com/naveen-pn",
          icon: FaLinkedin,
        },
      ],
	  appointment: "https://topmate.io/naveenpn",
      footer: {
        copyRights: `@ ${new Date().getFullYear()} NPN EdTech Pvt Ltd. All Rights Reserved`,
        maintainence: "Developed and Managed by NPN EdTech Pvt. Ltd.",
      },
    },
  },
  dcdea201: {
    homePage: "https://example.com/course",
    reportPage: "",
    plannerPage: "",
    evaluationPage: "",
    courseWelcomePage: "https://docs.google.com/document/d/e/2PACX-1vT8hFwNPIzetDgPjIKrZoDBiYPBXDEKq3GrptGSFBXgZNxNG3RLcmvGfhPzOA733Q_LjpWSl8F25oi2/pub?embedded=true",
    askQuestionsPage:
      "https://docs.google.com/forms/d/e/1FAIpQLSdvAAHRaiHHJrdBv-xS053Ky2TZEEh2K-y4Su7RiQfMFTZM5w/viewform?usp=sf_link",
    data: databricks_certified_data_engineer_associate,
    expiryDate: "04/30/2025",
    globalTitles: {
      header: {
        logo: "/Logo.png",
        title: "Naveen Trainer",
        courseTitle: "Java For Backend Development",
      },
      socialHandles: [
        {
          id: "linkedIn",
          url: "https://www.linkedin.com/naveen-pn",
          icon: FaLinkedin,
        },
      ],
	  appointment: "https://topmate.io/naveenpn",
      footer: {
        copyRights: `@ ${new Date().getFullYear()} NPN EdTech Pvt Ltd. All Rights Reserved`,
        maintainence: "Developed and Managed by NPN EdTech Pvt. Ltd.",
      },
    },
  },
};
