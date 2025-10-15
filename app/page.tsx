"use client";

import { redirect } from "next/navigation";
import { useUser } from "reactfire";

export default function HomePage() {
    const { data, hasEmitted } = useUser();
    if (hasEmitted && data) {
        redirect("/campaigns");
    } else {
        redirect("/login");
    }
}
