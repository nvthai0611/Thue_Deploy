"use client";

import { useParams } from "next/navigation";

function RegisterLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { step: currentPage } = useParams();

  return (
    <div className="bg-primary-foreground py-5">
      <div className="max-w-5xl mx-auto rounded-md bg-card text-card-foreground shadow-sm py-4">
        <div className="w-full flex flex-col items-center">
          <div className="max-w-2xl w-full flex flex-row items-start justify-center h-full gap-4 my-4">
            <div className="flex flex-col gap-2 items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-sm">Property Document</p>
            </div>
            <div
              className={`border-t-2 transition-all duration-300 ease-in-out border-gray-300 ${currentPage === "identification-information" || currentPage === "complete" ? "border-red-500" : "border-gray-300"} flex-1 mt-1`}
            ></div>
            <div className="flex flex-col gap-2 items-center">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${currentPage === "identification-information" || currentPage === "complete" ? "bg-red-500" : "bg-gray-300"}`}
              ></div>
              <p
                className={`text-sm ${currentPage === "identification-information" || currentPage === "complete" ? "" : "text-gray-300"}`}
              >
                Identification Information
              </p>
            </div>
            <div
              className={`border-t-2 transition-all duration-300 ease-in-out border-gray-300 ${currentPage === "complete" ? "border-red-500" : "border-gray-300"} flex-1 mt-1`}
            ></div>
            <div className="flex flex-col gap-2 items-center">
              <div
                className={`w-3 h-3 rounded-full animate-pulse ${currentPage === "complete" ? "bg-red-500" : "bg-gray-300"}`}
              ></div>
              <p
                className={`text-sm ${currentPage === "complete" ? "" : "text-gray-300"}`}
              >
                Complete
              </p>
            </div>
          </div>
          <div className="border-b border-primary-foreground w-full mt-2"></div>{" "}
          <div className="mt-10 w-full h-full">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default RegisterLayout;
