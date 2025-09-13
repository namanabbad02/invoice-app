import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { getRevenueTrend } from '../services/api';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-4">
        <p className="font-semibold">{label}</p>
        <p className="text-green-400">Revenue: ₹{payload[0].value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
};

const RevenueChart = () => {
  const [data, setData] = useState([]);
  const [period, setPeriod] = useState('daily');
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.token) return;
      try {
        const response = await getRevenueTrend(period, user.token);
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch revenue trend", error);
      }
    };
    fetchData();
  }, [period, user]);
  
  const renderToggleButton = (buttonPeriod, text) => (
    <button onClick={() => setPeriod(buttonPeriod)} className={`px-4 py-1 rounded-md text-sm font-semibold ${period === buttonPeriod ? 'bg-white dark:bg-gray-900 shadow' : 'hover:bg-gray-300/50 dark:hover:bg-gray-600/50'}`}>
      {text}
    </button>
  );

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Revenue Overview</h2>
        <div className="flex space-x-2 p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
          {renderToggleButton('hourly', 'Today (Hourly)')}
          {renderToggleButton('daily', 'Last 7 Days')}
        </div>
      </div>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
            <XAxis dataKey="label" />
            <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" stroke="#4CAF50" fillOpacity={1} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;