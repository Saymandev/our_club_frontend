import cricketApi from '@/services/cricketApi';
import { useAuthStore } from '@/store/authStore';
import { AlertCircle, Download, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const TeamOwnerDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyTeam = async () => {
      try {
        const res = await cricketApi.getTeams();
        // user.role 'admin' can bypass, but this dashboard is really owner-focused
        const myTeamSummary = res.data.find((t: any) => 
            t.owner?._id === user?.id || t.owner === user?.id
        );

        if (myTeamSummary) {
            // Fetch detailed team Info including transactions which are embedded
            const detailRes = await cricketApi.getTeamById(myTeamSummary._id);
            setTeam(detailRes.data);
        }
      } catch (err) {
        console.error('Error fetching team for owner:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchMyTeam();
  }, [user]);

  if (loading) return <div className="p-10 text-center font-bold text-slate-500 uppercase tracking-widest">Loading Dashboard...</div>;
  if (!team) return <div className="p-10 text-center font-bold text-red-500 uppercase tracking-widest flex flex-col items-center justify-center space-y-4"><AlertCircle className="w-12 h-12" /><span>You don't own a team yet.</span></div>;

  const totalSpent = team.purseTotal - team.purseRemaining;
  const spentPercent = (totalSpent / team.purseTotal) * 100;

  // Sorting transactions newest first
  const sortedTransactions = [...(team.transactions || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-3xl font-black italic tracking-tighter uppercase text-slate-800 dark:text-white">
             {team.name} <span className="text-indigo-600">Dashboard</span>
           </h1>
           <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Financial Analysis & Squad Balance</p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
            <Download className="w-4 h-4" /> <span>Export Ledger</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-3xl shadow-xl text-white">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Wallet className="w-6 h-6" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">Total Budget</span>
            </div>
            <h2 className="text-4xl font-black italic mb-1">৳{team.purseTotal}L</h2>
            <div className="w-full bg-black/20 h-2 rounded-full mt-4 overflow-hidden">
                <div className="bg-green-400 h-full rounded-full" style={{ width: `${100 - spentPercent}%` }} />
            </div>
            <p className="text-[10px] font-bold mt-2 text-indigo-100 uppercase tracking-widest">৳{team.purseRemaining}L Remaining Balance</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-2xl text-slate-400">
                    <Users className="w-6 h-6" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-700/50 text-slate-500 px-3 py-1 rounded-full">Squad Size</span>
            </div>
            <h2 className="text-4xl font-black italic text-slate-800 dark:text-white mb-2">{team.squad?.length || 0}</h2>
            <p className="text-[10px] font-bold mt-2 text-slate-400 uppercase tracking-widest">Active Players</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl text-orange-600 dark:text-orange-400">
                    <AlertCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full">RTM Cards</span>
            </div>
            <h2 className="text-4xl font-black italic text-slate-800 dark:text-white mb-2">
                {team.rtmCardsRemaining} <span className="text-xl text-slate-300">/ {team.rtmCardsTotal}</span>
            </h2>
            <p className="text-[10px] font-bold mt-2 text-slate-400 uppercase tracking-widest">Available to Exercise</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ledger */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
             <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest">Financial Ledger</h3>
             </div>
             <div className="max-h-[400px] overflow-y-auto">
                 {sortedTransactions.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm font-bold uppercase">No transactions recorded yet.</div>
                 ) : (
                     <div className="divide-y divide-slate-100 dark:divide-slate-700">
                         {sortedTransactions.map((tx: any, idx) => (
                             <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-2 rounded-xl ${tx.type === 'Credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                        {tx.type === 'Credit' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{tx.description}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">{new Date(tx.date).toLocaleDateString()} {new Date(tx.date).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                                <span className={`text-sm font-black italic ${tx.type === 'Credit' ? 'text-green-500' : 'text-red-500'}`}>
                                    {tx.type === 'Credit' ? '+' : '-'}৳{tx.amount}L
                                </span>
                             </div>
                         ))}
                     </div>
                 )}
             </div>
          </div>

          {/* Mini Squad List */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
             <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-sm font-black uppercase text-slate-400 tracking-widest">Acquired Squad</h3>
             </div>
             <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                 {team.squad?.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm font-bold uppercase">Squad is empty. Start bidding!</div>
                 ) : (
                    team.squad?.map((player: any) => (
                        <div key={player._id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-100 dark:border-slate-600">
                            <div className="flex items-center space-x-3">
                                {player.photoUrl ? (
                                    <img src={player.photoUrl} alt={player.name} className="w-10 h-10 rounded-xl object-cover" />
                                ) : (
                                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-xl flex items-center justify-center font-black">
                                        {player.name[0]}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{player.name}</p>
                                    <p className="text-[10px] uppercase font-bold text-slate-400">{player.role}</p>
                                </div>
                            </div>
                            <span className="text-xs font-black italic text-indigo-600 dark:text-indigo-400">
                                ৳{player.soldPrice}L
                            </span>
                        </div>
                    ))
                 )}
             </div>
          </div>
      </div>
    </div>
  );
};

export default TeamOwnerDashboard;
