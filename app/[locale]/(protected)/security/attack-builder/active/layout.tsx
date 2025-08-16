import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Активные атаки | APT Security",
    description: "Мониторинг и управление активными атаками в режиме реального времени",
};

const ActiveAttackLayout = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

export default ActiveAttackLayout;
