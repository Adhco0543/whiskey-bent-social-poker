'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge } from '@whiskey-bent/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface GameListItem {
  id: string;
  variant: string;
  tableName: string;
  maxPlayers: number;
}

export default function GamesLobby() {
  const [token, setToken] = useState('');
  const [activeGames, setActiveGames] = useState<GameListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/');
      return;
    }
    setToken(storedToken);
    fetchGames(storedToken);
  }, [router]);

  const fetchGames = async (authToken: string) => {
    try {
      const response = await axios.get(`${API_URL}/games/list`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setActiveGames(response.data);
    } catch (err: any) {
      console.error('Error fetching games:', err);
    }
  };

  const handleCreateGame = async (variant: 'NLH' | '5CS') => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/games/create`,
        { variant },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setError('');
      router.push(`/games/${response.data.gameId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async (gameId: string) => {
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/games/${gameId}/join`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setError('');
      router.push(`/games/${gameId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎰 Poker Lobby</h1>
          <p className="text-gray-300">Choose a game to play or create a new one</p>
        </div>

        {error && (
          <Card className="bg-red-900 border-red-500 mb-6">
            <p className="text-red-100">{error}</p>
          </Card>
        )}

        {/* Create Game Section */}
        <Card className="bg-gray-900 border-green-500 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Create New Game</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleCreateGame('NLH')}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white py-3"
            >
              No-Limit Hold'em
            </Button>
            <Button
              onClick={() => handleCreateGame('5CS')}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              5 Card Stud
            </Button>
          </div>
        </Card>

        {/* Active Games Section */}
        <Card className="bg-gray-900 border-purple-500">
          <h2 className="text-2xl font-bold text-white mb-6">Active Games</h2>

          {activeGames.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No active games. Create one to get started!</p>
          ) : (
            <div className="space-y-4">
              {activeGames.map((game) => (
                <div key={game.id} className="p-4 rounded bg-gray-800 border border-gray-700 flex justify-between items-center">
                  <div>
                    <p className="text-white font-semibold">{game.tableName}</p>
                    <p className="text-gray-400 text-sm">
                      Variant: <Badge className="bg-purple-600">{game.variant}</Badge>
                    </p>
                  </div>
                  <Button
                    onClick={() => handleJoinGame(game.id)}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Join Game
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
