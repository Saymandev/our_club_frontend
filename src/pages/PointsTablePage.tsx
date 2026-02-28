import cricketApi from '@/services/cricketApi';
import { Info, TrendingUp, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const PointsTablePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [table, setTable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTable = async () => {
      try {
        const res = await cricketApi.getPointsTable(id!);
        setTable(res.data);
      } catch (err) {
        console.error('Error fetching points table:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTable();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Loading Standings...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10 text-center">
            <div className="inline-block p-4 bg-indigo-600 rounded-3xl shadow-2xl shadow-indigo-500/20 mb-6">
                <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900 dark:text-white">Tournament Standings</h1>
            <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-xs mt-2">Season 2026 • Live Updates</p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50">
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400">Pos</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400">Team</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400 text-center">P</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400 text-center">W</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400 text-center">L</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400 text-center">NRR</th>
                  <th className="p-6 text-xs font-black uppercase tracking-widest text-gray-400 text-center">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {table.map((row, i) => (
                  <tr key={row.teamId} className="group hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-colors">
                    <td className="p-6">
                        <span className={`w-8 h-8 flex items-center justify-center rounded-xl font-black italic ${
                            i < 4 ? 'bg-indigo-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
                        }`}>
                            {i + 1}
                        </span>
                    </td>
                    <td className="p-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center font-black text-indigo-600">
                                {row.teamName[0]}
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white uppercase tracking-tight">{row.teamName}</span>
                        </div>
                    </td>
                    <td className="p-6 text-center font-bold text-gray-600 dark:text-gray-400">{row.played}</td>
                    <td className="p-6 text-center font-bold text-green-600">{row.won}</td>
                    <td className="p-6 text-center font-bold text-red-500">{row.lost}</td>
                    <td className="p-6 text-center">
                        <div className="flex items-center justify-center space-x-1">
                            {row.nrr >= 0 ? <TrendingUp className="w-3 h-3 text-green-500" /> : <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />}
                            <span className={`font-black italic ${row.nrr >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {row.nrr > 0 ? '+' : ''}{row.nrr.toFixed(3)}
                            </span>
                        </div>
                    </td>
                    <td className="p-6 text-center">
                        <span className="text-xl font-black italic text-indigo-600 dark:text-indigo-400">{row.points}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8 flex items-start space-x-3 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-500/20">
            <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1" />
            <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium leading-relaxed">
                <span className="font-black uppercase mr-1">Qualification:</span>
                The top 4 teams at the end of the league stage will qualify for the Semi-Finals. Net Run Rate (NRR) is used as a tie-breaker if teams are level on points.
            </p>
        </div>
      </div>
    </div>
  );
};

export default PointsTablePage;
