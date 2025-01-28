import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Battery, Zap, DollarSign } from 'lucide-react';

const BESSArbitrageDashboard = () => {
  const [data, setData] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/bess-data');
        const result = await response.json();
        
        setLatestData(result.data);
        setData(prevData => {
          const newData = [...prevData, result.data];
          const trimmedData = newData.slice(-30);
          
          const total = trimmedData.reduce((sum, point) => sum + point.revenue, 0);
          setTotalRevenue(total);
          
          return trimmedData;
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!latestData) return <div className="p-4">Loading dashboard...</div>;

  return (
    <div className="p-4 bg-gray-50 min-h-screen h-full">
      <h1 className="text-2xl font-bold mb-6">BESS Arbitrage Dashboard</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Battery Status */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-600">Battery Status</h3>
            <Battery className={`h-4 w-4 ${latestData.soc > 80 ? 'text-green-500' : 'text-yellow-500'}`} />
          </div>
          <div className="text-2xl font-bold">{latestData.soc.toFixed(1)}%</div>
          <p className="text-xs text-gray-500">State of Charge</p>
        </div>

        {/* Power Output */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-600">Power Output</h3>
            <Zap className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{latestData.power_output.toFixed(1)} kW</div>
          <p className="text-xs text-gray-500">{latestData.charge_status}</p>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
            <DollarSign className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold">${latestData.revenue.toFixed(2)}</div>
          <p className="text-xs text-gray-500">Total: ${totalRevenue.toFixed(2)}</p>
        </div>

        {/* Energy Price */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-600">Energy Price</h3>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold">${latestData.energy_price.toFixed(2)}</div>
          <p className="text-xs text-gray-500">per kWh</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue & Price Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Revenue & Energy Price</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={false} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10B981" name="Revenue ($)" />
                <Line yAxisId="right" type="monotone" dataKey="energy_price" stroke="#8B5CF6" name="Energy Price ($/kWh)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Battery Performance Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Battery Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timestamp" tick={false} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="soc" stroke="#3B82F6" name="State of Charge (%)" />
                <Line yAxisId="right" type="monotone" dataKey="power_output" stroke="#EF4444" name="Power Output (kW)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BESSArbitrageDashboard;