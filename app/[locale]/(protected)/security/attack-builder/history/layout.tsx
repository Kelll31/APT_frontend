import { Metadata } from "next";

export const metadata: Metadata = {
    title: "История атак | APT Security Suite",
    description: "Полная история выполненных атак и тестов на проникновение с расширенной аналитикой и детальными отчетами",
    keywords: "история атак, пентест, безопасность, аналитика, red team, blue team, уязвимости",
    robots: "noindex, nofollow", // Защищенная страница - не индексировать
    viewport: "width=device-width, initial-scale=1",
    openGraph: {
        title: "История атак | APT Security Suite",
        description: "Расширенная аналитика и история выполненных атак",
        type: "website",
        locale: "ru_RU",
    },
    twitter: {
        card: "summary_large_image",
        title: "История атак | APT Security Suite",
        description: "Полная история выполненных атак и тестов на проникновение",
    },
};

interface LayoutProps {
    children: React.ReactNode;
}

const AttackHistoryLayout = ({ children }: LayoutProps) => {
    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-6">
                {/* Основной контент страницы */}
                <main className="space-y-6">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AttackHistoryLayout;
