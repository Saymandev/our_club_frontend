import cricketApi from '@/services/cricketApi';
import { ArrowRight, Calendar, Trophy, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const TournamentPage: React.FC = () => {
  const [tournaments, setTournaments] = useState<any[]>([]);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await cricketApi.getTournaments();
        setTournaments(res.data);
      } catch (err) {
        console.error('Error fetching tournaments:', err);
      }
    };
    fetchTournaments();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Tournaments</h1>
          <p className="text-gray-600 dark:text-gray-400">View and manage cricket tournaments.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament) => (
            <div key={tournament._id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-xl">
                  <Trophy className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  tournament.status === 'Live' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {tournament.status}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{tournament.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{tournament.year}</p>
              
              <div className="flex items-center space-x-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {tournament.teams?.length || 0} Teams
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  20 Matches
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Link 
                  to={`/tournaments/${tournament._id}/points-table`}
                  className="flex items-center justify-center p-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Points Table
                </Link>
                <Link 
                  to={`/tournaments/${tournament._id}/matches`}
                  className="flex items-center justify-center p-3 bg-indigo-600 rounded-xl text-sm font-bold text-white hover:bg-indigo-700 transition-colors"
                >
                  Matches <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentPage;
