"use client";
import { FC } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { CalendarIcon,  FishIcon } from "lucide-react";
import { NavbarMobile } from "@/components/navbar/navbar-mobile";
import { NavbarUserLinks } from "@/components/navbar/navbar-user-links";

export const NavBar: FC = () => {
  return (
    <header className="w-full border-b bg-white shadow-sm animate-in fade-in">
      <div className="container mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/campaigns" className="flex items-center hover:opacity-80 transition-opacity">
          <FishIcon className="w-8 h-8 mr-2 text-blue-600" />
          <span className="text-2xl font-bold tracking-tight text-slate-800">
            Dolze
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-8 ml-12 grow justify-between">
          {/* Left links */}
          <div className="flex items-center space-x-4">
            <Link href="/campaigns" className={buttonVariants({ variant: "link" })}>
              Campaigns
            </Link>
            <Link href="/calendar" className={buttonVariants({ variant: "link" })}>
              Calendar
            </Link>
          </div>

          {/* Right user links */}
          <div className="flex items-center space-x-4">
            <NavbarUserLinks />
          </div>
        </nav>

        {/* Mobile nav toggle */}
        <div className="md:hidden flex items-center justify-end grow">
          <NavbarMobile />
        </div>
      </div>
    </header>
  );
};
