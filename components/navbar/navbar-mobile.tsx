"use client";

import { NavbarUserLinks } from "@/components/navbar/navbar-user-links";
import { buttonVariants } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { MenuIcon } from "lucide-react";

export const NavbarMobile = () => {
  return (
    <>
      <NavigationMenu>
        <NavigationMenuList className="text-center">
          <NavigationMenuItem>
            <NavigationMenuTrigger className="-mr-4">
              <MenuIcon />
            </NavigationMenuTrigger>
            <NavigationMenuContent className="flex flex-col p-1 justify-center items-center">
              <NavigationMenuLink
                href="/campaigns"
                className={buttonVariants({ variant: "link" })}
              >
                Campaigns
              </NavigationMenuLink>
              <NavigationMenuLink
                href="/calendar"
                className={buttonVariants({ variant: "link" })}
              >
                Calendar
              </NavigationMenuLink>

            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <div className="flex flex-col mb-2">
              <NavbarUserLinks />
            </div>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
};
