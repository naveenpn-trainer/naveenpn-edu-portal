/* eslint-disable react/prop-types */
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import {
  Cross1Icon,
  LinkedInLogoIcon,
  PersonIcon,
} from "@radix-ui/react-icons";
import { Button } from "./ui/button";
import { useSearchParams } from "react-router-dom";

const UserDialog = ({ data, setData, open, setOpen, id, setId }) => {
  const [params] = useSearchParams();

  const handleClick = () => {
    setId(params.get("id") || "");
    setData("");
    setOpen(false);
  };

  const certificate = data.Certificates[id];
  const [title, url] = certificate.split("#$");
  const isImage = /\.(jpeg|jpg|gif|png|svg|webp)$/i.test(url);

  return (
    <Dialog open={open}>
      <DialogContent className="lg:max-h-[95vh] lg:max-w-4xl xl:max-w-5xl border-2 mx-auto">
        <DialogHeader>
          <Button
            onClick={handleClick}
            className="absolute top-1.5 right-[6.5px] px-2.5 lg:px-3 text-black bg-white  rounded-full"
            aria-label="Close"
          >
            <Cross1Icon className="w-3 h-3 z-50" />
          </Button>
          <DialogDescription>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              <div className="flex items-center justify-center w-full mx-auto text-sm lg:text-lg border-[3px]">
                <p className="bg-gray-200 px-4 py-3 flex items-center justify-center h-full">
                  <PersonIcon className="w-5 h-5" />
                </p>
                <p className="px-5 py-2 flex-1">{data?.Name}</p>
              </div>
              <div className="flex items-center justify-center w-full mx-auto text-sm lg:text-lg border-[3px]">
                <p className="bg-gray-200 px-4 py-3 flex items-center justify-center h-full">
                  <LinkedInLogoIcon className="w-5 h-5" />
                </p>
                <a
                  href={data?.LinkedIn}
                  target="_blank"
                  className="px-5 py-2 flex-1 lg:text-base"
                >
                  {data?.LinkedIn}
                </a>
              </div>
            </div>
            <div className="flex w-full flex-col justify-center gap-4 mt-4">
              <div className="flex w-full h-[275px] lg:h-[350px] xl:h-[450px] lg:w-3/4 mx-auto">
                {isImage ? (
                  <img
                    src={url}
                    alt="Certificate"
                    className="w-full h-full object-fill"
                  />
                ) : (
                  <iframe
                    src={`${url}#toolbar=0&navpanes=0`}
                    // sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    alt="Certificate"
                    className="w-full h-full object-fill"
                  />
                )}
              </div>
              <a
                // href={url}
                href={`https://drive.usercontent.google.com/u/0/uc?id=${url}&export=download`}
                target="_blank"
                download={title}
                className="mx-auto"
              >
                <Button
                  type="submit"
                  className="bg-[#f29121] w-fit mx-auto text-base py-5 px-8 hover:bg-[#f29121]"
                >
                  Download
                </Button>
              </a>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
