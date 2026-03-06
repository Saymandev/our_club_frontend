import PlayerProfileCard from '@/components/Cricket/PlayerProfileCard';
import cricketApi from '@/services/cricketApi';
import { useAuthStore } from '@/store/authStore';
import { AnimatePresence, motion } from 'framer-motion';
import { Gavel, History as HistoryIcon, TrendingUp, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

const AuctionPage: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [auction, setAuction] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    // Fetch initial data
    const fetchData = async () => {
      try {
        const teamsRes = await cricketApi.getTeams();
        setTeams(teamsRes.data);
        
        const auctionsRes = await cricketApi.getAuctions();
        if (auctionsRes.data.length > 0) {
          setAuction(auctionsRes.data[0]);
          newSocket.emit('joinAuction', auctionsRes.data[0]._id);
        }
      } catch (err) {
        console.error('Error fetching auction data:', err);
      }
    };
    fetchData();

    newSocket.on('bidUpdate', (data: any) => {
      setAuction((prev: any) => ({
        ...prev,
        highestBid: data.highestBid,
        timer: 30
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleBid = async (amount: number) => {
    if (!socket || !auction || !user) return;
    
    // Check if user is an owner of a team
    const myTeam = teams.find(t => t.owner === user.id);
    if (!myTeam) {
        toast.error("You must be a team owner to place a bid!");
        return;
    }

    try {
      await cricketApi.placeBid({
        auctionId: auction._id,
        bidderId: myTeam._id,
        amount
      });
    } catch (err) {
      console.error('Bid failed:', err);
    }
  };

  const handleRTM = async () => {
    if (!socket || !auction || !user) return;
    
    const myTeam = teams.find(t => t.owner === user.id);
    if (!myTeam) {
        toast.error("You must be a team owner to exercise RTM!");
        return;
    }

    try {
      await cricketApi.exerciseRTM({
        auctionId: auction._id,
        teamId: myTeam._id
      });
      toast.success("RTM Exercised Successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'RTM failed');
    }
  };

  const myTeam = user ? teams.find(t => t.owner === user.id) : null;
  const canUseRTM = myTeam && 
                    myTeam.rtmCardsRemaining > 0 && 
                    myTeam.previousPlayers?.includes(auction.currentPlayer?._id) &&
                    auction.highestBid?.bidder?._id !== myTeam._id &&
                    auction.highestBid?.amount > 0;

  if (!auction) return <div className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest animate-pulse">No active auction found.</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white dark:bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl transition-colors">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-500/20">
              <Gavel className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent italic uppercase tracking-tighter">UBPL Auction</h1>
              <p className="text-slate-400 text-sm font-medium">Live Player Biddings • Season 2026</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center space-x-6">
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Auction Status</p>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-green-400 font-bold uppercase tracking-wide text-sm">{auction.status}</p>
              </div>
            </div>
            {/* Timer for quick view */}
            <div className="p-3 bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
               <p className="text-[10px] text-slate-500 font-black uppercase">Timer</p>
               <p className="text-xl font-black italic text-red-500 tabular-nums">{auction.timer}s</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Console */}
          <div className="lg:col-span-8 space-y-8">
            <AnimatePresence mode="wait">
              {auction.currentPlayer && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-8"
                >
                  <PlayerProfileCard player={auction.currentPlayer} />
                  
                  {/* Bidding Console */}
                  <div className="bg-white dark:bg-slate-800/50 backdrop-blur-md p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl transition-colors">
                    <div className="flex justify-between items-end mb-6">
                       <h3 className="text-lg font-bold uppercase tracking-tighter italic">Bidding Console</h3>
                       <div className="text-right">
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Current Price</p>
                          <p className="text-3xl font-black italic text-indigo-600 dark:text-white">৳{auction.highestBid?.amount || auction.currentPlayer?.basePrice}L</p>
                       </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 mb-6">
                      {[5, 10, 25, 50, 100].map(inc => (
                        <button
                          key={inc}
                          onClick={() => handleBid((auction.highestBid?.amount || auction.currentPlayer?.basePrice) + inc)}
                          className="flex-1 min-w-[100px] bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-bold py-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-indigo-500/50 transition-all active:scale-95 text-lg"
                        >
                          +৳{inc}L
                        </button>
                      ))}
                    </div>

                    {canUseRTM && (
                        <button
                          onClick={handleRTM}
                          className="w-full mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-4 rounded-xl border border-purple-500 shadow-lg shadow-purple-500/20 transition-all active:scale-95 text-lg uppercase tracking-widest"
                        >
                          Exercise RTM (৳{auction.highestBid?.amount}L)
                        </button>
                    )}
                    <div className="flex items-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-yellow-500 mr-3" />
                      <p className="text-yellow-200/80 text-sm italic font-medium">
                        Current Highest Bidder: <span className="text-yellow-400 font-black uppercase ml-1">{auction.highestBid?.bidder?.name || 'Waiting for first bid...'}</span>
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auction History */}
            <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm transition-colors">
               <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <HistoryIcon className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Auction History</h3>
                  </div>
               </div>
               <div className="p-6 overflow-x-auto">
                 <table className="w-full text-left">
                   <thead className="text-xs text-slate-500 uppercase font-black tracking-widest">
                     <tr>
                       <th className="pb-4">Player</th>
                       <th className="pb-4">Team</th>
                       <th className="pb-4">Price</th>
                       <th className="pb-4 text-right">Status</th>
                     </tr>
                   </thead>
                   <tbody className="text-sm divide-y divide-slate-700/50">
                     {auction.history?.map((entry: any, i: number) => (
                       <tr key={i} className="group">
                         <td className="py-4 font-bold text-slate-800 dark:text-slate-200">{entry.player?.name}</td>
                         <td className="py-4 text-slate-500 dark:text-slate-400 font-medium">{entry.soldTo?.name || '-'}</td>
                         <td className="py-4 font-black italic text-indigo-600 dark:text-indigo-300">৳{entry.price}L</td>
                         <td className="py-4 text-right">
                           <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${entry.status === 'Sold' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                             {entry.status}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white dark:bg-slate-800/40 rounded-3xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-sm transition-colors">
               <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Team Purse Status</h3>
                  </div>
               </div>
               <div className="p-6 space-y-4">
                 {teams.map((team: any) => (
                   <div key={team._id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex justify-between items-center group hover:border-indigo-500/30 transition-all">
                     <div className="flex items-center space-x-3">
                       <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center font-black text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors text-xs border border-slate-100 dark:border-slate-700">
                         {team.shortName?.[0] || '?'}
                       </div>
                       <div>
                         <p className="font-bold text-sm tracking-tight">{team.name}</p>
                         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{team.squad?.length || 0} Players • {team.rtmCardsRemaining ?? 0} RTM</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="text-lg font-black italic tabular-nums text-slate-900 dark:text-white">৳{team.purseRemaining}L</p>
                       <p className="text-[10px] text-slate-500 font-bold uppercase">Remaining</p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionPage;
