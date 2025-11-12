"use client";

import React from "react";
import { FacebookIcon } from "./icon/facebook-icon";
import { InstagramIcon } from "./icon/instagram-icon";
import { XIcon } from "./icon/x-icon";
import Image from "next/image";
import logo from "@/assets/HolaRental.png";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return null;
  }

  return (
    <footer className="w-full bg-background grid md:grid-cols-5 pt-16 pb-12 md:pb-24 px-5 border-t border-primary-foreground shadow-md">
      <div />
      <div>
        <Image src={logo} alt="HolaRental" className="lg:w-1/2 -mt-5 -ml-1" />
        <p className="md:text-xl lg:text-4xl font-semibold">
          Tìm căn phòng phù hợp nhất
        </p>
        <p className="lg:text-xl text-foreground mt-4 italic">
          cho cuộc sống sinh viên của bạn
        </p>
      </div>
      <div />
      <div className="grid grid-cols-2 md:gap-10 mt-16 md:mt-0">
        <div>
          <h1 className="text-sm lg:text-2xl font-semibold">HolaRental</h1>
          <div className="border-l-4 border-red-700 pl-5 lg:mt-5">
            <p className="text-sm my-2">Trang chủ</p>
            <p className="text-sm my-2">Giới thiệu</p>
            <p className="text-sm my-2">Blog</p>
            <p className="text-sm my-2">Liên hệ</p>
          </div>
        </div>
        <div>
          <h1 className="text-sm lg:text-2xl font-semibold">Theo dõi</h1>
          <div className="flex gap-2 lg:mt-5">
            <FacebookIcon />
            <InstagramIcon />
            <XIcon />
          </div>
        </div>
      </div>
    </footer>
  );
}
