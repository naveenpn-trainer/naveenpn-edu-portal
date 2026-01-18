import { useEffect, useState } from "react";
import { getDoc } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import UserDialog from "@/components/Dialog";
import GetDocRef from "@/utils/getDocRef";
import useInternetStatus from "@/hooks/InternetStatus";
import { useSearchParams } from "react-router-dom";

const Verify = () => {
  const { toast } = useToast();
  const [params] = useSearchParams();
  const [id, setId] = useState(params.get("id") || "");
  const [data, setData] = useState("");
  const isOnline = useInternetStatus();
  const [open, setOpen] = useState(false);
  const { docRef, setdocRef } = GetDocRef(id);
  const [wasOffline, setWasOffline] = useState(false);

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

  const handleSubmit = async () => {
    if (id) {
      if (docRef) {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData(docSnap.data());
          setOpen(true);
          setdocRef(null);
        }
      } else {
        toast({
          variant: "destructive",
          title: `Invalid Certification ID!`,
          description: "Please enter a valid Certification ID",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: `Certification ID Required!`,
        description: "Please enter the Certification ID",
      });
    }
  };

  if (open && data) {
    return (
      <UserDialog
        id={id}
        setId={setId}
        open={open}
        setOpen={setOpen}
        data={data}
        setData={setData}
      />
    );
  }

  return (
    <div className="p-5 bg-[url('/bg.jpg')] h-screen">
      <div className="flex flex-col items-center text-center w-full text-white">
        <h1 className="text-3xl lg:text-5xl xl:text-6xl font-semibold mt-8 mb-5 lg:my-12">
          NPN Training
        </h1>
        <p className="text-lg mb-5 font-semibold">
          All certificates distributed by NPN Training have a unique
          Certification ID.
        </p>
        <div className="flex flex-col gap-4 lg:gap-6 justify-between items-center w-full bg-white rounded-lg text-gray-500 shadow-xl lg:w-3/4 p-5 lg:p-10">
          <p className="text-lg xl:text-xl">
            To verify the authenticity of a certificate issued by NPN Training,
            please enter the Certification ID
          </p>
          <Input
            type="text"
            placeholder="Certification ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            className="w-full md:w-[400px] py-5 lg:py-6 px-5 mx-auto border-2 border-[#f29121] focus-visible:ring-0"
          />
          <Button
            type="submit"
            onClick={handleSubmit}
            className="bg-[#f29121] font-bold w-full md:w-fit mx-auto py-5 lg:py-6 text-lg px-16 hover:bg-[#f29121]"
          >
            Verify
          </Button>
          <p className="text-base md:text-lg xl:text-xl">
            Kindly contact us at
            <a
              href="mailto:info@npntraining.com"
              target="_blank"
              className="text-[#f29121] mx-2"
            >
              info@npntraining.com
            </a>
            regarding fraudulent certificates
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;
