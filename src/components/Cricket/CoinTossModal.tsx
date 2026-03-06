import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

interface CoinTossModalProps {
    isOpen: boolean;
    onClose: () => void;
    team1: any;
    team2: any;
    onComplete: (winnerId: string, decision: 'Bat' | 'Bowl') => void;
}

const CoinTossModal: React.FC<CoinTossModalProps> = ({ isOpen, onClose, team1, team2, onComplete }) => {
    const [tossing, setTossing] = useState(false);
    const [result, setResult] = useState<'Heads' | 'Tails' | null>(null);
    const [winner, setWinner] = useState<any>(null);
    const [decision, setDecision] = useState<'Bat' | 'Bowl' | null>(null);

    const handleToss = () => {
        setTossing(true);
        setTimeout(() => {
            const isHeads = Math.random() > 0.5;
            setResult(isHeads ? 'Heads' : 'Tails');
            // Randomly assign a winner for now (simulate captain calling it)
            setWinner(isHeads ? team1 : team2);
            setTossing(false);
        }, 2000);
    };

    const handleConfirm = () => {
        if (winner && decision) {
            onComplete(winner._id, decision);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full relative overflow-hidden"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-indigo-600/10 -skew-y-6 transform origin-top-left -z-10" />

                    <h2 className="text-2xl font-black mb-6 text-center italic uppercase">Digital Coin Toss</h2>

                    {!result && !tossing && (
                        <div className="space-y-6 text-center">
                            <p className="text-gray-500 text-sm">Captains are ready. Tap below to flip the coin.</p>
                            <div className="flex justify-around items-center my-8">
                                <div className="text-center font-bold">
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xl shadow-inner border-2 border-white">
                                        {team1.shortName || 'T1'}
                                    </div>
                                    <p className="text-xs">{team1.name}</p>
                                </div>
                                <span className="font-black italic text-gray-300">VS</span>
                                <div className="text-center font-bold">
                                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2 text-xl shadow-inner border-2 border-white">
                                        {team2.shortName || 'T2'}
                                    </div>
                                    <p className="text-xs">{team2.name}</p>
                                </div>
                            </div>
                            <button 
                                onClick={handleToss}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-600/30"
                            >
                                Flip Coin
                            </button>
                        </div>
                    )}

                    {tossing && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <motion.div 
                                animate={{ rotateY: 360 * 5 }}
                                transition={{ duration: 2, ease: "linear" }}
                                className="w-32 h-32 bg-yellow-400 rounded-full border-8 border-yellow-500 shadow-2xl flex items-center justify-center text-4xl font-black text-yellow-600 mb-6"
                            >
                                $
                            </motion.div>
                            <p className="font-bold text-gray-500 animate-pulse">Tossing in air...</p>
                        </div>
                    )}

                    {result && !tossing && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6 text-center"
                        >
                            <div className="w-24 h-24 bg-yellow-400 rounded-full border-4 border-yellow-500 shadow-xl flex items-center justify-center text-3xl font-black text-yellow-600 mx-auto mb-4">
                                {result === 'Heads' ? 'H' : 'T'}
                            </div>
                            <h3 className="text-xl font-bold">{winner.name} won the toss!</h3>
                            
                            <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-2xl">
                                <p className="text-sm font-bold text-gray-500 uppercase mb-4">What is their decision?</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        onClick={() => setDecision('Bat')}
                                        className={`py-3 rounded-xl font-bold border-2 transition-all ${
                                            decision === 'Bat' 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                                            : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                                        }`}
                                    >
                                        🏏 Bat First
                                    </button>
                                    <button 
                                        onClick={() => setDecision('Bowl')}
                                        className={`py-3 rounded-xl font-bold border-2 transition-all ${
                                            decision === 'Bowl' 
                                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' 
                                            : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                                        }`}
                                    >
                                        🔴 Bowl First
                                    </button>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <button 
                                    onClick={() => {
                                        setResult(null);
                                        setWinner(null);
                                        setDecision(null);
                                    }} 
                                    className="w-1/3 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold text-sm"
                                >
                                    Re-toss
                                </button>
                                <button 
                                    onClick={handleConfirm}
                                    disabled={!decision}
                                    className={`w-2/3 py-3 rounded-xl font-bold text-sm transition-all ${
                                        decision ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    Confirm Decision
                                </button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CoinTossModal;
