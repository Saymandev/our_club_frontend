import cricketApi from '@/services/cricketApi';
import { ArrowLeft, CheckCircle, Save, Shield, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom'; // or react-router-dom, depends on app

const StrategyBoard: React.FC = () => {
    // Assuming we use react-router-dom useParams, but might need to adjust based on App.tsx
    const { matchId } = useParams();
    const navigate = useNavigate();

    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // State for selected XI
    const [t1XI, setT1XI] = useState<any[]>([]);
    const [t2XI, setT2XI] = useState<any[]>([]);

    useEffect(() => {
        if (matchId) fetchMatch();
    }, [matchId]);

    const fetchMatch = async () => {
        try {
            const { data } = await cricketApi.getMatchById(matchId as string);
            setMatch(data);
            
            // Initialize XI from DB if exists, else empty
            setT1XI(data.playingXI?.team1 || []);
            setT2XI(data.playingXI?.team2 || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load match data");
        } finally {
            setLoading(false);
        }
    };

    const togglePlayer = (player: any, teamNum: 1 | 2) => {
        if (player.injuryStatus === 'Ruled Out') {
            return toast.error(`${player.name} is ruled out due to injury and cannot be selected.`);
        }

        if (teamNum === 1) {
            const exists = t1XI.find(p => p._id === player._id);
            if (exists) {
                setT1XI(t1XI.filter(p => p._id !== player._id));
            } else {
                if (t1XI.length >= 11) return toast.error("Playing XI is full (11 players)");
                setT1XI([...t1XI, player]);
            }
        } else {
            const exists = t2XI.find(p => p._id === player._id);
            if (exists) {
                setT2XI(t2XI.filter(p => p._id !== player._id));
            } else {
                if (t2XI.length >= 11) return toast.error("Playing XI is full (11 players)");
                setT2XI([...t2XI, player]);
            }
        }
    };

    const handleSave = async () => {
        if (t1XI.length !== 11 || t2XI.length !== 11) {
            return toast.error("Both teams must have exactly 11 players selected.");
        }
        
        try {
            await cricketApi.updatePlayingXI(matchId as string, {
                team1XI: t1XI.map(p => p._id),
                team2XI: t2XI.map(p => p._id)
            });
            toast.success("Playing XI saved successfully!");
            navigate('/admin'); // or wherever backend admin is
        } catch (error) {
            console.error(error);
            toast.error("Failed to save Playing XI");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Strategy Board...</div>;
    if (!match) return <div className="p-10 text-center">Match not found.</div>;

    const TeamBoard = ({ team, teamNum, selectedXI }: { team: any, teamNum: 1 | 2, selectedXI: any[] }) => {
        const squad = team?.squad || [];
        
        return (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
                <div className="flex items-center mb-6">
                    {team.logo ? (
                        <img src={team.logo} alt={team.shortName} className="w-12 h-12 rounded-full mr-4" />
                    ) : (
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold mr-4">
                            {team.shortName}
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-black italic uppercase">{team.name}</h2>
                        <p className="text-sm font-bold text-gray-500">{selectedXI.length}/11 Selected</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    {/* Full Squad List */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                            <Users className="w-4 h-4 mr-1" /> Squad ({squad.length})
                        </h3>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                            {squad.map((player: any) => {
                                const isSelected = selectedXI.find(p => p._id === player._id);
                                return (
                                    <div 
                                        key={player._id}
                                        onClick={() => togglePlayer(player, teamNum)}
                                        className={`p-3 rounded-xl cursor-pointer transition-all border-2 text-sm flex justify-between items-center ${
                                            isSelected 
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 opacity-50' 
                                            : player.injuryStatus === 'Ruled Out'
                                            ? 'border-red-100 bg-red-50/20 opacity-40 grayscale cursor-not-allowed'
                                            : 'border-transparent bg-gray-50 dark:bg-gray-900 hover:border-gray-200'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <p className="font-bold">{player.name}</p>
                                                {player.injuryStatus !== 'Fit' && (
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${player.injuryStatus === 'Ruled Out' ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'}`}>
                                                        {player.injuryStatus === 'Ruled Out' ? 'Out' : 'Injured'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-500 uppercase">{player.role}</p>
                                        </div>
                                        {isSelected && <CheckCircle className="w-4 h-4 text-indigo-600" />}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Playing XI List */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center">
                            <Shield className="w-4 h-4 mr-1" /> Playing XI
                        </h3>
                        <div className="space-y-2">
                            {selectedXI.length === 0 ? (
                                <div className="p-8 text-center text-sm font-bold text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                                    Click players from the squad to add them to the Playing XI.
                                </div>
                            ) : (
                                selectedXI.map((player: any, index: number) => (
                                    <div 
                                        key={player._id}
                                        onClick={() => togglePlayer(player, teamNum)}
                                        className="p-3 bg-indigo-600 text-white rounded-xl cursor-pointer shadow-lg shadow-indigo-600/20 text-sm flex items-center hover:bg-red-500 transition-colors group"
                                    >
                                        <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-[10px] font-bold mr-3 group-hover:bg-red-600">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="font-bold">{player.name}</p>
                                            <p className="text-[10px] text-indigo-200 uppercase">{player.role}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                            
                            {[...Array(Math.max(0, 11 - selectedXI.length))].map((_, i) => (
                                <div key={`empty-${i}`} className="p-4 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <button 
                        onClick={() => navigate('/admin')}
                        className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 rounded-xl font-bold text-sm shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </button>
                    <h1 className="text-3xl font-black italic uppercase">Strategy Board</h1>
                    <button 
                        onClick={handleSave}
                        className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20"
                    >
                        <Save className="w-5 h-5 mr-2" /> Save Playing XI
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <TeamBoard team={match.team1} teamNum={1} selectedXI={t1XI} />
                    <TeamBoard team={match.team2} teamNum={2} selectedXI={t2XI} />
                </div>
            </div>
        </div>
    );
};

export default StrategyBoard;
