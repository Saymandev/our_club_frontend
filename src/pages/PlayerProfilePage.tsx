import cricketApi from '@/services/cricketApi';
import { Activity, ChevronLeft, Shield, Target } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const PlayerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayer = async () => {
      if (!id) return;
      try {
        const res = await cricketApi.getPlayerById(id);
        setPlayer(res.data);
      } catch (err) {
        console.error('Error fetching player', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-slate-500 font-bold uppercase tracking-widest">Loading Profile...</div>;
  if (!player) return <div className="p-10 text-center text-red-500 font-bold uppercase tracking-widest">Player not found</div>;

  // Derive form strings (e.g. "W", "45", "0") for simple display
  const recentFormStrings = (player.recentForm || []).map((f: any) => {
      if (player.role === 'Bowler') {
          return f.wickets > 0 ? `${f.wickets}W` : '0W';
      }
      return f.runs.toString();
  });

  // Data for progression chart (e.g. runs over last 5 matches)
  // Reversing so chronological left-to-right
  const chartData = [...(player.recentForm || [])].reverse().map((f: any, i: number) => ({
      name: `M${i+1}`,
      runs: f.runs,
      wickets: f.wickets
  }));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <Link to="/auction" className="flex items-center text-slate-400 hover:text-indigo-600 transition-colors font-bold text-xs uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Players
        </Link>

        {/* Header Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Target className="w-64 h-64" />
            </div>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                {player.photoUrl ? (
                    <img src={player.photoUrl} alt={player.name} className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-white dark:border-slate-700" />
                ) : (
                    <div className="w-32 h-32 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center text-4xl font-black shadow-xl border-4 border-white dark:border-slate-700">
                        {player.name.charAt(0)}
                    </div>
                )}
                
                <div className="text-center md:text-left flex-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase text-slate-800 dark:text-white">
                            {player.name}
                        </h1>
                        <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest w-max mx-auto md:mx-0">
                            {player.role}
                        </span>
                    </div>
                    
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start">
                        <Shield className="w-4 h-4 mr-2" /> 
                        {player.team?.name || 'Unaffiliated'}
                    </p>

                    {/* Recent Form Pills */}
                    <div className="mt-6 flex flex-col md:flex-row items-center gap-4">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Recent Form:</span>
                        <div className="flex space-x-2">
                            {recentFormStrings.length > 0 ? recentFormStrings.map((f: string, i: number) => (
                                <div key={i} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-black shadow-inner border border-slate-200 dark:border-slate-600">
                                    {f}
                                </div>
                            )) : (
                                <span className="text-xs font-bold text-slate-400 italic">No recent matches</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Matches</p>
                <p className="text-3xl font-black italic">{player.stats?.matches || 0}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Runs</p>
                <p className="text-3xl font-black italic text-indigo-600">{player.stats?.runs || 0}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Total Wickets</p>
                <p className="text-3xl font-black italic text-red-500">{player.stats?.wickets || 0}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Highest Score</p>
                <p className="text-3xl font-black italic text-emerald-500">{player.stats?.highestScore || 0}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Strike Rate</p>
                <p className="text-3xl font-black italic">{player.stats?.strikeRate?.toFixed(1) || '0.0'}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Economy</p>
                <p className="text-3xl font-black italic">{player.stats?.economyRate?.toFixed(1) || '0.0'}</p>
            </div>
            <div className="col-span-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 shadow-xl text-white">
                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-1">Fantasy Points</p>
                <p className="text-3xl font-black italic">{player.stats?.fantasyPoints || 0} PTS</p>
            </div>
        </div>

        {/* Charts Section */}
        {chartData.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700">
                <h3 className="text-sm font-black uppercase text-slate-400 mb-8 tracking-widest flex items-center">
                    <Activity className="w-4 h-4 mr-2" /> Performance Progression
                </h3>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                            <XAxis dataKey="name" tick={{fontSize: 10}} stroke="#94a3b8" />
                            <YAxis tick={{fontSize: 10}} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                            
                            {player.role !== 'Bowler' && (
                                <Line 
                                    type="monotone" 
                                    dataKey="runs" 
                                    name="Runs Scored" 
                                    stroke="#4f46e5" 
                                    strokeWidth={3}
                                    dot={{ strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 8 }} 
                                />
                            )}
                            
                            {(player.role === 'Bowler' || player.role === 'All-rounder') && (
                                <Line 
                                    type="monotone" 
                                    dataKey="wickets" 
                                    name="Wickets" 
                                    stroke="#ef4444" 
                                    strokeWidth={3}
                                    dot={{ strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 8 }} 
                                />
                            )}
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default PlayerProfilePage;
