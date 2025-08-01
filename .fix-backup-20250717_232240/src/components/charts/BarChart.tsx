import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

interface BarChartProps {
    data: {
        labels: string[];
        datasets: Array<{
            label: string;
            data: number[];
            backgroundColor?: string;
            borderColor?: string;
        }>;
    };
    title?: string;
    height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title, height = 300 }) => {
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: 'rgb(156, 163, 175)',
                },
            },
            title: {
                display: !!title,
                text: title,
                color: 'rgb(229, 231, 235)',
            },
        },
        scales: {
            x: {
                ticks: {
                    color: 'rgb(156, 163, 175)',
                },
                grid: {
                    color: 'rgba(75, 85, 99, 0.3)',
                },
            },
            y: {
                ticks: {
                    color: 'rgb(156, 163, 175)',
                },
                grid: {
                    color: 'rgba(75, 85, 99, 0.3)',
                },
            },
        },
    };

    return (
        <div style={{ height }}>
            <Bar data={data} options={options} />
        </div>
    );
};

export default BarChart;
