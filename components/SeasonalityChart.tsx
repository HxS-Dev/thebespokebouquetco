import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { SEASONALITY_DATA } from '../constants';

export const SeasonalityChart: React.FC = () => {
  return (
    <div className="w-full h-64 mt-8 bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-sage-soft/30">
      <h3 className="text-center font-serif text-stone-dark mb-4 text-lg">Peak Bloom Availability</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={SEASONALITY_DATA}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorAvailability" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EACACD" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#EACACD" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="month" stroke="#4A4A4A" tick={{fontSize: 12}} />
          <YAxis hide />
          <Tooltip 
            contentStyle={{ backgroundColor: '#FDFBF7', border: '1px solid #BCC8BD' }}
            itemStyle={{ color: '#4A4A4A' }}
          />
          <Area 
            type="monotone" 
            dataKey="availability" 
            stroke="#EACACD" 
            fillOpacity={1} 
            fill="url(#colorAvailability)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
