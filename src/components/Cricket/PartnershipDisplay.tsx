import { Flame, Info, Users } from 'lucide-react';
import React from 'react';

interface PlayerContribution {
    name: string;
    runs: number;
    balls: number;
}

interface PartnershipDisplayProps {
    runs: number;
    balls: number;
    player1: PlayerContribution;
    player2: PlayerContribution;
}

const PartnershipDisplay: React.FC<PartnershipDisplayProps> = ({ runs, balls, player1, player2 }) => {
    const runRate = balls > 0 ? ((runs / balls) * 6).toFixed(2) : '0.00';

    return (
        <div className="relative overflow-hidden bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl rounded-[2rem] p-6 border border-white/20 shadow-2xl transition-all hover:shadow-indigo-500/10">
            {/* Background Gradient Orbs */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-600/20 rounded-xl">
                            <Users className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block leading-tight">Current</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-white uppercase italic">Partnership</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                            <Flame className="w-3 h-3 text-orange-500 animate-bounce" />
                            <span className="text-[10px] font-black uppercase text-orange-500 tracking-widest">{runRate} RPO</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-8">
                    <div className="flex-1 text-center group cursor-default">
                        <p className="text-xs font-bold text-slate-500 mb-1 group-hover:text-indigo-500 transition-colors uppercase">{player1.name}</p>
                        <div className="flex items-baseline justify-center space-x-1">
                            <span className="text-2xl font-black italic tracking-tighter text-slate-800 dark:text-white">{player1.runs}</span>
                            <span className="text-[10px] font-bold text-slate-400">({player1.balls})</span>
                        </div>
                    </div>

                    <div className="px-6 flex flex-col items-center">
                        <div className="text-4xl font-black italic tracking-tighter text-indigo-600 dark:text-indigo-400 drop-shadow-[0_0_15px_rgba(79,70,229,0.3)]">
                            {runs}
                        </div>
                        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest -mt-1">Runs</div>
                    </div>

                    <div className="flex-1 text-center group cursor-default">
                        <p className="text-xs font-bold text-slate-500 mb-1 group-hover:text-indigo-500 transition-colors uppercase">{player2.name}</p>
                        <div className="flex items-baseline justify-center space-x-1">
                            <span className="text-2xl font-black italic tracking-tighter text-slate-800 dark:text-white">{player2.runs}</span>
                            <span className="text-[10px] font-bold text-slate-400">({player2.balls})</span>
                        </div>
                    </div>
                </div>

                {/* Progress Bar Container */}
                <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                        className="absolute h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                        style={{ width: `${Math.min(100, (runs / 100) * 100)}%` }}
                    />
                </div>
                
                <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center space-x-1">
                        <Info className="w-3 h-3 text-slate-400" />
                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{balls} Balls Faced</span>
                    </div>
                    <div className="flex items-center space-x-1">
                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">Milestone: {Math.floor(runs / 50 + 1) * 50} runs</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PartnershipDisplay;
