import cricketApi from '@/services/cricketApi';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const LiveScoringPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [match, setMatch] = useState<any>(null);
  const [runs, setRuns] = useState<number>(0);
  const [extra, setExtra] = useState<string>('None');

  useEffect(() => {
    const fetchMatch = async () => {
      if (!id) return;
      try {
        const res = await cricketApi.getMatchById(id);
        setMatch(res.data);
      } catch (err) {
        console.error('Error fetching match:', err);
      }
    };
    fetchMatch();
  }, [id]);

  const handleBallSubmit = async (wicket: boolean = false) => {
    if (!match) return;
    try {
      await cricketApi.addBall({
        matchId: match._id,
        inningsNo: match.status === 'Live' ? 1 : 1, // Logic depends on current innings
        over: 0, // Should be calculated
        ball: 0, // Should be calculated
        striker: match.team1.squad[0], // Simplified
        nonStriker: match.team1.squad[1],
        bowler: match.team2.squad[0],
        runs,
        extras: { type: extra, runs: extra !== 'None' ? 1 : 0 },
        wicket: wicket ? { type: 'Bowled', player: match.team1.squad[0] } : undefined
      });
      // Refresh match data
      const res = await cricketApi.getMatchById(match._id);
      setMatch(res.data);
    } catch (err) {
      console.error('Error submitting ball:', err);
    }
  };

  if (!match) return <div className="p-8 text-center">Loading match...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center mb-8">
            <div className="text-center flex-1">
              <p className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">{match.team1.name}</p>
              <h2 className="text-4xl font-black">{match.innings[0]?.runs} / {match.innings[0]?.wickets}</h2>
              <p className="text-sm text-slate-500 mt-1">({match.innings[0]?.overs}.{match.innings[0]?.balls} Ov)</p>
            </div>
            <div className="px-4 text-xl font-bold text-slate-300 italic">VS</div>
            <div className="text-center flex-1 text-slate-400">
              <p className="text-sm font-bold uppercase tracking-widest mb-2">{match.team2.name}</p>
              <h2 className="text-4xl font-black">Yet to Bat</h2>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-8">
             {[0,1,2,3,4,6].map(r => (
               <button 
                key={r}
                onClick={() => setRuns(r)}
                className={`py-6 rounded-2xl text-2xl font-black transition-all ${runs === r ? 'bg-indigo-600 text-white translate-y-[-4px]' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white'}`}
               >
                 {r}
               </button>
             ))}
             <button 
                onClick={() => handleBallSubmit(true)}
                className="col-span-2 py-6 bg-red-500 hover:bg-red-600 text-white rounded-2xl text-2xl font-black transition-all"
             >
               WICKET
             </button>
          </div>

          <div className="flex space-x-4 mb-8">
             {['None', 'Wide', 'No Ball', 'Bye'].map(e => (
               <button 
                key={e}
                onClick={() => setExtra(e)}
                className={`flex-1 py-4 rounded-xl font-bold border-2 transition-all ${extra === e ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'border-slate-100 dark:border-slate-700 text-slate-500'}`}
               >
                 {e}
               </button>
             ))}
          </div>

          <button 
            onClick={() => handleBallSubmit()}
            className="w-full py-6 bg-slate-900 dark:bg-white dark:text-slate-900 rounded-3xl text-2xl font-black uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all shadow-2xl mb-8"
          >
            Submit Ball
          </button>

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
