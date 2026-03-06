import FanPollCard from '@/components/Cricket/FanPollCard';
import MatchCharts from '@/components/Cricket/MatchCharts';
import PartnershipDisplay from '@/components/Cricket/PartnershipDisplay';
import StarPlayerPicker from '@/components/Cricket/StarPlayerPicker';
import CoinBalance from '@/components/Currency/CoinBalance';
import cricketApi from '@/services/cricketApi';
import { useAuthStore } from '@/store/authStore';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';

const LiveScoringPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  
  const [match, setMatch] = useState<any>(null);
  const [balls, setBalls] = useState<any[]>([]);
  const [runs, setRuns] = useState<number>(0);
  const [extra, setExtra] = useState<string>('None');
  
  // Selection States
  const [striker, setStriker] = useState<string>('');
  const [nonStriker, setNonStriker] = useState<string>('');
  const [bowler, setBowler] = useState<string>('');
  const [winProb, setWinProb] = useState<{ team1: number, team2: number }>({ team1: 50, team2: 50 });
  const [userCoins, setUserCoins] = useState<number>(0);
  const [polls, setPolls] = useState<any[]>([]);
  const [votedPolls, setVotedPolls] = useState<string[]>([]);
  const [currentStarPick, setCurrentStarPick] = useState<string | undefined>();

  // UI Effects
  const [flash, setFlash] = useState<'four' | 'six' | 'wicket' | null>(null);

  useEffect(() => {
    const fetchMatchAndBalls = async () => {
      if (!id) return;
      try {
        const [matchRes, ballsRes] = await Promise.all([
            cricketApi.getMatchById(id),
            cricketApi.getMatchBalls(id)
        ]);
        setMatch(matchRes.data);
        setBalls(ballsRes.data.reverse()); // Reverse to put newest on top
      } catch (err) {
        console.error('Error fetching match/balls:', err);
      }
    };
    fetchMatchAndBalls();
  }, [id]);

  useEffect(() => {
    const fetchFanData = async () => {
      if (!id || !user) return;
      try {
        const [coinRes, pollRes] = await Promise.all([
          cricketApi.getUserCoins(),
          cricketApi.getMatchPolls(id)
        ]);
        setUserCoins(coinRes.data.coins);
        setPolls(pollRes.data);

        const starRes = await cricketApi.getStarPlayerPick(id);
        if (starRes.data) setCurrentStarPick(starRes.data.starPlayer?._id || starRes.data.starPlayer);
      } catch (err) {
        console.error('Error fetching fan data:', err);
      }
    };
    fetchFanData();
  }, [id, user]);

  const handlePollVote = async (pollId: string, optionIndex: number) => {
    try {
      const res = await cricketApi.voteInPoll({ pollId, optionIndex });
      setUserCoins(res.data.remainingCoins);
      setVotedPolls([...votedPolls, pollId]);
      
      // Refresh polls to show updated votes
      if (id) {
          const pollRes = await cricketApi.getMatchPolls(id);
          setPolls(pollRes.data);
      }
      toast.success('Vote registered! -10 Coins');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to vote');
    }
  };

  const handleStarPick = async (playerId: string) => {
    try {
      await cricketApi.pickStarPlayer({ matchId: id!, playerId });
      setCurrentStarPick(playerId);
      toast.success('Star Player Selected!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to pick star player');
    }
  };

  useEffect(() => {
    if (match) {
        // Default selections if not set
        const t1List = match.playingXI?.team1?.length > 0 ? match.playingXI.team1 : match.team1?.squad || [];
        const t2List = match.playingXI?.team2?.length > 0 ? match.playingXI.team2 : match.team2?.squad || [];

        if (!striker && t1List.length > 0) setStriker(t1List[0]._id || t1List[0]);
        if (!nonStriker && t1List.length > 1) setNonStriker(t1List[1]._id || t1List[1]);
        if (!bowler && t2List.length > 0) setBowler(t2List[0]._id || t2List[0]);
    }
  }, [match]);

  const handleBallSubmit = async (wicket: boolean = false) => {
    if (!match || !striker || !nonStriker || !bowler) return;
    try {
      const res = await cricketApi.addBall({
        matchId: match._id,
        inningsNo: match.status === 'Live' ? 1 : 2, 
        striker,
        nonStriker,
        bowler,
        runs,
        extras: { type: extra, runs: extra !== 'None' ? 1 : 0 },
        wicket: wicket ? { type: 'Bowled', player: striker } : undefined
      });
      
      // Update match data
      setMatch(res.data.match);
      
      // Refresh balls list
      const ballsRes = await cricketApi.getMatchBalls(match._id);
      setBalls(ballsRes.data.reverse());
      
      // Update next state
      if (res.data.nextState) {
          setStriker(res.data.nextState.striker);
          setNonStriker(res.data.nextState.nonStriker);
      }

      if (res.data.winProbability) {
          setWinProb(res.data.winProbability);
      }
      
      // Reset runs for next ball
      setRuns(0);
      setExtra('None');

      // Trigger Flash Results
      if (wicket) {
        setFlash('wicket');
      } else if (runs === 4) {
        setFlash('four');
      } else if (runs === 6) {
        setFlash('six');
      }
      if (flash) setTimeout(() => setFlash(null), 3000);
    } catch (err) {
      console.error('Error submitting ball:', err);
    }
  };

  if (!match) return <div className="p-8 text-center">Loading match...</div>;

  let partnershipRuns = 0;
  let partnershipBalls = 0;
  let s1 = { name: '', runs: 0, balls: 0, id: '' };
  let s2 = { name: '', runs: 0, balls: 0, id: '' };

  const currentInningsNo = match.status === 'Live' ? 1 : (match.innings.length === 2 ? 2 : 1);

  // Calculate Partnership and individual splits
  for (const b of balls) {
      if (b.inningsNo !== currentInningsNo) continue;
      if (b.wicket) break; 
      
      const r = b.runs + (b.extras?.runs || 0);
      partnershipRuns += r;
      const isLegal = b.extras?.type !== 'Wide' && b.extras?.type !== 'No Ball';
      if (isLegal) partnershipBalls += 1;

      // Track individual runs in this partnership
      if (!s1.id) {
          s1.id = b.striker?._id || b.striker;
          s1.name = b.striker?.name || 'Batsman 1';
      }
      if (!s2.id && (b.nonStriker?._id || b.nonStriker) !== s1.id) {
          s2.id = b.nonStriker?._id || b.nonStriker;
          s2.name = b.nonStriker?.name || 'Batsman 2';
      }

      if ((b.striker?._id || b.striker) === s1.id) {
          s1.runs += b.runs;
          if (isLegal) s1.balls += 1;
      } else if ((b.striker?._id || b.striker) === s2.id) {
          s2.runs += b.runs;
          if (isLegal) s2.balls += 1;
      }
  }

  // Fallback names if partnership just started
  if (!s1.name && match.playingXI?.team1?.length > 0) {
      const p1 = (match.playingXI.team1).find((p: any) => (p._id || p) === striker);
      s1.name = p1?.name || 'Striker';
  }
  if (!s2.name && match.playingXI?.team1?.length > 0) {
      const p2 = (match.playingXI.team1).find((p: any) => (p._id || p) === nonStriker);
      s2.name = p2?.name || 'Non-Striker';
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
            <Link to="/tournaments" className="flex items-center text-slate-400 hover:text-indigo-600 mb-6 transition-colors font-bold text-xs uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Tournaments
          </Link>

          <div className="flex justify-between items-start mb-8">
            <div className="text-center flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{match.team1?.name || 'Team 1'}</p>
              <h2 className="text-5xl font-black italic tracking-tighter text-slate-800 dark:text-white">
                {match.innings[0]?.runs || 0} / {match.innings[0]?.wickets || 0}
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase">({match.innings[0]?.overs || 0}.{match.innings[0]?.balls || 0} Overs)</p>
            </div>
            
            <div className="px-6 flex flex-col items-center">
                <div className="mb-4">
                  <CoinBalance balance={userCoins} />
                </div>
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-2">
                    <Trophy className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-black text-slate-300 italic uppercase">VS</span>
            </div>

            <div className={`text-center flex-1 ${match.status === 'Upcoming' ? 'opacity-30' : ''}`}>
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">{match.team2?.name || 'Team 2'}</p>
              <h2 className="text-5xl font-black italic tracking-tighter text-slate-800 dark:text-white">
                {match.innings[1] ? `${match.innings[1].runs} / ${match.innings[1].wickets}` : '0 / 0'}
              </h2>
              <p className="text-xs font-bold text-slate-400 mt-2 uppercase">
                {match.innings[1] ? `(${match.innings[1].overs}.${match.innings[1].balls} Overs)` : 'Yet to Bat'}
              </p>
            </div>
          </div>

          {/* Win Probability Meter */}
          <div className="mb-10 px-4">
              <div className="flex justify-between items-center mb-3 px-1">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{match.team1?.shortName || 'T1'}</span>
                      <span className="text-xl font-black italic text-indigo-600">{winProb.team1}%</span>
                  </div>
                  <div className="flex flex-col text-right">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{match.team2?.shortName || 'T2'}</span>
                      <span className="text-xl font-black italic text-slate-400">{winProb.team2}%</span>
                  </div>
              </div>
              <div className="relative h-4 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden flex shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                  <motion.div 
                    initial={{ width: '50%' }}
                    animate={{ width: `${winProb.team1}%` }}
                    transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                    className="h-full bg-gradient-to-r from-indigo-600 to-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)] relative z-10"
                  >
                      <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
                  </motion.div>
                  <div className="w-1 h-full bg-white dark:bg-slate-800 z-20 shadow-sm" />
                  <motion.div 
                    initial={{ width: '50%' }}
                    animate={{ width: `${winProb.team2}%` }}
                    transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                    className="h-full bg-slate-200 dark:bg-slate-800 shadow-inner"
                  />
              </div>
              <p className="text-center text-[9px] font-black text-indigo-500/50 mt-3 uppercase tracking-[0.3em] animate-pulse">Live AI Win Predictor</p>
          </div>

          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes slide {
              from { background-position: 0 0; }
              to { background-position: 20px 0; }
            }
          ` }} />

          {/* Premium Partnership Display */}
          <div className="mb-8">
            <PartnershipDisplay 
                runs={partnershipRuns}
                balls={partnershipBalls}
                player1={s1}
                player2={s2}
            />
          </div>

          <AnimatePresence>
            {flash && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.5 }}
                    className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none ${
                        flash === 'six' ? 'bg-indigo-600/20' : flash === 'four' ? 'bg-amber-500/20' : 'bg-red-600/20'
                    }`}
                >
                    <motion.div 
                        animate={{ 
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className={`text-9xl font-black italic uppercase tracking-tighter drop-shadow-2xl ${
                            flash === 'six' ? 'text-indigo-600' : flash === 'four' ? 'text-amber-500' : 'text-red-600'
                        }`}
                    >
                        {flash}
                    </motion.div>
                </motion.div>
            )}
          </AnimatePresence>

          <div className="h-px bg-slate-100 dark:bg-slate-700 w-full mb-8"></div>

          {isAdmin ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-8">
                  <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">On Strike</label>
                      <select 
                        value={striker} 
                        onChange={e => setStriker(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
                      >
                          {(match.playingXI?.team1?.length > 0 ? match.playingXI.team1 : match.team1?.squad)?.map((p: any) => <option key={p._id || p} value={p._id || p}>{p.name || 'Player'}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Non-Strike</label>
                      <select 
                        value={nonStriker} 
                        onChange={e => setNonStriker(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
                      >
                          {(match.playingXI?.team1?.length > 0 ? match.playingXI.team1 : match.team1?.squad)?.map((p: any) => <option key={p._id || p} value={p._id || p}>{p.name || 'Player'}</option>)}
                      </select>
                  </div>
                  <div className="col-span-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Bowler</label>
                      <select 
                        value={bowler} 
                        onChange={e => setBowler(e.target.value)}
                        className="w-full p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-indigo-500 outline-none transition-all"
                      >
                          {(match.playingXI?.team2?.length > 0 ? match.playingXI.team2 : match.team2?.squad)?.map((p: any) => <option key={p._id || p} value={p._id || p}>{p.name || 'Player'}</option>)}
                      </select>
                  </div>
              </div>

              <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
                 {[0,1,2,3,4,6].map(r => (
                   <button 
                    key={r}
                    onClick={() => setRuns(r)}
                    className={`h-16 rounded-2xl text-2xl font-black transition-all shadow-sm ${runs === r ? 'bg-indigo-600 text-white translate-y-[-2px] shadow-lg shadow-indigo-600/30' : 'bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-white hover:bg-slate-100'}`}
                   >
                     {r}
                   </button>
                 ))}
              </div>

              <div className="flex space-x-3 mb-6">
                 {['None', 'Wide', 'No Ball', 'Bye'].map(e => (
                   <button 
                    key={e}
                    onClick={() => setExtra(e)}
                    className={`flex-1 py-4 rounded-2xl font-bold border-2 transition-all text-xs uppercase tracking-widest ${extra === e ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-slate-700 text-slate-500'}`}
                   >
                     {e}
                   </button>
                 ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                  <button 
                    onClick={() => handleBallSubmit()}
                    className="py-6 bg-slate-900 dark:bg-white dark:text-slate-900 rounded-3xl text-xl font-black uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                  >
                    Submit Ball
                  </button>
                  <button 
                    onClick={() => handleBallSubmit(true)}
                    className="py-6 bg-red-600 text-white rounded-3xl text-xl font-black uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-red-600/20"
                  >
                    WICKET
                  </button>
              </div>
            </>
          ) : (
            <div className="py-2 text-center space-y-4">
                <div className="inline-block px-4 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                    Live Coverage
                </div>
            </div>
          )}

          {/* Match Progression Charts */}
          {balls.length > 0 && (
              <div className="mb-8">
                  <MatchCharts 
                    balls={balls} 
                    team1Name={match.team1?.shortName || 'T1'} 
                    team2Name={match.team2?.shortName || 'T2'} 
                  />
              </div>
          )}

          {/* Gamification Hub */}
          <div className="mb-12 border-t border-slate-100 dark:border-slate-700 pt-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-black uppercase text-slate-400 flex items-center tracking-widest">
                    Fan Engagement Hub
                </h3>
                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-700 mx-6" />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Star Player Picker */}
                  <div className="lg:col-span-1">
                      <StarPlayerPicker 
                        matchId={id!}
                        players={[
                            ...(match.playingXI?.team1 || match.team1?.squad || []),
                            ...(match.playingXI?.team2 || match.team2?.squad || [])
                        ]}
                        onPick={handleStarPick}
                        currentPickId={currentStarPick}
                        matchStatus={match.status}
                      />
                  </div>

                  {/* Polls */}
                  <div className="lg:col-span-2 space-y-8">
                      {polls.map((poll) => (
                          <FanPollCard 
                             key={poll._id}
                             id={poll._id}
                             question={poll.question}
                             options={poll.options}
                             onVote={(idx) => handlePollVote(poll._id, idx)}
                             alreadyVoted={votedPolls.includes(poll._id)}
                             totalCoins={userCoins}
                          />
                      ))}
                      {polls.length === 0 && (
                          <div className="p-8 text-center bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No active polls for this match.</p>
                          </div>
                      )}
                  </div>
              </div>
          </div>

          {/* Commentary Feed */}
          {balls.length > 0 && (
              <div className="mb-8 border-t border-slate-100 dark:border-slate-700 pt-6">
                  <h3 className="text-sm font-black uppercase text-slate-400 mb-6 flex items-center tracking-widest">
                      Ball-by-Ball Commentary
                  </h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {balls.map((b: any) => {
                          const isWicket = !!b.wicket;
                          const isBoundary = b.runs === 4 || b.runs === 6;
                          
                          return (
                              <div 
                                key={b._id} 
                                className={`flex space-x-4 items-start p-4 rounded-2xl border transition-all ${
                                    isWicket 
                                    ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 shadow-lg shadow-red-500/5' 
                                    : isBoundary 
                                    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30' 
                                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700'
                                }`}
                              >
                                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black flex-shrink-0 ${
                                      isWicket 
                                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 animate-pulse' 
                                      : isBoundary 
                                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                                      : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                  }`}>
                                      {b.over}.{b.ball}
                                  </div>
                                  <div className="flex-1">
                                      <p className={`text-sm font-bold leading-relaxed ${
                                          isWicket ? 'text-red-700 dark:text-red-400' : 'text-slate-800 dark:text-white'
                                      }`}>
                                          {b.commentary || 'No commentary available.'}
                                      </p>
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-black/5 dark:bg-white/5 rounded-md text-slate-500 dark:text-slate-400">
                                            {b.bowler?.name} to {b.striker?.name}
                                        </span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                                            isBoundary ? 'bg-amber-500 text-white' : 'bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                                        }`}>
                                            {b.runs} {b.extras?.type !== 'None' ? `+ ${b.extras.runs} ${b.extras.type}` : 'RUNS'}
                                        </span>
                                        {b.wicket && (
                                            <span className="text-[10px] font-black px-2 py-0.5 bg-red-600 text-white rounded-md uppercase tracking-wider">
                                                WICKET
                                            </span>
                                        )}
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          )}

          {/* Sponsorship Zone */}
          <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 text-center">
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Our Proud Partners</p>
             <div className="flex justify-around items-center opacity-50 grayscale hover:grayscale-0 transition-all">
                <div className="h-8 w-24 bg-slate-300 dark:bg-slate-600 rounded flex items-center justify-center text-[10px] font-bold">SPONSOR 1</div>
                <div className="h-8 w-24 bg-slate-300 dark:bg-slate-600 rounded flex items-center justify-center text-[10px] font-bold">SPONSOR 2</div>
                <div className="h-8 w-24 bg-slate-300 dark:bg-slate-600 rounded flex items-center justify-center text-[10px] font-bold">SPONSOR 3</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveScoringPage;
