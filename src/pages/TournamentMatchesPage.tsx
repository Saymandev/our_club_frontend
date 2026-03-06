import cricketApi from '@/services/cricketApi';
import { Calendar, ChevronLeft, MapPin, Trophy } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const TournamentMatchesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [matches, setMatches] = useState<any[]>([]);
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [mRes, tRes] = await Promise.all([
          cricketApi.getMatches({ tournamentId: id }),
          cricketApi.getTournaments()
        ]);
        setMatches(mRes.data.filter((m: any) => m.tournament?._id === id || m.tournament === id));
        setTournament(tRes.data.find((t: any) => t._id === id));
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="p-8 text-center font-bold animate-pulse uppercase tracking-widest text-slate-400">Loading Fixtures...</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/tournaments" className="inline-flex items-center text-slate-400 hover:text-indigo-600 mb-8 transition-colors font-bold text-xs uppercase tracking-widest">
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Tournaments
        </Link>
        
        <header className="mb-12">
            <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                    <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-800 dark:text-white">
                        {tournament?.name || 'Tournament'} Fixtures
                    </h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Season {tournament?.year || '2026'} • Match Schedule</p>
                </div>
            </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {matches.length > 0 ? matches.map((match) => (
            <Link 
                key={match._id} 
                to={`/match/${match._id}/score`}
                className="bg-white dark:bg-slate-800 rounded-[2rem] p-8 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-xl hover:border-indigo-200 transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  match.status === 'Live' ? 'bg-red-100 text-red-600 animate-pulse' : 
                  match.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {match.status}
                </span>
                <div className="flex items-center text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                    <Calendar className="w-3 h-3 mr-1" /> {new Date(match.date).toLocaleDateString()}
                </div>
              </div>

              <div className="flex items-center justify-between mb-8">
                  <div className="text-center flex-1">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-3xl mx-auto mb-3 flex items-center justify-center font-black text-2xl text-indigo-600 group-hover:scale-110 transition-transform">
                          {match.team1?.shortName?.[0] || '?'}
                      </div>
                      <p className="font-black italic uppercase text-sm tracking-tighter">{match.team1?.shortName || 'T1'}</p>
                  </div>
                  <div className="px-4 text-xs font-black text-slate-200 italic">VS</div>
                  <div className="text-center flex-1">
                      <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-3xl mx-auto mb-3 flex items-center justify-center font-black text-2xl text-slate-400 group-hover:scale-110 transition-transform">
                          {match.team2?.shortName?.[0] || '?'}
                      </div>
                      <p className="font-black italic uppercase text-sm tracking-tighter">{match.team2?.shortName || 'T2'}</p>
                  </div>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-700/50 py-3 rounded-2xl">
                <MapPin className="w-3 h-3 text-indigo-500" />
                <span>{match.venue || 'Main Stadium'}</span>
              </div>
            </Link>
          )) : (
            <div className="col-span-full py-20 bg-white dark:bg-slate-800 rounded-[3rem] border-2 border-dashed border-slate-200 dark:border-slate-700 text-center">
                <p className="text-slate-400 font-bold italic">No matches scheduled for this tournament yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentMatchesPage;
