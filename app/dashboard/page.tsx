'use client';

import { useEffect, useState } from 'react';
import { PerformanceMetric } from '../medical/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Link from 'next/link';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const [performanceData, setPerformanceData] = useState<PerformanceMetric[]>([]);
  const [averageLoadTimes, setAverageLoadTimes] = useState<{ [key: string]: number }>({});
  const [totalActions, setTotalActions] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const storedData = localStorage.getItem('performanceData');
    if (storedData) {
      const data: PerformanceMetric[] = JSON.parse(storedData);
      setPerformanceData(data);

      // Calculate average load times per action
      const loadTimes: { [key: string]: number[] } = {};
      const actionCounts: { [key: string]: number } = {};

      data.forEach(metric => {
        if (!loadTimes[metric.action]) {
          loadTimes[metric.action] = [];
          actionCounts[metric.action] = 0;
        }
        loadTimes[metric.action].push(metric.totalTime);
        actionCounts[metric.action]++;
      });

      // Calculate averages
      const averages = Object.entries(loadTimes).reduce((acc, [action, times]) => {
        acc[action] = Math.round(times.reduce((sum, time) => sum + time, 0) / times.length);
        return acc;
      }, {} as { [key: string]: number });

      setAverageLoadTimes(averages);
      setTotalActions(actionCounts);
    }
  }, []);

  const chartData = {
    labels: Object.keys(averageLoadTimes),
    datasets: [
      {
        label: 'Average Load Time (ms)',
        data: Object.values(averageLoadTimes),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Average Load Time by Action',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Time (milliseconds)',
        },
      },
    },
  };

  return (
    <main className="container mx-auto max-w-6xl p-5 bg-white text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Performance Dashboard</h1>
        <Link
          href="/medical"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Documents
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Total Records</h3>
          <p className="text-3xl font-bold">{performanceData.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Unique Actions</h3>
          <p className="text-3xl font-bold">{Object.keys(averageLoadTimes).length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Average Overall Time</h3>
          <p className="text-3xl font-bold">
            {Math.round(
              performanceData.reduce((acc, curr) => acc + curr.totalTime, 0) / performanceData.length || 0
            )}ms
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200 mb-8">
        <Bar options={chartOptions} data={chartData} />
      </div>

      {/* Detailed Table */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Action Performance Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Average Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total Occurrences</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(averageLoadTimes).map(([action, avgTime]) => (
                <tr key={action}>
                  <td className="px-6 py-4 whitespace-nowrap">{action}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{avgTime}ms</td>
                  <td className="px-6 py-4 whitespace-nowrap">{totalActions[action]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
} 