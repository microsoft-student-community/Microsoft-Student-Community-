"use client";

import { usePathname } from "next/navigation";
import CustomCursor from "@/components/CustomCursor";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const APP_ROUTES = ["/admin", "/login", "/onboarding", "/event-portal"];

export default function AppChrome({ children }) {
  const pathname = usePathname();
  const isWorkspaceRoute = APP_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isEventPortal = pathname.startsWith("/event-portal");

  return (
    <>
      {!isWorkspaceRoute && <CustomCursor />}
      {!isWorkspaceRoute && <Navbar />}
      {children}
      {!isWorkspaceRoute && !isEventPortal && <Footer />}
    </>
  );
}
