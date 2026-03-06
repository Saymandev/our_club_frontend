import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface MatchChartsProps {
  balls: any[];
  team1Name: string;
  team2Name: string;
}

const MatchCharts: React.FC<MatchChartsProps> = ({ balls, team1Name, team2Name }) => {
  const chartData = useMemo(() => {
    if (!balls || balls.length === 0) return [];

    const dataByOver: { [overNum: number]: any } = {};
    
    // Initialize cumulative variables
    let cumT1 = 0;
    let cumT2 = 0;

    // Process balls in chronological order
    // Ensure balls are sorted just in case
    const sortedBalls = [...balls].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    sortedBalls.forEach(b => {
      // over in DB is 0-indexed, let's display as 1-indexed (Over 1, Over 2)
      const overDisplay = b.over + 1; 
      
      if (!dataByOver[overDisplay]) {
        dataByOver[overDisplay] = {
            name: `Over ${overDisplay}`,
            runsT1: 0,
            runsT2: 0,
            totalT1: cumT1,
            totalT2: cumT2,
            wicketsT1: 0,
            wicketsT2: 0,
        };
      }

      const runsOnBall = b.runs + (b.extras?.runs || 0);

      if (b.inningsNo === 1) {
          dataByOver[overDisplay].runsT1 += runsOnBall;
          cumT1 += runsOnBall;
          dataByOver[overDisplay].totalT1 = cumT1;
          if (b.wicket) dataByOver[overDisplay].wicketsT1 += 1;
      } else if (b.inningsNo === 2) {
          dataByOver[overDisplay].runsT2 += runsOnBall;
          cumT2 += runsOnBall;
          dataByOver[overDisplay].totalT2 = cumT2;
          if (b.wicket) dataByOver[overDisplay].wicketsT2 += 1;
      }
    });

    const maxOver = Math.max(...Object.keys(dataByOver).map(Number));
    const finalData = [];
    
    // Ensure continuity for overs up to maxOver
    for (let i = 1; i <= maxOver; i++) {
        if (dataByOver[i]) {
            finalData.push(dataByOver[i]);
        } else {
            // Empty over (e.g. match paused or skipped somehow) -- rare but possible
            // Carry forward totals
            const prev: any = finalData[finalData.length - 1] || { totalT1: 0, totalT2: 0 };
            finalData.push({
                name: `Over ${i}`,
                runsT1: 0, runsT2: 0,
                totalT1: prev.totalT1, totalT2: prev.totalT2,
                wicketsT1: 0, wicketsT2: 0
            });
        }
    }

    return finalData;
  }, [balls]);

  if (chartData.length === 0) {
      return null;
  }

  // Custom tooltips (optional) could be added, but standard Tooltip works fine for MVP
  // Highlight wicket overs by putting a dot maybe? Recharts 'dot' prop handles it on Lines

  return (
    <div className="space-y-8 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 w-full overflow-hidden">
        
       <div>
            <h3 className="text-sm font-black uppercase text-slate-400 mb-6 tracking-widest">Match Worm (Cumulative Runs)</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" tick={{fontSize: 10}} stroke="#94a3b8" />
                        <YAxis tick={{fontSize: 10}} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                        
                        <Line 
                            type="monotone" 
                            dataKey="totalT1" 
                            name={team1Name} 
                            stroke="#4f46e5" 
                            strokeWidth={3}
                            dot={{ strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 8 }} 
                        />
                        <Line 
                            type="monotone" 
                            dataKey="totalT2" 
                            name={team2Name} 
                            stroke="#f43f5e" 
                            strokeWidth={3}
                            dot={{ strokeWidth: 2, r: 4 }}
                            activeDot={{ r: 8 }} 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
       </div>

       <div className="h-px w-full bg-slate-100 dark:bg-slate-700" />

       <div>
            <h3 className="text-sm font-black uppercase text-slate-400 mb-6 tracking-widest">Manhattan (Runs Per Over)</h3>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="name" tick={{fontSize: 10}} stroke="#94a3b8" />
                        <YAxis tick={{fontSize: 10}} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                        
                        <Bar 
                            dataKey="runsT1" 
                            name={team1Name} 
                            fill="#4f46e5" 
                            radius={[4, 4, 0, 0]} 
                        />
                        <Bar 
                            dataKey="runsT2" 
                            name={team2Name} 
                            fill="#f43f5e" 
                            radius={[4, 4, 0, 0]} 
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
       </div>
       
    </div>
  );
};

export default MatchCharts;
