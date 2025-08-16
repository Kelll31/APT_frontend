import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Шаблоны атак | APT Security",
    description: "Готовые шаблоны для автоматизации тестирования на проникновение с использованием различных векторов атак",
    keywords: "шаблоны атак, пентест, тестирование на проникновение, кибербезопасность, эксплойты",
};

const AttackTemplateLayout = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

export default AttackTemplateLayout;
