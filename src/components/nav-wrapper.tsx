"use client";

import { usePathname } from "next/navigation";
import Nav from "./nav";

export default function NavWrapper() {
  const pathname = usePathname();
  // Don't show nav on landing page
  if (pathname === "/") return null;
  return <Nav />;
}
