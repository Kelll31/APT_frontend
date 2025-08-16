import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Создание сценария атаки | APT Security",
    description: "Конструктор автоматизированных сценариев атак для тестирования на проникновение",
};

const Layout = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

export default Layout;
