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
  const [activeTab, setActiveTab] = useState<'lobby' | 'wallet' | 'rewards'>('lobby');

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
                  placeholder="Username (3-32 letters, numbers, underscores)"
                  minLength={3}
                  maxLength={32}
                  pattern="[A-Za-z0-9_]+"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-purple-500"
                />
              )}
              <input
                type="email"
                placeholder="Email"
                required
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
    <main className="min-h-screen bg-[#090e0c] text-[#f5f1e7]">
      <div className="border-b border-[#b99a52]/20 bg-[#101713]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.35em] text-[#cbb277]">WHISKEY BENT</div>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">SOCIAL POKER <span className="text-[#cbb277]">♠</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><div className="text-sm font-semibold">{user?.username}</div><div className="text-xs text-[#9aa89d]">Founder's preview</div></div>
            <Button onClick={() => { setToken(''); setUser(null); setWallet(null); setBonusHistory([]); }} className="bg-[#27382e] hover:bg-[#354b3c]">Log out</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <section className="relative overflow-hidden rounded-3xl border border-[#b99a52]/30 bg-gradient-to-br from-[#214a35] via-[#122b20] to-[#0d1713] p-7 shadow-2xl sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border-[28px] border-[#d7b56c]/10" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#e0c587]">The table is being set</p>
            <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">YOUR SEAT.<br/><span className="text-[#dfc07b]">YOUR GAME.</span></h2>
            <p className="mt-4 max-w-lg text-[#d2ddd2]">A new social poker room is taking shape. Explore the lobby preview while we prepare multiplayer tables for testing.</p>
            <div className="mt-6 inline-flex rounded-full border border-[#d9b977]/40 bg-black/25 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#e9d49e]">♣ Preview mode · No live tables yet</div>
          </div>
        </section>

        <nav aria-label="Dashboard sections" className="mt-7 flex flex-wrap gap-2">
          {([['lobby', '♠ Poker Lobby'], ['wallet', '◈ My Wallet'], ['rewards', '★ Rewards']] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)} className={`rounded-xl px-5 py-3 text-sm font-bold transition ${activeTab === id ? 'bg-[#c9aa6c] text-[#10140f]' : 'border border-[#455548] bg-[#18221b] text-[#e2e9de] hover:bg-[#25372a]'}`}>{label}</button>
          ))}
        </nav>

        {message && <div role="status" className="mt-5 rounded-xl border border-[#b99a52]/40 bg-[#263024] p-4 text-sm text-[#f1e4c7]">{message}</div>}

        {activeTab === 'lobby' && (
          <section className="mt-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[#c7aa6d]">Coming soon</p><h3 className="mt-1 text-2xl font-bold">Poker room lobby</h3></div><span className="rounded-full bg-[#25372a] px-3 py-2 text-xs text-[#c8d8cb]">Play-money testing planned</span></div>
            <div className="grid gap-5 md:grid-cols-2">
              {[
                { title: 'The Whiskey Room', mode: 'Texas Hold’em', seats: '6 seats', blinds: 'Play-money table', symbol: '♠' },
                { title: 'The High Roller', mode: 'Texas Hold’em', seats: '9 seats', blinds: 'Play-money table', symbol: '♦' },
              ].map((table) => (
                <div key={table.title} className="overflow-hidden rounded-2xl border border-[#405546] bg-[#151f18]">
                  <div className="flex h-40 items-center justify-center bg-[radial-gradient(ellipse_at_center,_#276947_0%,_#17422d_55%,_#102219_75%)] p-6">
                    <div className="flex h-28 w-64 items-center justify-center rounded-[50%] border-[9px] border-[#674a2c] bg-[#165638] shadow-[0_12px_35px_rgba(0,0,0,0.5),inset_0_0_0_3px_#d5b77b]"><span className="text-5xl text-[#e1c88d]">{table.symbol}</span></div>
                  </div>
                  <div className="p-5"><h4 className="text-xl font-bold">{table.title}</h4><p className="mt-1 text-sm text-[#9fb3a3]">{table.mode} · {table.seats} · {table.blinds}</p><button disabled className="mt-5 w-full cursor-not-allowed rounded-xl border border-[#9d8558]/40 bg-[#514832]/50 px-4 py-3 font-semibold text-[#c4b89c]">Table not available yet</button></div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-[#a7b6a9]">These are design previews, not active poker games. No bets, buy-ins, or redemptions are enabled.</p>
          </section>
        )}

        {activeTab === 'wallet' && (
          <section className="mt-8"><h3 className="mb-5 text-2xl font-bold">My wallet</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="rounded-2xl border border-[#b99a52]/30 bg-[#1c251d] p-7"><p className="text-sm text-[#b5c2b6]">Gold Coins · Entertainment</p><p className="mt-3 text-5xl font-black text-[#e5c47a]">{wallet?.goldCoins ?? '...'}</p></div>
              <div className="rounded-2xl border border-[#b99a52]/30 bg-[#1c251d] p-7"><p className="text-sm text-[#b5c2b6]">Sweep Coins · Promotional</p><p className="mt-3 text-5xl font-black text-[#e5c47a]">{wallet?.sweepCoins ?? '...'}</p></div>
            </div>
            <p className="mt-4 text-sm text-[#a7b6a9]">Balances are shown for account testing only. Gameplay and redemption are not enabled.</p>
          </section>
        )}

        {activeTab === 'rewards' && (
          <section className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-[#b99a52]/30 bg-[#17231b] p-6"><p className="text-xs font-bold uppercase tracking-widest text-[#d2b776]">Daily reward</p><h3 className="mt-3 text-2xl font-bold">Your daily bonus</h3><p className="mt-2 text-sm text-[#aebdaf]">Claim the promotional daily login bonus available to your account.</p><Button onClick={handleClaimDailyBonus} className="mt-6 w-full bg-[#b99a52] text-[#10140f] hover:bg-[#d2b776]">Claim daily bonus</Button></div>
            <div className="rounded-2xl border border-[#405546] bg-[#17231b] p-6"><h3 className="text-xl font-bold">Bonus history</h3><div className="mt-4 space-y-3">{bonusHistory.length === 0 ? <p className="text-sm text-[#aebdaf]">No bonus history yet.</p> : bonusHistory.map((bonus: any) => <div key={bonus.id} className="flex justify-between gap-3 border-b border-[#3a4b3d] pb-3 text-sm"><span className="capitalize">{String(bonus.type).replace('_', ' ')}</span><span className="font-bold text-[#dfc07b]">+{bonus.amount} {bonus.currency}</span></div>)}</div></div>
          </section>
        )}
        <footer className="mt-14 border-t border-[#3c4c3e] py-6 text-center text-xs text-[#879b8a]">WHISKEY BENT SOCIAL POKER · DEVELOPMENT PREVIEW · 18+</footer>
      </div>
    </main>
  );
}
