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
      <main className="relative min-h-screen overflow-hidden bg-[#080e0b] text-[#f6f1e4]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_25%,_#214832_0%,_transparent_52%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5">
          <header className="flex items-center justify-between border-b border-[#bfa267]/20 py-6">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="text-3xl text-[#e1c484]">♠</span>
              <div><p className="brand-script text-3xl leading-none text-[#e2c786] sm:text-4xl">Whiskey Bent</p><p className="text-xs font-semibold tracking-[0.23em] text-[#b6c4b5]">SOCIAL POKER</p></div>
            </div>
            <span className="rounded-full border border-[#bfa267]/30 px-3 py-1 text-xs font-semibold tracking-widest text-[#d8c69c]">DEVELOPMENT PREVIEW</span>
          </header>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
            <section className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#d8b975]">Welcome to the room</p>
              <h1 className="brand-script mt-5 text-6xl leading-[1.25] sm:text-7xl lg:text-8xl">Where the<br/><span className="text-[#e0c181]">Cards</span> Fall</h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#bfcec0]">Your seat at the table is waiting. Explore the new Whiskey Bent poker experience as we build our social play rooms.</p>
              <div className="relative mt-10 flex h-52 max-w-lg items-center justify-center rounded-3xl border border-[#ad8b51]/30 bg-[radial-gradient(ellipse_at_center,_#286849_0%,_#16422e_55%,_#0e2219_75%)] shadow-[0_25px_75px_rgba(0,0,0,0.45)] sm:h-64">
                <div className="absolute inset-5 rounded-[50%] border-[12px] border-[#725333] shadow-[inset_0_0_0_3px_#e2c382,0_8px_25px_rgba(0,0,0,0.4)] sm:inset-7" />
                <div className="relative flex items-center gap-3 text-6xl font-black drop-shadow-xl sm:text-7xl"><span className="rotate-[-12deg] text-[#f8f1dd]">A<span className="block text-3xl text-[#b72731]">♥</span></span><span className="rotate-[12deg] text-[#f8f1dd]">K<span className="block text-3xl text-[#101c16]">♠</span></span></div>
              </div>
              <p className="mt-5 text-sm text-[#a9bba9]">♣ Texas Hold'em planned &nbsp; • &nbsp; ♦ Multiplayer testing coming soon</p>
            </section>

            <section aria-label="Account access" className="w-full max-w-lg justify-self-center rounded-3xl border border-[#bda064]/35 bg-[#121e17]/95 p-6 shadow-2xl sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d4b576]">Players club</p>
              <h2 className="brand-script mt-3 text-5xl leading-tight">{isSignupMode ? 'Join the table' : 'Welcome back'}</h2>
              <p className="mt-2 text-sm text-[#adbdad]">{isSignupMode ? 'Create your account to explore the preview.' : 'Sign in to your Whiskey Bent account.'}</p>
              <div className="mt-7 grid grid-cols-2 gap-2 rounded-xl bg-[#0b130e] p-1">
                <button type="button" onClick={() => { setIsSignupMode(false); setMessage(''); }} className={`rounded-lg px-4 py-3 text-sm font-bold transition ${!isSignupMode ? 'bg-[#c7a96c] text-[#10140f]' : 'text-[#b8c7b9] hover:bg-[#24352a]'}`}>Log in</button>
                <button type="button" onClick={() => { setIsSignupMode(true); setMessage(''); }} className={`rounded-lg px-4 py-3 text-sm font-bold transition ${isSignupMode ? 'bg-[#c7a96c] text-[#10140f]' : 'text-[#b8c7b9] hover:bg-[#24352a]'}`}>Sign up</button>
              </div>
              <form onSubmit={isSignupMode ? handleSignup : handleLogin} className="mt-6 space-y-4">
                {isSignupMode && <div><label htmlFor="signup-username" className="mb-2 block text-sm font-semibold text-[#e4e8df]">Username</label><input id="signup-username" type="text" autoComplete="username" placeholder="3–32 letters, numbers or underscores" minLength={3} maxLength={32} pattern="[A-Za-z0-9_]+" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border border-[#4d624e] bg-[#0b140f] px-4 py-3 text-white outline-none focus:border-[#d8b975]" /></div>}
                <div><label htmlFor="account-email" className="mb-2 block text-sm font-semibold text-[#e4e8df]">Email address</label><input id="account-email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[#4d624e] bg-[#0b140f] px-4 py-3 text-white outline-none focus:border-[#d8b975]" /></div>
                <div><label htmlFor="account-password" className="mb-2 block text-sm font-semibold text-[#e4e8df]">Password</label><input id="account-password" type="password" autoComplete={isSignupMode ? 'new-password' : 'current-password'} minLength={isSignupMode ? 12 : undefined} placeholder={isSignupMode ? 'At least 12 characters' : 'Your password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-[#4d624e] bg-[#0b140f] px-4 py-3 text-white outline-none focus:border-[#d8b975]" /></div>
                <button type="submit" className="w-full rounded-xl bg-[#d1b174] px-5 py-3.5 font-black text-[#101710] transition hover:bg-[#e5c68a]">{isSignupMode ? 'Create account  →' : 'Enter the room  →'}</button>
              </form>
              {message && <div role="status" className="mt-5 rounded-xl border border-[#c6a466]/40 bg-[#293524] p-3 text-sm text-[#f2e3c5]">{message}</div>}
              {isSignupMode && <p className="mt-5 text-center text-xs text-[#b3c3b4]">Account creation includes a 5 SC promotional signup bonus. Redemption and live gameplay are not available.</p>}
              <p className="mt-6 border-t border-[#52624e]/50 pt-5 text-center text-xs text-[#94a795]">18+ · Development preview · No live games or redemptions</p>
            </section>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090e0c] text-[#f5f1e7]">
      <div className="border-b border-[#b99a52]/20 bg-[#101713]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div>
            <div className="brand-script text-3xl leading-tight text-[#cbb277]">Whiskey Bent</div>
            <h1 className="mt-1 text-lg font-bold tracking-[0.17em] sm:text-xl">SOCIAL POKER <span className="text-[#cbb277]">♠</span></h1>
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
            <h2 className="brand-script mt-4 text-6xl leading-tight sm:text-7xl">Your Seat.<br/><span className="text-[#dfc07b]">Your Game.</span></h2>
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
