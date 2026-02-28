import { motion } from 'framer-motion';
import { Award, Target, TrendingUp, Zap } from 'lucide-react';
import React from 'react';

interface PlayerProfileProps {
  player: any;
}

const PlayerProfileCard: React.FC<PlayerProfileProps> = ({ player }) => {
  const stats = player.stats || {};
  
  const statItems = [
    { label: 'Runs', value: stats.runs || 0, icon: Target, color: 'text-indigo-400' },
    { label: 'Wickets', value: stats.wickets || 0, icon: Zap, color: 'text-yellow-400' },
    { label: 'Matches', value: stats.matches || 0, icon: TrendingUp, color: 'text-green-400' },
    { label: 'Fantasy Pts', value: stats.fantasyPoints || 0, icon: Award, color: 'text-purple-400' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-indigo-500/30 transition-all"
    >
      <div className="absolute -right-12 -top-12 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl group-hover:bg-indigo-600/20 transition-colors" />
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-700 overflow-hidden relative">
            {player.photoUrl ? (
                <img src={player.photoUrl} alt={player.name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xl uppercase">
                    {player.name[0]}
                </div>
            )}
        </div>
        <div>
           <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">{player.name}</h3>
           <span className="text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded-md border border-indigo-500/20">
               {player.role}
           </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {statItems.map((item, i) => (
            <div key={i} className="p-3 bg-slate-900/50 rounded-2xl border border-slate-700/30">
                <div className="flex items-center space-x-2 mb-1">
                    <item.icon className={`w-3 h-3 ${item.color}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                </div>
                <p className="text-lg font-black italic text-white">{item.value}</p>
            </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700/50">
         <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Performance Index</span>
            <span className="text-[10px] font-black text-indigo-400">84%</span>
         </div>
         <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
               initial={{ width: 0 }}
               animate={{ width: '84%' }}
               transition={{ duration: 1, delay: 0.5 }}
               className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
            />
         </div>
      </div>
    </motion.div>
  );
};

export default PlayerProfileCard;
