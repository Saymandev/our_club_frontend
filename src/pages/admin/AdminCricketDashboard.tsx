import cricketApi from '@/services/cricketApi';
import { Calendar, Gavel, Plus, Settings, Trophy, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const AdminCricketDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'players' | 'teams' | 'tournaments' | 'auction'>('auction');
  const [players, setPlayers] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        try {
            const pRes = await cricketApi.getPlayers();
            setPlayers(pRes.data);
            const aRes = await cricketApi.getAuctions();
            setAuctions(aRes.data);
        } catch (err) {
            console.error(err);
        }
    };
    fetchData();
  }, []);

  const handleNextPlayer = async (auctionId: string, playerId: string) => {
    try {
        await cricketApi.adminControlAuction({
            auctionId,
            currentPlayerId: playerId,
            status: 'Live'
        });
        alert('Auction updated to next player!');
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold mb-8 dark:text-white flex items-center">
            <Settings className="w-6 h-6 mr-2" /> Admin Control
        </h2>
        <nav className="space-y-2">
          {[
            { id: 'auction', label: 'Auction Control', icon: Gavel },
            { id: 'players', label: 'Manage Players', icon: Users },
            { id: 'teams', label: 'Manage Teams', icon: Trophy },
            { id: 'tournaments', label: 'Tournaments', icon: Calendar },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center p-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'auction' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black italic uppercase">Live Auction Control</h1>
                <div className="flex space-x-3">
                    <button className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-red-600/20">End Auction</button>
                    <button className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-green-600/20">Start Auction</button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Auction Status */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6">Current Status</h3>
                    {auctions[0] ? (
                        <div className="space-y-4">
                            <div className="flex justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                                <span className="text-gray-500">Current Player</span>
                                <span className="font-bold text-indigo-600 underline cursor-pointer">{auctions[0].currentPlayer?.name || 'None'}</span>
                            </div>
                            <div className="flex justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                                <span className="text-gray-500">Highest Bid</span>
                                <span className="font-bold text-green-600">৳{auctions[0].highestBid?.amount || 0}L</span>
                            </div>
                            <div className="flex justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                                <span className="text-gray-500">Countdown</span>
                                <span className="font-mono font-black text-xl text-red-500">{auctions[0].timer}s</span>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400">No active auction sessions found.</p>
                    )}
                </div>

                {/* Player Selection Queue */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Queue / Unsold Players</h3>
                        <span className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full font-bold">{players.filter(p => p.status === 'Unsold').length} Remaining</span>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {players.filter(p => p.status === 'Unsold').map(player => (
                            <div key={player._id} className="flex items-center justify-between p-4 border border-gray-100 dark:border-gray-700 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
                                <div>
                                    <p className="font-bold">{player.name}</p>
                                    <p className="text-xs text-gray-500 uppercase">{player.role} • ৳{player.basePrice}L</p>
                                </div>
                                <button 
                                    onClick={() => handleNextPlayer(auctions[0]?._id, player._id)}
                                    className="p-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'tournaments' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-black italic uppercase">Tournament Management</h1>
                <button 
                    onClick={() => alert('Opening Tournament Creation Form...')} 
                    className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20"
                >
                    <Plus className="w-5 h-5 mr-2" /> New Tournament
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Tournament List */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6">Active Tournaments</h3>
                    <div className="space-y-4">
                        {/* List tournaments from API */}
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex justify-between items-center group">
                            <div>
                                <p className="font-bold">Season 2026 Championship</p>
                                <p className="text-xs text-gray-500 uppercase">Status: Live • 8 Teams</p>
                            </div>
                            <button className="p-2 opacity-0 group-hover:opacity-100 bg-white dark:bg-gray-800 rounded-lg shadow-sm transition-all">
                                <Settings className="w-4 h-4 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Match Scheduling Form */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-indigo-600" /> Quick Schedule Match
                    </h3>
                    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Team 1</label>
                                <select className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-medium">
                                    <option>Select Team</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Team 2</label>
                                <select className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-medium">
                                    <option>Select Team</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Match Date & Time</label>
                            <input type="datetime-local" className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-medium" />
                        </div>
                        <button className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                            Confirm Schedule
                        </button>
                    </form>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
             <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black italic uppercase">Player Database</h1>
                    <button className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
                        <Plus className="w-5 h-5 mr-2" /> Add Player
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {players.map(player => (
                        <div key={player._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h4 className="font-bold text-lg">{player.name}</h4>
                            <p className="text-sm text-gray-500 uppercase mb-4">{player.role} • {player.team?.name || 'Free Agent'}</p>
                            <div className="flex space-x-2">
                                <button className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-bold">Edit</button>
                                <button className="flex-1 py-2 bg-red-100/50 text-red-600 rounded-lg text-xs font-bold">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        )}

        {activeTab === 'teams' && (
             <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black italic uppercase">Teams & Owners</h1>
                    <button className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
                        <Plus className="w-5 h-5 mr-2" /> Add Team
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Team List & Owner Approval */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-6">Franchise Management</h3>
                        <div className="space-y-4">
                            {/* Example Team */}
                            <div className="p-5 border border-gray-100 dark:border-gray-700 rounded-2xl flex justify-between items-center">
                                <div>
                                    <p className="font-bold">Mumbai Titans</p>
                                    <p className="text-xs text-slate-500">Owner: Pending Approval</p>
                                </div>
                                <button 
                                    onClick={() => alert('Owner Approved!')}
                                    className="px-4 py-2 bg-green-100 text-green-600 rounded-lg text-xs font-bold hover:bg-green-600 hover:text-white transition-all"
                                >
                                    Approve Owner
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        )}

        {activeTab === 'tournaments' && (
             <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black italic uppercase">Tournament Status</h1>
                    <button 
                        onClick={() => alert('Publishing Tournament Results...')}
                        className="px-6 py-3 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl font-bold uppercase text-xs tracking-widest"
                    >
                        Publish Results
                    </button>
                </div>
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <p className="text-slate-500 italic">Select a tournament to finalize points and declare winners.</p>
                </div>
             </div>
        )}
      </main>
    </div>
  );
};

export default AdminCricketDashboard;
