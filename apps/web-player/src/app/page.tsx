'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Button, Card, Badge } from '@whiskey-bent/ui';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Home() {
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [bonusHistory, setBonusHistory] = useState<any[]>([]);
  const [message, setMessage] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email,
        username,
        password,
      });
      setToken(response.data.token);
      setUser(response.data.user);
      setMessage('Signup successful! You received 5 Sweep Coins bonus! 🎉');
      fetchWallet(response.data.token);
      fetchBonusHistory(response.data.token);
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      setToken(response.data.token);
      setUser(response.data.user);
      setMessage('Login successful!');
      fetchWallet(response.data.token);
      fetchBonusHistory(response.data.token);
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  const fetchWallet = async (authToken: string) => {
    try {
      const response = await axios.get(`${API_URL}/users/wallet`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setWallet(response.data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const fetchBonusHistory = async (authToken: string) => {
    try {
      const response = await axios.get(`${API_URL}/bonus/history`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setBonusHistory(response.data);
    } catch (error) {
      console.error('Error fetching bonus history:', error);
    }
  };

  const handleClaimDailyBonus = async () => {
    try {
      const response = await axios.post(`${API_URL}/bonus/daily-login`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Daily bonus claimed! You received 5 Sweep Coins! 🎁');
      fetchWallet(token);
      fetchBonusHistory(token);
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-4">
        <div className="max-w-md mx-auto mt-20">
          <Card className="bg-gray-900 border-purple-500 shadow-2xl">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold text-white mb-2">🎰 Whiskey Bent</h1>
              <p className="text-gray-300">Social Poker Platform</p>
            </div>

            <div className="flex gap-2 mb-6">
              <Button
                onClick={() => setIsSignupMode(false)}
                className={`flex-1 ${!isSignupMode ? 'bg-purple-600' : 'bg-gray-700'}`}
              >
                Login
              </Button>
              <Button
                onClick={() => setIsSignupMode(true)}
                className={`flex-1 ${isSignupMode ? 'bg-purple-600' : 'bg-gray-700'}`}
              >
                Sign Up
              </Button>
            </div>

            <form onSubmit={isSignupMode ? handleSignup : handleLogin} className="space-y-4">
              {isSignupMode && (
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-purple-500"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-purple-500"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-purple-500"
              />
              <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                {isSignupMode ? 'Sign Up' : 'Login'}
              </Button>
            </form>

            {message && (
              <div className="mt-4 p-3 rounded bg-blue-900 text-blue-100 text-sm">
                {message}
              </div>
            )}

            {isSignupMode && (
              <div className="mt-4 p-3 rounded bg-green-900 text-green-100 text-sm">
                <p className="font-bold">Sign Up Bonus:</p>
                <p>Get 5 Sweep Coins when you create your account! 🎁</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">🎰 Whiskey Bent Poker</h1>
          <Button
            onClick={() => {
              setToken('');
              setUser(null);
              setWallet(null);
              setBonusHistory([]);
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            Logout
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-8">
          <Button onClick={() => window.location.href = '/'} className="bg-purple-600 hover:bg-purple-700">
            Dashboard
          </Button>
          <Button onClick={() => window.location.href = '/games'} className="bg-green-600 hover:bg-green-700">
            Play Poker
          </Button>
        </div>

        {/* User Info */}
        <Card className="bg-gray-900 border-purple-500 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Welcome, {user?.username}!</h2>
          <p className="text-gray-300">{user?.email}</p>
        </Card>

        {/* Wallet */}
        {wallet && (
          <Card className="bg-gray-900 border-blue-500 mb-6">
            <h2 className="text-2xl font-bold text-white mb-4">💰 Your Wallet</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded bg-gray-800">
                <p className="text-gray-400 text-sm">Gold Coins (Entertainment)</p>
                <p className="text-3xl font-bold text-yellow-400">{wallet.goldCoins}</p>
              </div>
              <div className="p-4 rounded bg-gray-800">
                <p className="text-gray-400 text-sm">Sweep Coins (Promotional)</p>
                <p className="text-3xl font-bold text-purple-400">{wallet.sweepCoins}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Daily Bonus */}
        <Card className="bg-gray-900 border-green-500 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">🎁 Daily Bonus</h2>
          <p className="text-gray-300 mb-4">Claim your daily bonus of 5 Sweep Coins!</p>
          <Button
            onClick={handleClaimDailyBonus}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Claim Daily Bonus
          </Button>
        </Card>

        {/* Bonus History */}
        {bonusHistory.length > 0 && (
          <Card className="bg-gray-900 border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">📊 Bonus History</h2>
            <div className="space-y-2">
              {bonusHistory.map((bonus: any) => (
                <div key={bonus.id} className="flex justify-between items-center p-3 rounded bg-gray-800">
                  <div>
                    <p className="text-white font-semibold capitalize">{bonus.type.replace('_', ' ')}</p>
                    <p className="text-gray-400 text-sm">
                      {new Date(bonus.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={bonus.currency === 'SC' ? 'success' : 'primary'}>
                    +{bonus.amount} {bonus.currency}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
