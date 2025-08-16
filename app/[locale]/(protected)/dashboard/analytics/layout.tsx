import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Дашборд | APT Security",
    description: "Дашборд аналитики безопасности, включая метрики, тренды уязвимостей и соответствие стандартам",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

export default Layout;
