import { Metadata } from "next";

export const metadata: Metadata = {
  title: "APT Next Js",
  description: "APT средство автоматизированного пентеста.",
};
const Layout = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default Layout;
