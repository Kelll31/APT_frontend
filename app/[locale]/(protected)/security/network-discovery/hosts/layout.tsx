import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Обнаружение хостов | APT Security Suite",
    description: "Автоматизированное обнаружение и анализ устройств в сетевой инфраструктуре с использованием различных методов сканирования",
    keywords: "обнаружение хостов, сканирование сети, network discovery, топология сети, сетевая безопасность, пентест",
    robots: "noindex, nofollow", // Защищенная страница - не индексировать
    viewport: "width=device-width, initial-scale=1",
    openGraph: {
        title: "Обнаружение хостов | APT Security Suite",
        description: "Комплексное обнаружение и анализ сетевых устройств",
        type: "website",
        locale: "ru_RU",
    },
    twitter: {
        card: "summary_large_image",
        title: "Обнаружение хостов | APT Security Suite",
        description: "Автоматизированное обнаружение устройств в сети",
    },
};

interface LayoutProps {
    children: React.ReactNode;
}

const HostDiscoveryLayout = ({ children }: LayoutProps) => {
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

export default HostDiscoveryLayout;
