import CoinTossModal from '@/components/Cricket/CoinTossModal';
import { authApi } from '@/services/api';
import cricketApi from '@/services/cricketApi';
import { AlertCircle, Calendar, ExternalLink, Gavel, Plus, Settings, Trash2, Trophy, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const AdminCricketDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'players' | 'teams' | 'tournaments' | 'auction' | 'engagement'>('auction');
  const [players, setPlayers] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  
  // Form States
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddTournament, setShowAddTournament] = useState(false);
  const [newPoll, setNewPoll] = useState({ match: '', question: '', options: ['', ''] });
  const [newPlayer, setNewPlayer] = useState({ 
    name: '', role: 'Batsman', basePrice: 0, 
    photoUrl: '', phone: '', email: '', 
    battingStyle: '', bowlingStyle: '',
    injuryStatus: 'Fit', injuryNote: ''
  });
  const [newTeam, setNewTeam] = useState({ name: '', shortName: '', purseTotal: 1000, logo: '', owner: '' });
  const [newTournament, setNewTournament] = useState({ 
    name: '', year: 2026, status: 'Upcoming', teams: [] as string[],
    settings: { oversPerMatch: 20, pointsForWin: 2, pointsForDraw: 1 }
  });
  const [newMatch, setNewMatch] = useState({ tournament: '', team1: '', team2: '', venue: '', date: '' });
  const [showCreateAuction, setShowCreateAuction] = useState(false);
  const [newAuction, setNewAuction] = useState({ tournament: '', status: 'Draft' });
  const [users, setUsers] = useState<any[]>([]); // For owner selection
  const [tossMatch, setTossMatch] = useState<any>(null); // Match selected for coin toss
  
  // Editing States
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [editingTournament, setEditingTournament] = useState<any>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'player' | 'team' | 'tournament' } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const [pRes, aRes, tRes, trRes, mRes, uRes, pollRes] = await Promise.all([
            cricketApi.getPlayers(),
            cricketApi.getAuctions(),
            cricketApi.getTeams(),
            cricketApi.getTournaments(),
            cricketApi.getMatches(),
            authApi.getUsers(),
            cricketApi.getAllPolls()
        ]);
        setPlayers(pRes.data);
        setAuctions(aRes.data);
        setTeams(tRes.data);
        setTournaments(trRes.data);
        setMatches(mRes.data);
        setUsers(uRes.data.data);
        setPolls(pollRes.data);
    } catch (err) {
        console.error(err);
    }
  };

  const handleAuctionControl = async (auctionId: string, status: string) => {
    try {
        await cricketApi.adminControlAuction({ auctionId, status });
        toast.success(`Auction ${status}!`);
        fetchData();
    } catch (err) {
        console.error(err);
        toast.error('Failed to update auction.');
    }
  };

  const handleNextPlayer = async (auctionId: string, playerId: string) => {
    try {
        await cricketApi.adminControlAuction({
            auctionId,
            currentPlayerId: playerId,
            status: 'Live'
        });
        toast.success('Auction updated to next player!');
        fetchData();
    } catch (err) {
        console.error(err);
        toast.error('Failed to set next player.');
    }
  };

  const handleApproveOwner = async (teamId: string, ownerId: string) => {
    try {
        await cricketApi.adminApproveTeamOwner({ teamId, ownerId });
        toast.success('Owner Approved!');
        fetchData();
    } catch (err) {
        console.error(err);
        toast.error('Failed to approve owner.');
    }
  };

  const handleCreatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await cricketApi.createPlayer(newPlayer);
        setShowAddPlayer(false);
        setNewPlayer({ 
            name: '', role: 'Batsman', basePrice: 0, 
            photoUrl: '', phone: '', email: '', 
            battingStyle: '', bowlingStyle: '',
            injuryStatus: 'Fit', injuryNote: ''
        });
        toast.success('Player Added!');
        fetchData();
    } catch (err) {
        console.error(err);
        toast.error('Failed to add player.');
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await cricketApi.createTeam(newTeam);
        setShowAddTeam(false);
        setNewTeam({ name: '', shortName: '', purseTotal: 1000, logo: '', owner: '' });
        toast.success('Team Added!');
        fetchData();
    } catch (err) {
        console.error(err);
        toast.error('Failed to add team.');
    }
  };

  const handleCreateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await cricketApi.createTournament(newTournament);
        setShowAddTournament(false);
        setNewTournament({ 
            name: '', year: 2026, status: 'Upcoming', teams: [],
            settings: { oversPerMatch: 20, pointsForWin: 2, pointsForDraw: 1 }
        });
        toast.success('Tournament Created!');
        fetchData();
    } catch (err) {
        console.error(err);
        toast.error('Failed to create tournament.');
    }
  };

  const handleDeletePlayer = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this player?')) return;
    try {
        await cricketApi.deletePlayer(id);
        fetchData();
        toast.success('Player Deleted!');
    } catch (err) {
        console.error(err);
        toast.error('Failed to delete player.');
    }
  };

  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await cricketApi.updatePlayer(editingPlayer._id, editingPlayer);
        setEditingPlayer(null);
        toast.success('Player Updated!');
        fetchData();
    } catch (err) {
        console.error(err);
        toast.error('Failed to update player.');
    }
  };

  const handleDeleteTeam = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
        await cricketApi.deleteTeam(id);
        fetchData();
        toast.success('Team Deleted!');
    } catch (err) {
        console.error(err);
        toast.error('Failed to delete team.');
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await cricketApi.updateTeam(editingTeam._id, editingTeam);
        setEditingTeam(null);
        toast.success('Team Updated!');
        fetchData();
    } catch (err) {
        console.error(err);
        toast.error('Failed to update team.');
    }
  };

  const handleDeleteTournament = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tournament?')) return;
    try {
        await cricketApi.deleteTournament(id);
        fetchData();
        toast.success('Tournament Deleted!');
    } catch (err) {
        console.error(err);
        toast.error('Failed to delete tournament.');
    }
  };

  const handleUpdateTournament = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await cricketApi.updateTournament(editingTournament._id, editingTournament);
        setEditingTournament(null);
        toast.success('Tournament Updated!');
        fetchData();
    } catch (err) {
        console.error(err);
        toast.error('Failed to update tournament.');
    }
  };

  const handleCreateMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await cricketApi.adminScheduleMatch({
            ...newMatch,
            status: 'Upcoming',
            innings: [
                { team: newMatch.team1, runs: 0, wickets: 0, overs: 0, balls: 0 },
                { team: newMatch.team2, runs: 0, wickets: 0, overs: 0, balls: 0 }
            ]
        });
        setNewMatch({ tournament: '', team1: '', team2: '', venue: '', date: '' });
        alert('Match Scheduled!');
        fetchData();
    } catch (err) {
        console.error(err);
        alert('Failed to schedule match.');
    }
  };

  const handleUpdateMatchStatus = async (matchId: string, status: string) => {
    try {
        await cricketApi.updateMatchStatus(matchId, { status });
        alert(`Match status updated to ${status}!`);
        fetchData();
    } catch (err) {
        console.error(err);
        alert('Failed to update match status.');
    }
  };

  const handlePublishTournament = async (tournamentId: string) => {
    try {
        await cricketApi.adminPublishTournament({ tournamentId });
        toast.success('Tournament results published!');
        fetchData();
    } catch (err) {
        console.error(err);
        toast.error('Failed to publish tournament.');
    }
  };

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        await cricketApi.createAuction(newAuction);
        setShowCreateAuction(false);
        setNewAuction({ tournament: '', status: 'Draft' });
        toast.success('Auction Session Created!');
        fetchData();
    } catch (err) {
        console.error(err);
        toast.error('Failed to create auction.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    const { id, type } = confirmDelete;
    try {
      if (type === 'player') await handleDeletePlayer(id);
      if (type === 'team') await handleDeleteTeam(id);
      if (type === 'tournament') await handleDeleteTournament(id);
      setConfirmDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTossComplete = async (winnerId: string, decision: 'Bat' | 'Bowl') => {
    if (!tossMatch) return;
    try {
        await cricketApi.updateToss(tossMatch._id, { winner: winnerId, decision });
        toast.success(`Toss completed! ${decision} first.`);
        setTossMatch(null);
        fetchData();
    } catch (err) {
        console.error(err);
        toast.error('Failed to update toss.');
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
            { id: 'engagement', label: 'Fan Engagement', icon: AlertCircle },
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
                    <button 
                        onClick={() => auctions[0] && handleAuctionControl(auctions[0]._id, 'Completed')}
                        className="px-6 py-3 bg-red-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-red-600/20"
                    >
                        End Auction
                    </button>
                    <button 
                        onClick={() => auctions[0] && handleAuctionControl(auctions[0]._id, 'Live')}
                        className="px-6 py-3 bg-green-600 text-white rounded-xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-green-600/20"
                    >
                        Start Auction
                    </button>
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
                        <div className="flex flex-col items-center justify-center py-10 space-y-4">
                            <p className="text-gray-400">No active auction sessions found.</p>
                            <button 
                                onClick={() => setShowCreateAuction(true)}
                                className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs"
                            >
                                Create New Session
                            </button>
                        </div>
                    )}
                </div>

                {showCreateAuction && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <form onSubmit={handleCreateAuction} className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full space-y-4 border border-gray-100 dark:border-gray-700">
                            <h3 className="text-xl font-bold">New Auction Session</h3>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Tournament</label>
                                <select 
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                    value={newAuction.tournament}
                                    onChange={e => setNewAuction({...newAuction, tournament: e.target.value})}
                                    required
                                >
                                    <option value="">Select Tournament</option>
                                    {tournaments.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="flex space-x-3 mt-6">
                                <button type="button" onClick={() => setShowCreateAuction(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold text-sm">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm">Create</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Player Selection Queue */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold">Queue / Unsold Players</h3>
                        <span className="text-xs bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full font-bold">
                            {players.filter((p: any) => p.status === 'Available' || p.status === 'Unsold').length} Remaining
                        </span>
                    </div>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                        {players.filter((p: any) => p.status === 'Available' || p.status === 'Unsold').map((player: any) => (
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
                     onClick={() => setShowAddTournament(!showAddTournament)} 
                     className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20"
                 >
                     <Plus className="w-5 h-5 mr-2" /> {showAddTournament ? 'Cancel' : 'New Tournament'}
                 </button>
             </div>

             {showAddTournament && (
                <form onSubmit={handleCreateTournament} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-indigo-100 shadow-xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            placeholder="Tournament Name"
                            value={newTournament.name}
                            onChange={e => setNewTournament({...newTournament, name: e.target.value})}
                            className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Status</label>
                            <select 
                                value={newTournament.status}
                                onChange={e => setNewTournament({...newTournament, status: e.target.value as any})}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            >
                                <option value="Upcoming">Upcoming</option>
                                <option value="Live">Live</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Overs per Match</label>
                            <input 
                                type="number"
                                value={newTournament.settings.oversPerMatch}
                                onChange={e => setNewTournament({
                                    ...newTournament, 
                                    settings: {...newTournament.settings, oversPerMatch: Number(e.target.value)}
                                })}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Select Teams</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {teams.map(team => (
                                <label key={team._id} className="flex items-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs">
                                    <input 
                                        type="checkbox"
                                        checked={newTournament.teams.includes(team._id)}
                                        onChange={e => {
                                            const teams = e.target.checked 
                                                ? [...newTournament.teams, team._id]
                                                : newTournament.teams.filter(id => id !== team._id);
                                            setNewTournament({...newTournament, teams});
                                        }}
                                        className="mr-2"
                                    />
                                    {team.shortName}
                                </label>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Create Tournament</button>
                </form>
             )}

             {editingTournament && (
                <form onSubmit={handleUpdateTournament} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-indigo-100 shadow-xl space-y-4">
                    <h3 className="font-bold">Edit Tournament</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            placeholder="Tournament Name"
                            value={editingTournament.name}
                            onChange={e => setEditingTournament({...editingTournament, name: e.target.value})}
                            className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Status</label>
                            <select 
                                value={editingTournament.status}
                                onChange={e => setEditingTournament({...editingTournament, status: e.target.value as any})}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            >
                                <option value="Upcoming">Upcoming</option>
                                <option value="Live">Live</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Overs per Match</label>
                            <input 
                                type="number"
                                value={editingTournament.settings?.oversPerMatch || 20}
                                onChange={e => setEditingTournament({
                                    ...editingTournament, 
                                    settings: {...(editingTournament.settings || {}), oversPerMatch: Number(e.target.value)}
                                })}
                                className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Select Teams</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {teams.map(team => (
                                <label key={team._id} className="flex items-center p-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-xs">
                                    <input 
                                        type="checkbox"
                                        checked={editingTournament.teams.includes(team._id)}
                                        onChange={e => {
                                            const teams = e.target.checked 
                                                ? [...editingTournament.teams, team._id]
                                                : editingTournament.teams.filter((id: string) => id !== team._id);
                                            setEditingTournament({...editingTournament, teams});
                                        }}
                                        className="mr-2"
                                    />
                                    {team.shortName}
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex space-x-3">
                        <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Update Tournament</button>
                        <button type="button" onClick={() => setEditingTournament(null)} className="w-full py-3 bg-gray-200 text-gray-800 rounded-xl font-bold">Cancel</button>
                    </div>
                </form>
             )}
             
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Tournament List */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-6">Active Tournaments</h3>
                        <div className="space-y-4">
                             {tournaments.map(tournament => (
                                <div key={tournament._id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl flex justify-between items-center group">
                                    <div>
                                        <p className="font-bold">{tournament.name} {tournament.year}</p>
                                        <p className="text-xs text-gray-400 uppercase">Status: {tournament.status} • {tournament.teams?.length || 0} Teams</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => handlePublishTournament(tournament._id)}
                                            className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-bold uppercase hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                        >
                                            Publish
                                        </button>
                                        <button 
                                            onClick={() => setEditingTournament(tournament)}
                                            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                                        >
                                            <Settings className="w-4 h-4 text-indigo-500" />
                                        </button>
                                         <button 
                                            onClick={() => setConfirmDelete({ id: tournament._id, type: 'tournament' })}
                                            className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-6 flex items-center">
                            <Plus className="w-5 h-5 mr-2 text-indigo-600" /> Quick Schedule Match
                        </h3>
                        <form className="space-y-4" onSubmit={handleCreateMatch}>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Tournament</label>
                                <select 
                                   value={newMatch.tournament}
                                   onChange={e => setNewMatch({...newMatch, tournament: e.target.value})}
                                   className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                                   required
                                >
                                    <option value="">Select Tournament</option>
                                    {tournaments.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Team 1</label>
                                    <select 
                                       value={newMatch.team1}
                                       onChange={e => setNewMatch({...newMatch, team1: e.target.value})}
                                       className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                                       required
                                    >
                                        <option value="">Select Team</option>
                                        {teams.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Team 2</label>
                                    <select 
                                       value={newMatch.team2}
                                       onChange={e => setNewMatch({...newMatch, team2: e.target.value})}
                                       className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                                       required
                                    >
                                        <option value="">Select Team</option>
                                        {teams.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Match Date & Time</label>
                                <input 
                                   type="datetime-local" 
                                   value={newMatch.date}
                                   onChange={e => setNewMatch({...newMatch, date: e.target.value})}
                                   className="w-full p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl outline-none focus:border-indigo-500 transition-all text-sm font-medium"
                                   required
                                />
                            </div>
                            <button type="submit" className="w-full py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">
                                Confirm Schedule
                            </button>
                        </form>
                    </div>
                </div>

                {/* Match Operations */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold mb-6">Match Operations</h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        {matches.length > 0 ? matches.map((match: any) => (
                            <div key={match._id} className="p-5 border border-gray-100 dark:border-gray-700 rounded-2xl hover:border-indigo-200 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                            match.status === 'Live' ? 'bg-red-100 text-red-600' : 
                                            match.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            {match.status}
                                        </span>
                                        <p className="font-bold mt-1">{match.team1?.shortName || 'T1'} vs {match.team2?.shortName || 'T2'}</p>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">{match.tournament?.name || 'Tournament'}</p>
                                        <p className="text-[10px] text-gray-500 mt-1">{new Date(match.date).toLocaleString()}</p>
                                        {match.toss?.winner && (
                                            <p className="text-[10px] font-bold text-yellow-600 mt-1 uppercase">
                                                Toss: {match.toss.decision} First
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex flex-col space-y-2">
                                        {match.status === 'Upcoming' && !match.toss?.winner && (
                                            <button 
                                                onClick={() => setTossMatch(match)}
                                                className="px-4 py-2 bg-yellow-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-yellow-500/20"
                                            >
                                                Coin Toss
                                            </button>
                                        )}
                                        {(match.status === 'Upcoming' || match.status === 'Live') && (
                                            <button 
                                                onClick={() => window.open(`/admin/strategy/${match._id}`, '_blank')}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20"
                                            >
                                                Strategy Board
                                            </button>
                                        )}
                                        {match.status === 'Upcoming' && match.toss?.winner && (
                                            <button 
                                                onClick={() => handleUpdateMatchStatus(match._id, 'Live')}
                                                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-600/20"
                                            >
                                                Go Live
                                            </button>
                                        )}
                                        {match.status === 'Live' && (
                                            <button 
                                                onClick={() => handleUpdateMatchStatus(match._id, 'Completed')}
                                                className="px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-green-600/20"
                                            >
                                                Finish
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => window.open(`/match/${match._id}/score`, '_blank')}
                                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                                        >
                                            Scoring
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10">
                                <p className="text-gray-400 italic text-sm">No matches scheduled yet.</p>
                            </div>
                        )}
                    </div>
                </div>
             </div>
          </div>
        )}

         {activeTab === 'players' && (
              <div className="space-y-8">
                 <div className="flex justify-between items-center">
                     <h1 className="text-3xl font-black italic uppercase">Player Database</h1>
                     <button 
                        onClick={() => setShowAddPlayer(!showAddPlayer)}
                        className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold"
                    >
                         <Plus className="w-5 h-5 mr-2" /> {showAddPlayer ? 'Cancel' : 'Add Player'}
                     </button>
                 </div>
                 
                  {showAddPlayer && (
                    <form onSubmit={handleCreatePlayer} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-indigo-100 shadow-xl space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input 
                                placeholder="Player Name"
                                value={newPlayer.name}
                                onChange={e => setNewPlayer({...newPlayer, name: e.target.value})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                required
                            />
                            <select 
                                value={newPlayer.role}
                                onChange={e => setNewPlayer({...newPlayer, role: e.target.value as any})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            >
                                <option>Batsman</option>
                                <option>Bowler</option>
                                <option>All-rounder</option>
                                <option>Wicket-keeper</option>
                            </select>
                            <input 
                                type="number"
                                placeholder="Base Price (L)"
                                value={newPlayer.basePrice}
                                onChange={e => setNewPlayer({...newPlayer, basePrice: Number(e.target.value)})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Assign Team</label>
                                <select 
                                    value={newPlayer.team}
                                    onChange={e => setNewPlayer({...newPlayer, team: e.target.value})}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                >
                                    <option value="">No Team (Free Agent)</option>
                                    {teams.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>
                            <input 
                                placeholder="Photo URL"
                                value={newPlayer.photoUrl}
                                onChange={e => setNewPlayer({...newPlayer, photoUrl: e.target.value})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            />
                            <input 
                                placeholder="Phone Number"
                                value={newPlayer.phone}
                                onChange={e => setNewPlayer({...newPlayer, phone: e.target.value})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            />
                            <input 
                                placeholder="Email Address"
                                value={newPlayer.email}
                                onChange={e => setNewPlayer({...newPlayer, email: e.target.value})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input 
                                    placeholder="Batting Style"
                                    value={newPlayer.battingStyle}
                                    onChange={e => setNewPlayer({...newPlayer, battingStyle: e.target.value})}
                                    className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                />
                                <input 
                                    placeholder="Bowling Style"
                                    value={newPlayer.bowlingStyle}
                                    onChange={e => setNewPlayer({...newPlayer, bowlingStyle: e.target.value})}
                                    className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Injury Status</label>
                                <select 
                                    value={newPlayer.injuryStatus}
                                    onChange={e => setNewPlayer({...newPlayer, injuryStatus: e.target.value as any})}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                >
                                    <option value="Fit">Fit</option>
                                    <option value="Minor">Minor Injury</option>
                                    <option value="Ruled Out">Ruled Out</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Injury Note</label>
                                <input 
                                    placeholder="e.g. Hamstring strain"
                                    value={newPlayer.injuryNote}
                                    onChange={e => setNewPlayer({...newPlayer, injuryNote: e.target.value})}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Save Player</button>
                    </form>
                 )}

                 {editingPlayer && (
                    <form onSubmit={handleUpdatePlayer} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-indigo-100 shadow-xl space-y-4">
                        <h3 className="font-bold">Edit Player</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input 
                                placeholder="Player Name"
                                value={editingPlayer.name}
                                onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                required
                            />
                            <select 
                                value={editingPlayer.role}
                                onChange={e => setEditingPlayer({...editingPlayer, role: e.target.value as any})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            >
                                <option>Batsman</option>
                                <option>Bowler</option>
                                <option>All-rounder</option>
                                <option>Wicket-keeper</option>
                            </select>
                            <input 
                                type="number"
                                placeholder="Base Price (L)"
                                value={editingPlayer.basePrice}
                                onChange={e => setEditingPlayer({...editingPlayer, basePrice: Number(e.target.value)})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Assign Team</label>
                                <select 
                                    value={editingPlayer.team?._id || editingPlayer.team || ''}
                                    onChange={e => setEditingPlayer({...editingPlayer, team: e.target.value})}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                >
                                    <option value="">No Team (Free Agent)</option>
                                    {teams.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                                placeholder="Photo URL"
                                value={editingPlayer.photoUrl || ''}
                                onChange={e => setEditingPlayer({...editingPlayer, photoUrl: e.target.value})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            />
                            <input 
                                placeholder="Phone Number"
                                value={editingPlayer.phone || ''}
                                onChange={e => setEditingPlayer({...editingPlayer, phone: e.target.value})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            />
                            <input 
                                placeholder="Email Address"
                                value={editingPlayer.email || ''}
                                onChange={e => setEditingPlayer({...editingPlayer, email: e.target.value})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input 
                                    placeholder="Batting Style"
                                    value={editingPlayer.battingStyle || ''}
                                    onChange={e => setEditingPlayer({...editingPlayer, battingStyle: e.target.value})}
                                    className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                />
                                <input 
                                    placeholder="Bowling Style"
                                    value={editingPlayer.bowlingStyle || ''}
                                    onChange={e => setEditingPlayer({...editingPlayer, bowlingStyle: e.target.value})}
                                    className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Injury Status</label>
                                <select 
                                    value={editingPlayer.injuryStatus || 'Fit'}
                                    onChange={e => setEditingPlayer({...editingPlayer, injuryStatus: e.target.value as any})}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                >
                                    <option value="Fit">Fit</option>
                                    <option value="Minor">Minor Injury</option>
                                    <option value="Ruled Out">Ruled Out</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Injury Note</label>
                                <input 
                                    placeholder="Injury Note"
                                    value={editingPlayer.injuryNote || ''}
                                    onChange={e => setEditingPlayer({...editingPlayer, injuryNote: e.target.value})}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Update Player</button>
                            <button type="button" onClick={() => setEditingPlayer(null)} className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold">Cancel</button>
                        </div>
                    </form>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {players.map((player: any) => (
                        <div key={player._id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <h4 className="font-bold text-lg">{player.name}</h4>
                            <div className="flex items-center space-x-2 mb-4">
                                <p className="text-sm text-gray-500 uppercase">{player.role} • {player.team?.name || 'Free Agent'}</p>
                                {player.injuryStatus !== 'Fit' && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${player.injuryStatus === 'Ruled Out' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                                        {player.injuryStatus === 'Ruled Out' ? 'Out' : 'Injury'}
                                    </span>
                                )}
                            </div>
                              <div className="flex space-x-2">
                                <Link 
                                    to={`/player/${player._id}`}
                                    target="_blank"
                                    className="flex-1 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold flex items-center justify-center hover:bg-indigo-100 transition-colors"
                                >
                                    <ExternalLink className="w-3 h-3 mr-1" /> Profile
                                </Link>
                                <button 
                                    onClick={() => setEditingPlayer(player)}
                                    className="flex-1 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-bold"
                                >
                                    Edit
                                </button>
                                 <button 
                                    onClick={() => setConfirmDelete({ id: player._id, type: 'player' })}
                                    className="flex-1 py-2 bg-red-100/50 text-red-600 rounded-lg text-xs font-bold"
                                >
                                    Delete
                                </button>
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
                     <button 
                        onClick={() => setShowAddTeam(!showAddTeam)}
                        className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold"
                    >
                         <Plus className="w-5 h-5 mr-2" /> {showAddTeam ? 'Cancel' : 'Add Team'}
                     </button>
                 </div>

                  {showAddTeam && (
                    <form onSubmit={handleCreateTeam} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-indigo-100 shadow-xl space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input 
                                placeholder="Team Name"
                                value={newTeam.name}
                                onChange={e => setNewTeam({...newTeam, name: e.target.value})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                required
                            />
                            <input 
                                placeholder="Short Name (e.g. MI)"
                                value={newTeam.shortName}
                                onChange={e => setNewTeam({...newTeam, shortName: e.target.value.toUpperCase()})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                required
                            />
                            <input 
                                type="number"
                                placeholder="Purse Amount"
                                value={newTeam.purseTotal}
                                onChange={e => setNewTeam({...newTeam, purseTotal: Number(e.target.value)})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                                placeholder="Logo URL"
                                value={newTeam.logo}
                                onChange={e => setNewTeam({...newTeam, logo: e.target.value})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            />
                            <select 
                                value={newTeam.owner}
                                onChange={e => setNewTeam({...newTeam, owner: e.target.value})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                required
                            >
                                <option value="">Select Owner</option>
                                {users && Array.isArray(users) && users.map((u: any) => <option key={u._id} value={u._id}>{u.username} ({u.email})</option>)}
                            </select>
                        </div>
                        <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">Save Team</button>
                    </form>
                 )}

                 {editingTeam && (
                    <form onSubmit={handleUpdateTeam} className="bg-white dark:bg-gray-800 p-8 rounded-3xl border border-indigo-100 shadow-xl space-y-4">
                        <h3 className="font-bold">Edit Team</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <input 
                                placeholder="Team Name"
                                value={editingTeam.name}
                                onChange={e => setEditingTeam({...editingTeam, name: e.target.value})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                required
                            />
                            <input 
                                placeholder="Short Name (e.g. MI)"
                                value={editingTeam.shortName}
                                onChange={e => setEditingTeam({...editingTeam, shortName: e.target.value.toUpperCase()})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                required
                            />
                            <input 
                                type="number"
                                placeholder="Purse Amount"
                                value={editingTeam.purseTotal}
                                onChange={e => setEditingTeam({...editingTeam, purseTotal: Number(e.target.value)})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                                placeholder="Logo URL"
                                value={editingTeam.logo || ''}
                                onChange={e => setEditingTeam({...editingTeam, logo: e.target.value})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                            />
                            <select 
                                value={editingTeam.owner || ''}
                                onChange={e => setEditingTeam({...editingTeam, owner: e.target.value})}
                                className="p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                required
                            >
                                <option value="">Select Owner</option>
                                {users && Array.isArray(users) && users.map((u: any) => <option key={u._id} value={u._id}>{u.username} ({u.email})</option>)}
                            </select>
                        </div>
                        <div className="flex space-x-3">
                            <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold">Update Team</button>
                            <button type="button" onClick={() => setEditingTeam(null)} className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold">Cancel</button>
                        </div>
                    </form>
                 )}
                 
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Team List & Owner Approval */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-6">Franchise Management</h3>
                        <div className="space-y-4">
                            {teams.map(team => (
                                <div key={team._id} className="p-5 border border-gray-100 dark:border-gray-700 rounded-2xl flex justify-between items-center">
                                    <div>
                                        <p className="font-bold">{team.name} ({team.shortName})</p>
                                        <p className="text-xs text-slate-500">Owner: {team.owner ? 'Registered' : 'Pending Approval'}</p>
                                    </div>
                                     <div className="flex space-x-2">
                                        {!team.owner && (
                                            <button 
                                                onClick={() => handleApproveOwner(team._id, 'default_owner_id')}
                                                className="px-4 py-2 bg-green-100 text-green-600 rounded-lg text-xs font-bold hover:bg-green-600 hover:text-white transition-all"
                                            >
                                                Approve Owner
                                            </button>
                                        )}
                                        <button 
                                            onClick={() => setEditingTeam(team)}
                                            className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-bold"
                                        >
                                            <Settings className="w-4 h-4 text-indigo-500" />
                                        </button>
                                         <button 
                                            onClick={() => setConfirmDelete({ id: team._id, type: 'team' })}
                                            className="p-2 bg-red-100/50 text-red-600 rounded-lg text-xs font-bold"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
         )}

         {activeTab === 'engagement' && (
             <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-black italic uppercase">Fan Engagement Hub</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Create Poll */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-6">Create New Poll</h3>
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            try {
                                await cricketApi.createPoll({
                                    matchId: newPoll.match,
                                    question: newPoll.question,
                                    options: newPoll.options
                                });
                                toast.success('Poll Created!');
                                setNewPoll({ match: '', question: '', options: ['', ''] });
                                fetchData();
                            } catch (err) {
                                toast.error('Failed to create poll');
                            }
                        }} className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Select Match</label>
                                <select 
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                    value={newPoll.match}
                                    onChange={e => setNewPoll({...newPoll, match: e.target.value})}
                                    required
                                >
                                    <option value="">Choose a Match</option>
                                    {matches.map((m: any) => (
                                        <option key={m._id} value={m._id}>{m.team1?.name} vs {m.team2?.name} ({m.status})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Poll Question</label>
                                <input 
                                    placeholder="e.g. Who will win this match?"
                                    value={newPoll.question}
                                    onChange={e => setNewPoll({...newPoll, question: e.target.value})}
                                    className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase mb-2 block">Options</label>
                                {newPoll.options.map((opt, idx) => (
                                    <input 
                                        key={idx}
                                        placeholder={`Option ${idx + 1}`}
                                        value={opt}
                                        onChange={e => {
                                            const opts = [...newPoll.options];
                                            opts[idx] = e.target.value;
                                            setNewPoll({...newPoll, options: opts});
                                        }}
                                        className="w-full p-3 bg-gray-50 dark:bg-gray-900 rounded-xl"
                                        required
                                    />
                                ))}
                                <button 
                                    type="button" 
                                    onClick={() => setNewPoll({...newPoll, options: [...newPoll.options, '']})}
                                    className="text-xs font-bold text-indigo-600 uppercase hover:underline"
                                >
                                    + Add Option
                                </button>
                            </div>
                            <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20">
                                Launch Poll
                            </button>
                        </form>
                    </div>

                    {/* Active Polls */}
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold mb-6">Active Polls</h3>
                        <div className="space-y-4">
                            {polls.length === 0 && <p className="text-gray-400 text-sm">No active polls.</p>}
                            {polls.map(poll => (
                                <div key={poll._id} className="p-4 border border-gray-100 dark:border-gray-700 rounded-2xl">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-sm">{poll.question}</h4>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase ${poll.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                                            {poll.isActive ? 'Active' : 'Closed'}
                                        </span>
                                    </div>
                                    <p className="text-[10px] text-gray-400 uppercase mb-3">Match: {poll.match?.team1?.name} vs {poll.match?.team2?.name}</p>
                                    <div className="space-y-1">
                                        {poll.options.map((opt: any, idx: number) => (
                                            <div key={idx} className="flex justify-between text-[10px]">
                                                <span>{opt.text}</span>
                                                <span className="font-bold">{opt.votes} votes</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             </div>
         )}

        {confirmDelete && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center space-y-6 border border-gray-100 dark:border-gray-700">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Are you sure?</h3>
                        <p className="text-gray-500 text-sm mt-2">This action cannot be undone. All related data for this {confirmDelete.type} will be removed.</p>
                    </div>
                    <div className="flex space-x-3">
                        <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl font-bold text-sm">Cancel</button>
                        <button onClick={handleConfirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-600/20">Delete</button>
                    </div>
                </div>
            </div>
        )}

        <CoinTossModal 
            isOpen={!!tossMatch}
            onClose={() => setTossMatch(null)}
            team1={tossMatch?.team1}
            team2={tossMatch?.team2}
            onComplete={handleTossComplete}
        />
      </main>
    </div>
  );
};

export default AdminCricketDashboard;
