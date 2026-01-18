import { useEffect, useState } from "react";
import GetUserRef from "@/utils/getUserRef";
import { getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { coursesList } from "@/data/global_config";
import { Button } from "@/components/ui/button";
import isCourseExpired from "@/utils/courseExpiry";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import Loading from "@/components/Loader";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { docRef } = GetUserRef();
  const courseExpired = isCourseExpired();

  const courseCode = localStorage.getItem("courseCode");
  const courseDetails = coursesList?.[courseCode];
  const {
    expiryDate,
    globalTitles: {
      header: { courseTitle },
    },
  } = courseDetails;

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    linkedin: "",
    mobile: "",
    myNotes: "",
    myProgress: "",
    certificates: {},
  });

  useEffect(() => {
    setLoading(true);
    const fetchUserDoc = async () => {
      try {
        if (docRef) {
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
			setProfileData({
			  name: userData.fullName || userData.Name || "",
			  email: userData.email || user.email || "",
			  linkedin: userData.LinkedIn || "",
			  mobile: userData.PhoneNumber || "",
			  myNotes: userData.MyNotes || "",
			  myProgress: userData.MyProgress || "",
			  certificates: userData.Certificates || {},
			});
          } else {
            console.error("Document does not exist");
          }
        }
      } catch (error) {
        console.error("Error fetching user document:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDoc();
  }, [docRef, courseDetails, courseExpired, user]);

  const handleSubmit = async () => {
    try {
      if (docRef) {
        const updateData = {
		  fullName: profileData.name,
		  LinkedIn: profileData.linkedin,
		  PhoneNumber: profileData.mobile,
		  MyNotes: profileData.myNotes,
		  MyProgress: profileData.myProgress,
		};
        await updateDoc(docRef, updateData);
        setEditMode(false);
        toast({
          variant: "success",
          title: `Profile Updated Successfully`,
          description: "Always keep your profile updated",
        });
      } else {
        console.error("No document reference found.");
      }
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return loading ? (
    <Loading />
  ) : (
    <div className="md:w-full w-screen h-full overflow-x-hidden p-4 xl:px-8 xl:py-6">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-center font-medium text-2xl lg:text-4xl text-secondary">
          Your Profile
        </h1>
        <div className="flex">
          {editMode ? (
            <div className="flex justify-center gap-4 items-center w-fit mx-auto">
              <Button
                onClick={() => setEditMode(false)}
                className=" text-white font-medium mx-auto w-fit"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                variant="secondary"
                className=" text-white font-medium mx-auto w-fit"
              >
                Save
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => setEditMode(true)}
              variant="secondary"
              className=" text-white font-medium mx-auto w-fit lg:px-6 lg:text-base"
            >
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full mt-4 lg:mt-7 place-items-start">
        {/* Personal Information */}
        <div className="flex flex-col gap-5 justify-center w-full">
          <h1 className="text-2xl lg:text-3xl font-semibold max-md:text-center">
            Personal Information
          </h1>
          <div className="flex items-center gap-3 w-full">
            <div className="flex flex-col justify-center gap-5 w-full">
              {/* Name Field */}
              <div className="text-start text-lg lg:text-xl flex flex-col md:flex-row md:items-center max-md:gap-2 w-full">
                Name :
                {editMode ? (
                  <input
                    type="text"
                    name="name"
                    className="ml-2 flex-1 border-2 rounded-md text-base px-3 py-1.5"
                    value={profileData.name}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="font-bold lg:ml-2 flex-1">{profileData.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div className="text-start text-lg lg:text-xl flex flex-col md:flex-row md:items-center max-md:gap-2 w-full">
                Email :
                <p className="font-bold lg:ml-2 flex-1">{profileData.email}</p>
              </div>

              {/* LinkedIn Field */}
              <div className="text-start text-lg lg:text-xl flex flex-col md:flex-row md:items-center max-md:gap-2 w-full">
                LinkedIn :
                {editMode ? (
                  <input
                    type="text"
                    name="linkedin"
                    className="ml-2 flex-1 border-2 rounded-md text-base px-3 py-1.5"
                    value={profileData.linkedin}
                    onChange={handleChange}
                  />
                ) : (
                  <a
                    href={profileData.linkedin}
                    target="_blank"
                    className="font-bold lg:ml-2 text-base flex-1"
                  >
                    {profileData.linkedin}
                  </a>
                )}
              </div>

              {/* Phone Number Field */}
              <div className="text-start text-lg lg:text-xl flex flex-col md:flex-row md:items-center max-md:gap-2 w-full">
                Phone Number :
                {editMode ? (
                  <input
                    type="text"
                    name="mobile"
                    className="ml-2 flex-1 border-2 rounded-md text-base px-3 py-1.5"
                    value={profileData.mobile}
                    onChange={handleChange}
                  />
                ) : (
                  <p className="font-bold lg:ml-2 flex-1">
                    {profileData.mobile}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Course Information */}
        <div className="flex flex-col gap-5 justify-center w-full">
          <h1 className="text-2xl lg:text-3xl font-semibold max-md:text-center">
            Course Information
          </h1>
          <div className="flex items-start gap-3 w-full">
            <div className="flex flex-col justify-center gap-5 w-full">
              <div className="text-start text-lg lg:text-xl flex flex-col md:flex-row md:items-center max-md:gap-2 w-full">
                Title :<p className="font-bold lg:ml-2 flex-1">{courseTitle}</p>
              </div>
              {expiryDate && (
                <div className="text-start text-lg lg:text-xl flex flex-col md:flex-row md:items-center max-md:gap-2 w-full">
                  {courseExpired ? "Expired On :" : "Validity :"}
                  <p className="font-bold lg:ml-2 flex-1">
                    {format(expiryDate, "dd/MM/yyyy")}
                  </p>
                </div>
              )}
              <div className="text-start text-lg lg:text-xl flex flex-col md:flex-row md:items-center max-md:gap-2 w-full">
                Availability :
                <p className="font-semibold lg:ml-2 flex-1">
                  {courseExpired ? (
                    <span className="text-red-600">Expired</span>
                  ) : (
                    <span className="text-green-600">Active</span>
                  )}
                </p>
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full max-w-full overflow-hidden">
                <p className="text-start text-lg lg:text-xl w-fit">Notes :</p>
                <input
                  type="text"
                  name="myNotes"
                  placeholder="https://docs.google.com/document/d/1WJGv8SW9fe7swnxr3dq84622..."
                  className="lg:ml-2 flex-1 border-2 rounded-md px-3 py-1.5"
                  value={profileData.myNotes}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-center w-full max-w-full overflow-hidden">
                <p className="text-start text-lg lg:text-xl w-fit">
                  Progress :
                </p>
                <input
                  type="text"
                  name="myProgress"
                  placeholder="https://docs.google.com/document/d/1WJGv8SW9fe7swnxr3dq84622..."
                  className="lg:ml-2 flex-1 border-2 rounded-md px-3 py-1.5"
                  value={profileData.myProgress}
                  onChange={handleChange}
                  disabled={!editMode}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Certificates Section */}
      <div className="w-full overflow-x-auto mt-4 lg:mt-7">
        <h1 className="text-2xl lg:text-3xl font-semibold text-center text-underline my-5">
          Certificates
        </h1>
        <div className="flex w-full max-w-screen overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className=" font-semibold text-base lg:text-lg">
                <th className="border-2 border-gray-400 bg-gray-100 lg:w-[30%] p-2">
                  Certification Name
                </th>
                <th className="border-2 border-gray-400 bg-gray-100 lg:w-[30%] p-2">
                  Certification Id
                </th>
                <th className="border-2 border-gray-400 bg-gray-100 lg:w-[20%] p-2">
                  Download Link
                </th>
                <th className="border-2 border-gray-400 bg-gray-100 lg:w-[20%] p-2">
                  Verification Link
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(profileData.certificates).map(
                ([key, value], index) => {
                  const [title, url] = value.split("#$");
                  return (
                    <tr key={index}>
                      <td className="border-2 border-gray-400 text-center p-2">
                        {title}
                      </td>
                      <td className="border-2 border-gray-400 text-center p-2">
                        {key}
                      </td>
                      <td className="border-2 border-gray-400 text-center p-2">
                        <a
                          download
                          // href={url}
                          href={`https://drive.usercontent.google.com/u/0/uc?id=${url}&export=download`}
                          target="_blank"
                          className="text-blue-500 hover:underline"
                        >
                          Download
                        </a>
                      </td>
                      <td className="border-2 border-gray-400 text-center p-2">
                        <Link
                          to={`/verify?id=${key}`}
                          target="_blank"
                          className="text-blue-500 hover:underline"
                        >
                          Verify
                        </Link>
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Profile;
