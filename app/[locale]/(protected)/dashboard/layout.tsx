import PageTitle from "@/components/page-title";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "APT Next Js",
  description: "APT средство автоматизированного пентеста.",
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>
    <PageTitle className="mb-6" />
    {children}</>;
};

export default Layout;
