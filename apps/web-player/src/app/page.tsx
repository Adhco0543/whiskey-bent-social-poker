'use client';

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@whiskey-bent/ui';
import BrandLogo from './components/BrandLogo';

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
  const [rewardStatus, setRewardStatus] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'lobby' | 'wallet' | 'rewards'>('lobby');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [rewardLoading, setRewardLoading] = useState(true);
  const [rewardError, setRewardError] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
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
      fetchRewardStatus(response.data.token);
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
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
      fetchRewardStatus(response.data.token);
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
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

  const fetchRewardStatus = async (authToken: string) => {
    setRewardLoading(true);
    setRewardError(false);
    try {
      const response = await axios.get(`${API_URL}/bonus/can-claim`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setRewardStatus(response.data);
    } catch (error) {
      setRewardError(true);
      setRewardStatus(null);
    } finally {
      setRewardLoading(false);
    }
  };

  const handleClaimDailyBonus = async () => {
    if (isClaiming || !rewardStatus?.canClaim) return;
    setIsClaiming(true);
    try {
      const response = await axios.post(`${API_URL}/bonus/daily-login`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(`Day ${response.data.day} claimed! You received ${Number(response.data.amount).toFixed(2)} promotional Sweep Coins! 🎁`);
      fetchWallet(token);
      fetchBonusHistory(token);
      fetchRewardStatus(token);
    } catch (error: any) {
      setMessage(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsClaiming(false);
    }
  };

  if (!token) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#160b08] text-[#f6f1e4]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_25%,_#643018_0%,_transparent_52%)]" />
        <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5">
          <header className="relative -mx-5 overflow-hidden border-b border-[#bfa267]/30 bg-[#120906]">
            <img
              src="https://raw.githubusercontent.com/Adhco0543/whiskey-bent-social-poker/main/a_dramatic_cinematic_ultra_detailed_photorealis.png"
              alt="Whiskey Bent original approved Western casino artwork with gold lettering, bourbon bottle, cowboy hat, aces and poker chips"
              className="block h-auto w-full"
            />
          </header>

          <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-20">
            <section className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#d8b975]">Welcome to the room</p>
              <h1 className="brand-script mt-5 text-6xl leading-[1.25] sm:text-7xl lg:text-8xl">Where the<br/><span className="text-[#e0c181]">Cards</span> Fall</h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#bfcec0]">Your next favorite game is taking shape. Explore Whiskey Bent as we build social poker, casino-style games, and more.</p>
              <p className="mt-5 text-sm text-[#a9bba9]">♣ Poker planned &nbsp; • &nbsp; ♦ Casino-style games coming soon</p>
            </section>

            <section aria-label="Account access" className="w-full max-w-lg justify-self-center rounded-3xl border border-[#bda064]/35 bg-[#26160f]/95 p-6 shadow-2xl sm:p-9">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d4b576]">Players club</p>
              <h2 className="brand-script mt-3 text-5xl leading-tight">{isSignupMode ? 'Join the table' : 'Welcome back'}</h2>
              <p className="mt-2 text-sm text-[#adbdad]">{isSignupMode ? 'Create your account to explore the preview.' : 'Sign in to your Whiskey Bent account.'}</p>
              <div className="mt-7 grid grid-cols-2 gap-2 rounded-xl bg-[#170d09] p-1">
                <button type="button" onClick={() => { setIsSignupMode(false); setMessage(''); }} className={`rounded-lg px-4 py-3 text-sm font-bold transition ${!isSignupMode ? 'bg-[#d2a45c] text-[#10140f]' : 'text-[#b8c7b9] hover:bg-[#24352a]'}`}>Log in</button>
                <button type="button" onClick={() => { setIsSignupMode(true); setMessage(''); }} className={`rounded-lg px-4 py-3 text-sm font-bold transition ${isSignupMode ? 'bg-[#d2a45c] text-[#10140f]' : 'text-[#b8c7b9] hover:bg-[#24352a]'}`}>Sign up</button>
              </div>
              <form onSubmit={isSignupMode ? handleSignup : handleLogin} className="mt-6 space-y-4">
                {isSignupMode && <div><label htmlFor="signup-username" className="mb-2 block text-sm font-semibold text-[#e4e8df]">Username</label><input id="signup-username" type="text" autoComplete="username" placeholder="3–32 letters, numbers or underscores" minLength={3} maxLength={32} pattern="[A-Za-z0-9_]+" required value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-xl border border-[#4d624e] bg-[#170e0a] px-4 py-3 text-white outline-none focus:border-[#d8b975]" /></div>}
                <div><label htmlFor="account-email" className="mb-2 block text-sm font-semibold text-[#e4e8df]">Email address</label><input id="account-email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-[#4d624e] bg-[#170e0a] px-4 py-3 text-white outline-none focus:border-[#d8b975]" /></div>
                <div><label htmlFor="account-password" className="mb-2 block text-sm font-semibold text-[#e4e8df]">Password</label><input id="account-password" type="password" autoComplete={isSignupMode ? 'new-password' : 'current-password'} minLength={isSignupMode ? 12 : undefined} placeholder={isSignupMode ? 'At least 12 characters' : 'Your password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-[#4d624e] bg-[#170e0a] px-4 py-3 text-white outline-none focus:border-[#d8b975]" /></div>
                <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-[#d1b174] px-5 py-3.5 font-black text-[#101710] transition hover:bg-[#e5c68a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0ca81] disabled:cursor-wait disabled:opacity-65">{isSubmitting ? 'Please wait…' : isSignupMode ? 'Create account  →' : 'Enter the room  →'}</button>
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
    <main className="min-h-screen bg-[#160b08] text-[#f5f1e7]">
      <div className="border-b border-[#c99b52]/20 bg-[#20110c]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="shrink-0">
            <BrandLogo className="h-auto w-[200px] drop-shadow-[0_3px_14px_rgba(192,139,59,0.2)] sm:w-[256px]" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><div className="text-sm font-semibold">{user?.username}</div><div className="text-xs text-[#9aa89d]">Founder's preview</div></div>
            <Button onClick={() => { setToken(''); setUser(null); setWallet(null); setBonusHistory([]); setRewardStatus(null); }} className="bg-[#27382e] hover:bg-[#354b3c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#d2b776]">Log out</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-8">
        <section className="relative overflow-hidden rounded-3xl border border-[#c99b52]/30 bg-gradient-to-br from-[#663a1e] via-[#3d2115] to-[#1b0e0a] p-7 shadow-2xl sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border-[28px] border-[#d7b56c]/10" />
          <div className="relative max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#e0c587]">The table is being set</p>
            <h2 className="brand-script mt-4 text-6xl leading-tight sm:text-7xl">Your Seat.<br/><span className="text-[#dfc07b]">Your Game.</span></h2>
            <p className="mt-4 max-w-lg text-[#d2ddd2]">A new social gaming destination is taking shape. Explore our poker lobby preview while we prepare more games for testing.</p>
            <div className="mt-6 inline-flex rounded-full border border-[#d9b977]/40 bg-black/25 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#e9d49e]">♣ Preview mode · No live tables yet</div>
          </div>
        </section>

        <nav aria-label="Dashboard sections" className="mt-7 flex flex-wrap gap-2">
          {([['lobby', '♠ Poker Lobby'], ['wallet', '◈ My Wallet'], ['rewards', '★ Rewards']] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setActiveTab(id)} aria-current={activeTab === id ? 'page' : undefined} className={`rounded-xl px-5 py-3 text-sm font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e5c47a] ${activeTab === id ? 'bg-[#c9aa6c] text-[#10140f]' : 'border border-[#455548] bg-[#2c1c14] text-[#e2e9de] hover:bg-[#25372a]'}`}>{label}</button>
          ))}
        </nav>

        {message && <div role="status" className="mt-5 rounded-xl border border-[#c99b52]/40 bg-[#263024] p-4 text-sm text-[#f1e4c7]">{message}</div>}

        {activeTab === 'lobby' && (
          <section className="mt-8">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[#c7aa6d]">Coming soon</p><h3 className="mt-1 text-2xl font-bold">Poker lobby preview</h3></div><span className="rounded-full bg-[#25372a] px-3 py-2 text-xs text-[#c8d8cb]">Play-money testing planned</span></div>
            <div className="grid gap-5 md:grid-cols-2">
              {[
                { title: 'The Whiskey Room', mode: 'Texas Hold’em', seats: '6 seats', blinds: 'Play-money table', symbol: '♠' },
                { title: 'The High Roller', mode: 'Texas Hold’em', seats: '9 seats', blinds: 'Play-money table', symbol: '♦' },
              ].map((table) => (
                <div key={table.title} className="overflow-hidden rounded-2xl border border-[#405546] bg-[#2b1b13]">
                  <div className="flex h-40 items-center justify-center bg-[radial-gradient(ellipse_at_center,_#80502a_0%,_#4d2c1a_55%,_#28160e_75%)] p-6">
                    <div className="flex h-28 w-64 items-center justify-center rounded-[50%] border-[9px] border-[#674a2c] bg-[#5b371d] shadow-[0_12px_35px_rgba(0,0,0,0.5),inset_0_0_0_3px_#d5b77b]"><span className="text-5xl text-[#e1c88d]">{table.symbol}</span></div>
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
              <div className="rounded-2xl border border-[#c99b52]/30 bg-[#2b1a12] p-7"><p className="text-sm text-[#b5c2b6]">Gold Coins · Entertainment</p><p className="mt-3 text-5xl font-black text-[#e5c47a]">{wallet?.goldCoins ?? '...'}</p></div>
              <div className="rounded-2xl border border-[#c99b52]/30 bg-[#2b1a12] p-7"><p className="text-sm text-[#b5c2b6]">Sweep Coins · Promotional</p><p className="mt-3 text-5xl font-black text-[#e5c47a]">{wallet?.sweepCoins ?? '...'}</p></div>
            </div>
            <p className="mt-4 text-sm text-[#a7b6a9]">Balances are shown for account testing only. Gameplay and redemption are not enabled.</p>
          </section>
        )}

        {activeTab === 'rewards' && (
          <section className="mt-8 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-[#c99b52]/30 bg-[#291a11] p-6"><p className="text-xs font-bold uppercase tracking-widest text-[#d2b776]">Daily reward</p><h3 className="mt-3 text-2xl font-bold">Your daily bonus</h3><p className="mt-2 text-sm text-[#aebdaf]">30-day rewards: 0.10 SC on Day 1, increasing by 0.05 SC each day and each new week. Day 30 awards 5.00 SC, then the cycle restarts. Miss a UTC calendar day and your streak resets.</p><div aria-live="polite" className="mt-5">
              {rewardLoading ? (
                <p className="text-sm text-[#e7c886]">Loading reward progress…</p>
              ) : rewardError ? (
                <div className="rounded-xl border border-[#a47955] bg-[#40261a] p-3">
                  <p className="text-sm text-[#f1d8bc]">Reward status is temporarily unavailable.</p>
                  <button type="button" className="mt-2 text-sm font-bold text-[#f2ce83] underline underline-offset-4 focus-visible:outline focus-visible:outline-2" onClick={() => fetchRewardStatus(token)}>Retry loading</button>
                </div>
              ) : rewardStatus ? (
                <>
                  <div className="flex items-center justify-between gap-2 text-sm font-semibold text-[#e7c886]">
                    <span>{rewardStatus.canClaim ? `Day ${rewardStatus.day} of 30` : 'Reward claimed today'}</span>
                    <span>{Number(rewardStatus.nextReward).toFixed(2)} SC {rewardStatus.canClaim ? 'available' : 'next'}</span>
                  </div>
                  <div role="progressbar" aria-label="30-day reward cycle" aria-valuemin={0} aria-valuemax={30} aria-valuenow={rewardStatus.day} className="mt-3 h-2.5 overflow-hidden rounded-full bg-[#4d3424]">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#ae7c34] to-[#ebc47b] transition-[width]" style={{ width: `${Math.min(100, Math.max(0, Number(rewardStatus.day) / 30 * 100))}%` }} />
                  </div>
                </>
              ) : null}
            </div>
            <Button onClick={handleClaimDailyBonus} disabled={rewardLoading || rewardError || !rewardStatus?.canClaim || isClaiming} className="mt-6 w-full bg-[#c99b52] text-[#10140f] hover:bg-[#d2b776] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#f0cf8e]">{isClaiming ? 'Claiming reward…' : rewardLoading ? 'Loading reward…' : rewardError ? 'Unavailable' : rewardStatus?.canClaim ? 'Claim daily reward' : 'Already claimed today'}</Button></div>
            <div className="rounded-2xl border border-[#405546] bg-[#291a11] p-6"><h3 className="text-xl font-bold">Bonus history</h3><div className="mt-4 space-y-3">{bonusHistory.length === 0 ? <p className="text-sm text-[#aebdaf]">No bonus history yet.</p> : bonusHistory.map((bonus: any) => <div key={bonus.id} className="flex justify-between gap-3 border-b border-[#3a4b3d] pb-3 text-sm"><span className="capitalize">{String(bonus.type).replace('_', ' ')}</span><span className="font-bold text-[#dfc07b]">+{bonus.amount} {bonus.currency}</span></div>)}</div></div>
          </section>
        )}
        <footer className="mt-14 border-t border-[#3c4c3e] py-6 text-center text-xs text-[#879b8a]">WHISKEY BENT SOCIAL CASINO · DEVELOPMENT PREVIEW · 18+</footer>
      </div>
    </main>
  );
}
