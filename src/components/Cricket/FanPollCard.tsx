import { motion } from 'framer-motion';
import { BarChart2, CheckCircle2, Lock } from 'lucide-react';
import React, { useState } from 'react';

interface PollOption {
  text: string;
  votes: number;
}

interface FanPollCardProps {
  id: string;
  question: string;
  options: PollOption[];
  onVote: (optionIndex: number) => Promise<void>;
  alreadyVoted?: boolean;
  totalCoins?: number;
}

const FanPollCard: React.FC<FanPollCardProps> = ({ question, options, onVote, alreadyVoted = false, totalCoins = 0 }) => {
  const [isVoting, setIsVoting] = useState(false);

  const totalVotes = options.reduce((acc, opt) => acc + opt.votes, 0);

  const handleVote = async (index: number) => {
    if (alreadyVoted || isVoting || totalCoins < 10) return;
    setIsVoting(true);
    try {
      await onVote(index);
    } catch (err) {
      console.error('Voting failed:', err);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] p-6 shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden relative">
      {/* Decorative background icon */}
      <BarChart2 className="absolute -right-6 -bottom-6 w-32 h-32 text-slate-50 dark:text-slate-700/50 -rotate-12 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <BarChart2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Fan Poll</span>
          </div>
          {alreadyVoted ? (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Voted
            </span>
          ) : (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Costs 10 Coins
            </span>
          )}
        </div>

        <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 leading-tight">
          {question}
        </h3>

        <div className="space-y-3">
          {options.map((option, index) => {
            const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

            return (
              <button
                key={index}
                disabled={alreadyVoted || totalCoins < 10}
                onClick={() => handleVote(index)}
                className={`w-full relative group overflow-hidden rounded-2xl border-2 transition-all ${
                  alreadyVoted 
                  ? 'border-transparent bg-slate-50 dark:bg-slate-900/50 cursor-default' 
                  : 'border-slate-100 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10'
                }`}
              >
                {/* Result Progress Bar */}
                {alreadyVoted && (
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className="absolute inset-y-0 left-0 bg-indigo-600/10 dark:bg-indigo-500/10 z-0"
                    />
                )}

                <div className="relative z-10 p-4 flex justify-between items-center">
                  <span className={`text-sm font-bold ${alreadyVoted ? 'text-slate-700 dark:text-slate-300' : 'text-slate-600 dark:text-slate-400'}`}>
                    {option.text}
                  </span>
                  {alreadyVoted ? (
                    <span className="text-xs font-black italic text-indigo-600 dark:text-indigo-400">{percentage}%</span>
                  ) : totalCoins < 10 ? (
                    <Lock className="w-3 h-3 text-slate-300" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>

        {totalCoins < 10 && !alreadyVoted && (
          <p className="text-[10px] text-center text-red-500 font-bold mt-4 uppercase tracking-widest">
            Insufficient Coins to Vote
          </p>
        )}
      </div>
    </div>
  );
};

export default FanPollCard;
