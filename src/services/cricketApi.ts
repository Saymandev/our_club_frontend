import api from './api';

// Players
export const getPlayers = (params?: any) => api.get('/players', { params });
export const getPlayerById = (id: string) => api.get(`/players/${id}`);
export const createPlayer = (data: any) => api.post('/players', data);
export const updatePlayer = (id: string, data: any) => api.put(`/players/${id}`, data);
export const deletePlayer = (id: string) => api.delete(`/players/${id}`);

// Teams
export const getTeams = () => api.get('/teams');
export const getTeamById = (id: string) => api.get(`/teams/${id}`);
export const createTeam = (data: any) => api.post('/teams', data);
export const updateTeam = (id: string, data: any) => api.put(`/teams/${id}`, data);
export const deleteTeam = (id: string) => api.delete(`/teams/${id}`);

// Tournaments
export const getTournaments = () => api.get('/tournaments');
export const getTournamentById = (id: string) => api.get(`/tournaments/${id}`);
export const getPointsTable = (id: string) => api.get(`/tournaments/${id}/points-table`);
export const createTournament = (data: any) => api.post('/tournaments', data);
export const updateTournament = (id: string, data: any) => api.patch(`/tournaments/${id}`, data);
export const deleteTournament = (id: string) => api.delete(`/tournaments/${id}`);

// Matches
export const getMatches = (params?: any) => api.get('/matches', { params });
export const getMatchById = (id: string) => api.get(`/matches/${id}`);
export const updateMatchStatus = (id: string, data: any) => api.put(`/matches/${id}/status`, data);
export const updateToss = (id: string, data: any) => api.patch(`/matches/${id}/toss`, data);
export const updatePlayingXI = (id: string, data: any) => api.patch(`/matches/${id}/playing-xi`, data);

// Scoring
export const addBall = (data: any) => api.post('/scoring/ball', data);
export const getMatchBalls = (matchId: string) => api.get(`/scoring/match/${matchId}/balls`);

// Fan & Gamification
export const getUserCoins = () => api.get('/fan/coins');
export const getMatchPolls = (matchId: string) => api.get(`/fan/polls/${matchId}`);
export const getAllPolls = () => api.get('/fan/polls');
export const voteInPoll = (data: { pollId: string, optionIndex: number }) => api.post('/fan/vote', data);
export const createPoll = (data: any) => api.post('/fan/polls', data);
export const pickStarPlayer = (data: { matchId: string, playerId: string }) => api.post('/fan/star-player', data);
export const getStarPlayerPick = (matchId: string) => api.get(`/fan/star-player/${matchId}`);

// Auction
export const getAuctions = () => api.get('/auction');
export const createAuction = (data: any) => api.post('/auction', data);
export const placeBid = (data: { auctionId: string, bidderId: string, amount: number }) => api.post('/auction/bid', data);
export const finalizeSale = (id: string) => api.post(`/auction/${id}/finalize`);
export const exerciseRTM = (data: { auctionId: string, teamId: string }) => api.post('/auction/rtm', data);

// Admin
export const adminControlAuction = (data: any) => api.post('/admin/auction/control', data);
export const adminApproveTeamOwner = (data: any) => api.post('/admin/teams/approve-owner', data);
export const adminScheduleMatch = (data: any) => api.post('/admin/matches/schedule', data);
export const adminPublishTournament = (data: any) => api.post('/admin/tournaments/publish', data);

export default {
  getPlayers,
  getPlayerById,
  getTeams,
  getTeamById,
  getTournaments,
  getTournamentById,
  getPointsTable,
  getMatches,
  getMatchById,
  updateMatchStatus,
  updateToss,
  updatePlayingXI,
  addBall,
  getMatchBalls,
  getAuctions,
  createAuction,
  placeBid,
  finalizeSale,
  exerciseRTM,
  adminControlAuction,
  adminApproveTeamOwner,
  adminScheduleMatch,
  adminPublishTournament,
  createPlayer,
  updatePlayer,
  deletePlayer,
  createTeam,
  updateTeam,
  deleteTeam,
  createTournament,
  updateTournament,
  deleteTournament,
  getUserCoins,
  getMatchPolls,
  getAllPolls,
  voteInPoll,
  createPoll,
  pickStarPlayer,
  getStarPlayerPick
};
