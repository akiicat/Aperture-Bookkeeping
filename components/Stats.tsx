import React from 'react';
import { MonthData, CATEGORIES } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatsProps {
  data: MonthData | null;
}

const Stats: React.FC<StatsProps> = ({ data }) => {
  if (!data || !data.transactions || data.transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
        <p>本月尚無資料可分析</p>
      </div>
    );
  }

  // Aggregate data by category
  const categoryTotals: Record<string, number> = {};
  data.transactions.forEach(t => {
      // Filter out income (Salary) typically from expense charts, or keep it separate. 
      // For this simplified view, we just sum everything but maybe show absolute value if mixed?
      // Assuming '薪資' is income.
      if (t.category !== '薪資') {
        const amt = Number(t.amount);
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
      }
  });

  const chartData = Object.entries(categoryTotals)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#0088FE', '#8884d8', '#82ca9d'];

  return (
    <div className="h-full bg-gray-50 flex flex-col pt-12 pb-20 overflow-y-auto">
      <h2 className="text-xl font-bold text-center mb-6 text-gray-800">支出分析</h2>
      
      <div className="h-64 w-full bg-white p-4 shadow-sm mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="px-4 space-y-2">
          {chartData.map((item, index) => {
              const totalExpense = chartData.reduce((acc, curr) => acc + curr.value, 0);
              const percentage = ((item.value / totalExpense) * 100).toFixed(1);
              
              return (
                  <div key={item.name} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
                      <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="font-medium text-gray-700">{item.name}</span>
                      </div>
                      <div className="text-right">
                          <div className="font-bold text-gray-800">${item.value.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">{percentage}%</div>
                      </div>
                  </div>
              )
          })}
      </div>
    </div>
  );
};

export default Stats;
