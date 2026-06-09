'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Card, Button } from '@whiskey-bent/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface GameSnapshot {
  id: string;
  variant: string;
  players: Array<{ userId: string; hole: Array<{ suit: string; rank: string }>; bet: number; folded: boolean }>;
  communityCards: Array<{ suit: string; rank: string }>;
  currentBet: number;
  pot: number;
  round: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function GameTable() {
  const params = useParams();
  const gameId = params.gameId as string;
  const router = useRouter();

  const [token, setToken] = useState('');
  const [gameState, setGameState] = useState<GameSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [betAmount, setBetAmount] = useState('10');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/');
      return;
    }
    setToken(storedToken);
    fetchGameState(storedToken);
  }, [router]);

  const fetchGameState = async (authToken: string) => {
    try {
      const response = await axios.get(`${API_URL}/games/${gameId}/state`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setGameState(response.data);
    } catch (err: any) {
      setError('Failed to fetch game state');
      console.error(err);
    }
  };

  const handleStartGame = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/games/${gameId}/start`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setGameState(response.data.gameState);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start game');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerAction = async (action: 'bet' | 'fold' | 'check') => {
    setLoading(true);
    try {
      const payload: any = { action };
      if (action === 'bet') {
        payload.amount = parseInt(betAmount);
      }

      const response = await axios.post(
        `${API_URL}/games/${gameId}/action`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setGameState(response.data.gameState);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to perform action');
    } finally {
      setLoading(false);
    }
  };

  const handleEndGame = async () => {
    try {
      await axios.post(
        `${API_URL}/games/${gameId}/end`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      router.push('/games');
    } catch (err: any) {
      setError('Failed to end game');
    }
  };

  if (!token || !gameState) {
    return <div className="p-8 text-center text-white">Loading game...</div>;
  }

  const roundNames = ['Pre-Flop', 'Flop', 'Turn', 'River'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">🎰 Poker Table</h1>
            <p className="text-gray-300">
              Variant: <span className="font-bold">{gameState.variant}</span> | Round:{' '}
              <span className="font-bold">{roundNames[gameState.round] || 'Ended'}</span>
            </p>
          </div>
          <Button onClick={() => router.push('/games')} className="bg-gray-700 hover:bg-gray-600">
            Back to Lobby
          </Button>
        </div>

        {error && (
          <Card className="bg-red-900 border-red-500 mb-6">
            <p className="text-red-100">{error}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Table */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-purple-500 p-8">
              <div className="relative bg-green-900 rounded-lg p-6 min-h-96 flex flex-col justify-center items-center">
                {/* Pot */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className="text-center">
                    <p className="text-gray-300 text-sm">Pot</p>
                    <p className="text-3xl font-bold text-yellow-400">${gameState.pot}</p>
                  </div>
                </div>

                {/* Community Cards */}
                {gameState.communityCards.length > 0 && (
                  <div className="mb-8">
                    <p className="text-gray-300 text-sm mb-3">Community Cards</p>
                    <div className="flex gap-2 justify-center">
                      {gameState.communityCards.map((card, idx) => (
                        <div key={idx} className="bg-white rounded p-3 w-16 h-24 flex flex-col justify-center items-center">
                          <p className="font-bold text-lg">{card.rank}</p>
                          <p className="text-2xl">{card.suit}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Players */}
                <div className="mt-8">
                  <p className="text-gray-300 text-sm mb-4">Players in Game: {gameState.players.length}</p>
                  <div className="flex gap-4 justify-center">
                    {gameState.players.map((player, idx) => (
                      <div key={idx} className={`p-4 rounded ${player.folded ? 'bg-gray-700' : 'bg-purple-700'} text-white text-center`}>
                        <p className="font-semibold text-sm">Player {idx + 1}</p>
                        <p className="text-xs text-gray-300">Bet: ${player.bet}</p>
                        {player.hole.length > 0 && (
                          <div className="mt-2 flex gap-1">
                            {player.hole.map((card, cidx) => (
                              <span key={cidx} className="text-xs bg-black px-2 py-1 rounded">
                                {card.rank}{card.suit[0]}
                              </span>
                            ))}
                          </div>
                        )}
                        {player.folded && <p className="text-xs text-red-300 mt-2">FOLDED</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions Panel */}
          <div>
            <Card className="bg-gray-900 border-blue-500">
              <h2 className="text-xl font-bold text-white mb-6">Game Status</h2>

              <div className="space-y-4 mb-6">
                <div className="p-3 rounded bg-gray-800">
                  <p className="text-gray-400 text-sm">Current Bet</p>
                  <p className="text-2xl font-bold text-white">${gameState.currentBet}</p>
                </div>
                <div className="p-3 rounded bg-gray-800">
                  <p className="text-gray-400 text-sm">Total Pot</p>
                  <p className="text-2xl font-bold text-yellow-400">${gameState.pot}</p>
                </div>
              </div>

              {gameState.isActive ? (
                <>
                  {gameState.players.length === 1 ? (
                    <Button
                      onClick={handleStartGame}
                      disabled={loading}
                      className="w-full bg-green-600 hover:bg-green-700 mb-3"
                    >
                      Start Game
                    </Button>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="block text-gray-300 text-sm mb-2">Bet Amount</label>
                        <input
                          type="number"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500"
                          min="1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Button
                          onClick={() => handlePlayerAction('bet')}
                          disabled={loading}
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          Bet ${betAmount}
                        </Button>
                        <Button
                          onClick={() => handlePlayerAction('check')}
                          disabled={loading}
                          className="w-full bg-gray-700 hover:bg-gray-600"
                        >
                          Check
                        </Button>
                        <Button
                          onClick={() => handlePlayerAction('fold')}
                          disabled={loading}
                          className="w-full bg-red-600 hover:bg-red-700"
                        >
                          Fold
                        </Button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <Button onClick={handleEndGame} className="w-full bg-red-600 hover:bg-red-700">
                  End Game
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
