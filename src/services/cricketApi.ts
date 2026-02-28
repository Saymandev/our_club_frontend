import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Players
export const getPlayers = (params?: any) => api.get('/players', { params });
export const getPlayerById = (id: string) => api.get(`/players/${id}`);

// Teams
export const getTeams = () => api.get('/teams');
export const getTeamById = (id: string) => api.get(`/teams/${id}`);

// Tournaments
export const getTournaments = () => api.get('/tournaments');
export const getTournamentById = (id: string) => api.get(`/tournaments/${id}`);
export const getPointsTable = (id: string) => api.get(`/tournaments/${id}/points-table`);

// Matches
export const getMatches = (params?: any) => api.get('/matches', { params });
export const getMatchById = (id: string) => api.get(`/matches/${id}`);

// Scoring
export const addBall = (data: any) => api.post('/scoring/ball', data);
export const getMatchBalls = (matchId: string) => api.get(`/scoring/match/${matchId}/balls`);

// Auction
export const getAuctions = () => api.get('/auction');
export const placeBid = (data: { auctionId: string, bidderId: string, amount: number }) => api.post('/auction/bid', data);
export const finalizeSale = (id: string) => api.post(`/auction/${id}/finalize`);

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
  addBall,
  getMatchBalls,
  getAuctions,
  placeBid,
  finalizeSale,
  adminControlAuction,
  adminApproveTeamOwner,
  adminScheduleMatch,
  adminPublishTournament,
};
