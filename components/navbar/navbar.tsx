"use client";
import { FC } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { CalendarIcon, CampaignIcon, PostIcon, FishIcon } from "lucide-react";
import { NavbarMobile } from "@/components/navbar/navbar-mobile";
import { NavbarUserLinks } from "@/components/navbar/navbar-user-links";

export const NavBar: FC = () => {
  return (
    <header className="w-full border-b bg-white shadow-sm animate-in fade-in">
      <div className="container mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <FishIcon className="w-8 h-8 mr-2 text-blue-600" />
          <span className="text-2xl font-bold tracking-tight text-slate-800">
            Dolze
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-6 grow justify-between">
          {/* Left links */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className={buttonVariants({ variant: "link" })}>
              <CampaignIcon className="inline w-5 h-5 mr-1" /> Campaigns
            </Link>
            <Link href="/posts" className={buttonVariants({ variant: "link" })}>
              <PostIcon className="inline w-5 h-5 mr-1" /> Posts
            </Link>
            <Link href="/calendar" className={buttonVariants({ variant: "link" })}>
              <CalendarIcon className="inline w-5 h-5 mr-1" /> Calendar
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
