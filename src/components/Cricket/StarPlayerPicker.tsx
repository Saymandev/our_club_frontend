import { AnimatePresence, motion } from 'framer-motion';
import { Star, Trophy, UserCheck } from 'lucide-react';
import React, { useState } from 'react';

interface Player {
  _id: string;
  name: string;
  role: string;
}

interface StarPlayerPickerProps {
  matchId: string;
  players: Player[];
  onPick: (playerId: string) => Promise<void>;
  currentPickId?: string;
  matchStatus: string;
}

const StarPlayerPicker: React.FC<StarPlayerPickerProps> = ({ players, onPick, currentPickId, matchStatus }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePick = async (playerId: string) => {
    if (matchStatus !== 'Live' && matchStatus !== 'Scheduled') return;
    setIsSubmitting(true);
    try {
      await onPick(playerId);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to pick star player:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPlayer = players.find(p => (typeof p === 'object' ? p._id === currentPickId : p === currentPickId));

  return (
    <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[2rem] p-6 shadow-2xl border border-indigo-500/20 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
               <Star className="w-5 h-5 fill-indigo-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 block leading-tight">Fantasy MVP</span>
              <span className="text-sm font-bold text-white uppercase italic">Star Player Pick</span>
            </div>
          </div>
          <Trophy className="w-5 h-5 text-indigo-800" />
        </div>

        {selectedPlayer && typeof selectedPlayer === 'object' && selectedPlayer.name ? (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl italic">
                {selectedPlayer.name.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-black text-indigo-400 uppercase tracking-tighter">{selectedPlayer.role}</p>
                <p className="text-sm font-bold text-white uppercase">{selectedPlayer.name}</p>
              </div>
            </div>
            {matchStatus !== 'Completed' && (
               <button 
                 onClick={() => setIsOpen(true)}
                 className="text-[10px] font-black text-indigo-400 uppercase hover:text-white transition-colors underline underline-offset-4"
               >
                 Change
               </button>
            )}
          </div>
        ) : (
          <button 
            onClick={() => setIsOpen(true)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center group"
          >
             Pick Your Star Player
             <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
               <Star className="w-4 h-4 ml-2 fill-white" />
             </motion.div>
          </button>
        )}

        <p className="text-[9px] text-indigo-300/50 mt-4 text-center uppercase tracking-widest">
           Earn 1 coin per run & 25 coins per wicket!
        </p>

        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-slate-900 border border-indigo-500/30 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-3xl"
                    >
                        <div className="p-8 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Choose Your Star</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white font-bold text-sm">CLOSE</button>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto p-4 grid grid-cols-2 gap-3">
                            {players.map(player => (
                                <button
                                    key={player._id}
                                    disabled={isSubmitting}
                                    onClick={() => handlePick(player._id)}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center text-center group ${
                                        currentPickId === player._id 
                                        ? 'border-indigo-500 bg-indigo-500/10' 
                                        : 'border-white/5 hover:border-indigo-500/50 bg-white/5 hover:bg-white/10 text-white'
                                    }`}
                                >
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                        <UserCheck className={`w-6 h-6 ${currentPickId === player._id ? 'text-indigo-400' : 'text-slate-500'}`} />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-tighter truncate w-full">{player.name}</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase">{player.role}</p>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StarPlayerPicker;
