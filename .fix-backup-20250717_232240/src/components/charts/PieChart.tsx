import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
    data: {
        labels: string[];
        datasets: Array<{
            data: number[];
            backgroundColor: string[];
            borderColor?: string[];
            borderWidth?: number;
        }>;
    };
    title?: string;
    height?: number;
}

export const PieChart: React.FC<PieChartProps> = ({ data, title, height = 300 }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
                labels: {
                    color: 'rgb(156, 163, 175)',
                    padding: 20,
                },
            },
            title: {
                display: !!title,
                text: title,
                color: 'rgb(229, 231, 235)',
            },
        },
    };

    return (
        <div style={{ height }}>
            <Pie data={data} options={options} />
        </div>
    );
};

export default PieChart;
