import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createDeck, shuffleDeck, Card } from './utils/deck';
import { PlayingCard } from './components/PlayingCard';
import { Trophy, RefreshCw, Bot, User, Sparkles, PencilLine } from 'lucide-react';

type GameState = 'start' | 'dealing' | 'playerTurn' | 'botTurn' | 'resolving' | 'gameOver';

const DEFAULT_PLAYER_NAME = 'Player One';
const botNames = ['Dealer Nova', 'Captain Shuffle', 'AceBot', 'The House'];

export default function App() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [botHand, setBotHand] = useState<Card[]>([]);
  const [playerPlayed, setPlayerPlayed] = useState<Card | null>(null);
  const [botPlayed, setBotPlayed] = useState<Card | null>(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [botScore, setBotScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('start');
  const [message, setMessage] = useState('Welcome to Card Battle!');
  const [playerName, setPlayerName] = useState(DEFAULT_PLAYER_NAME);
  const [playerNameInput, setPlayerNameInput] = useState(DEFAULT_PLAYER_NAME);
  const [botName, setBotName] = useState(botNames[0]);

  const dropZoneRef = useRef<HTMLDivElement>(null);

  const startGame = () => {
    const trimmedName = playerNameInput.trim() || DEFAULT_PLAYER_NAME;
    const newDeck = shuffleDeck(createDeck());

    setPlayerName(trimmedName);
    setPlayerNameInput(trimmedName);
    setBotName(botNames[Math.floor(Math.random() * botNames.length)]);
    setDeck(newDeck.slice(10));
    setPlayerHand(newDeck.slice(0, 5));
    setBotHand(newDeck.slice(5, 10));
    setPlayerScore(0);
    setBotScore(0);
    setPlayerPlayed(null);
    setBotPlayed(null);
    setGameState('playerTurn');
    setMessage(`${trimmedName}, you're up first. Drag a card to the arena.`);
  };

  const handleDragEnd = (_event: any, info: any, card: Card) => {
    if (gameState !== 'playerTurn') return;

    if (info.offset.y < -100) {
      playCard(card);
    }
  };

  const playCard = (card: Card) => {
    setPlayerHand((prev) => prev.filter((c) => c.id !== card.id));
    setPlayerPlayed(card);
    setGameState('botTurn');
    setMessage(`${botName} is choosing a card...`);
  };

  useEffect(() => {
    if (gameState === 'botTurn') {
      if (botHand.length === 0) {
        setGameState('resolving');
        return;
      }

      const timer = setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * botHand.length);
        const cardToPlay = botHand[randomIndex];
        setBotHand((prev) => prev.filter((c) => c.id !== cardToPlay.id));
        setBotPlayed(cardToPlay);
        setGameState('resolving');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameState, botHand]);

  useEffect(() => {
    if (gameState === 'resolving') {
      const timer = setTimeout(() => {
        if (playerPlayed && botPlayed) {
          if (playerPlayed.value > botPlayed.value) {
            setPlayerScore((prev) => prev + 1);
            setMessage(`${playerName} wins the round!`);
          } else if (botPlayed.value > playerPlayed.value) {
            setBotScore((prev) => prev + 1);
            setMessage(`${botName} takes the point.`);
          } else {
            setMessage('Perfect tie! No points awarded.');
          }
        }

        setTimeout(() => {
          setPlayerPlayed(null);
          setBotPlayed(null);

          setDeck((prevDeck) => {
            const newDeck = [...prevDeck];
            setPlayerHand((prevHand) => {
              if (newDeck.length > 0 && prevHand.length < 5) {
                return [...prevHand, newDeck.shift()!];
              }
              return prevHand;
            });
            setBotHand((prevHand) => {
              if (newDeck.length > 0 && prevHand.length < 5) {
                return [...prevHand, newDeck.shift()!];
              }
              return prevHand;
            });
            return newDeck;
          });

          setGameState('playerTurn');
        }, 1500);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState, playerPlayed, botPlayed, playerName, botName]);

  useEffect(() => {
    if (gameState === 'playerTurn') {
      if (playerHand.length === 0 && deck.length === 0) {
        setGameState('gameOver');
        if (playerScore > botScore) {
          setMessage(`Game Over! ${playerName} wins the match!`);
        } else if (botScore > playerScore) {
          setMessage(`Game Over! ${botName} wins the match!`);
        } else {
          setMessage(`Game Over! ${playerName} and ${botName} finish in a draw.`);
        }
      } else {
        setMessage(`${playerName}, drag a card to the center.`);
      }
    }
  }, [gameState, playerHand.length, deck.length, playerScore, botScore, playerName, botName]);

  const playerLead = playerScore - botScore;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.24),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_45%,#111827_100%)] text-slate-100 flex flex-col font-sans overflow-hidden">
      <header className="p-4 md:p-5 flex flex-col gap-4 md:flex-row md:justify-between md:items-center bg-slate-900/45 border-b border-white/10 backdrop-blur-xl z-10 shadow-[0_10px_40px_rgba(15,23,42,0.45)]">
        <div className="flex items-center gap-3 rounded-2xl border border-indigo-400/20 bg-slate-800/60 px-4 py-3 shadow-lg shadow-indigo-950/30">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 ring-1 ring-inset ring-indigo-400/30">
            <Bot size={24} />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-[0.25em]">Opponent</div>
            <div className="text-lg font-semibold text-white">{botName}</div>
          </div>
          <div className="ml-2 rounded-xl bg-slate-950/50 px-3 py-2 text-center min-w-16">
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Score</div>
            <div className="text-2xl font-bold font-mono text-indigo-300">{botScore}</div>
          </div>
        </div>

        <div className="text-center flex-1 px-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200 mb-3">
            <Sparkles size={14} />
            Arena Status
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-1">Card Battle</h1>
          <div className="text-sm md:text-base text-indigo-100/90 min-h-6 transition-all duration-300">
            {message}
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto rounded-2xl border border-emerald-400/20 bg-slate-800/60 px-4 py-3 shadow-lg shadow-emerald-950/20">
          <div className="mr-1 text-right">
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-[0.25em]">Player</div>
            <div className="text-lg font-semibold text-white">{playerName}</div>
          </div>
          <div className="rounded-xl bg-slate-950/50 px-3 py-2 text-center min-w-16">
            <div className="text-[10px] uppercase tracking-[0.25em] text-slate-500">Score</div>
            <div className="text-2xl font-bold font-mono text-emerald-300">{playerScore}</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
            <User size={24} />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 px-4 md:px-8 pt-4 md:pt-5 z-10">
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-1">Deck Status</div>
            <div className="text-sm text-slate-200">{deck.length} cards left to draw.</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-1">Momentum</div>
            <div className="text-sm text-slate-200">
              {playerLead > 0
                ? `${playerName} leads by ${playerLead}.`
                : playerLead < 0
                  ? `${botName} leads by ${Math.abs(playerLead)}.`
                  : 'The match is perfectly even.'}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm text-left md:text-right">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-1">Quick Tip</div>
            <div className="text-sm text-slate-200">High cards secure rounds, but every play reshapes your hand.</div>
          </div>
        </div>

        <div className="h-36 md:h-40 flex justify-center items-start pt-4 gap-[-2rem] perspective-1000">
          <AnimatePresence>
            {botHand.map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1, rotateX: 10 }}
                exit={{ y: 100, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="relative -ml-8 first:ml-0"
                style={{ zIndex: index }}
              >
                <PlayingCard card={card} isFacedown layoutId={`card-${card.id}`} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div
          ref={dropZoneRef}
          className="flex-1 flex items-center justify-center gap-8 relative z-0 px-4"
        >
          <div className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-75">
            <div className="relative w-20 h-30 md:w-24 md:h-36">
              {deck.length > 0 ? (
                <>
                  <div className="absolute inset-0 bg-indigo-900 rounded-xl border border-indigo-700 transform -rotate-6" />
                  <div className="absolute inset-0 bg-indigo-800 rounded-xl border border-indigo-600 transform -rotate-3" />
                  <div className="absolute inset-0 bg-indigo-600 rounded-xl border-2 border-indigo-400 flex items-center justify-center shadow-xl shadow-indigo-950/40">
                    <div className="text-indigo-100 font-bold text-2xl opacity-80">{deck.length}</div>
                  </div>
                </>
              ) : (
                <div className="absolute inset-0 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center">
                  <span className="text-slate-600 text-sm font-medium uppercase">Empty</span>
                </div>
              )}
            </div>
            <span className="mt-4 text-xs font-mono text-slate-500 uppercase tracking-widest">Deck</span>
          </div>

          <div className="flex gap-8 md:gap-12 items-center justify-center w-full max-w-2xl">
            <div className="relative w-32 h-48 flex flex-col items-center justify-center">
              <div className="absolute inset-0 border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-800/20" />
              <span className="absolute -top-8 text-sm font-medium text-slate-500 uppercase tracking-widest">{botName}</span>
              <AnimatePresence>
                {botPlayed && (
                  <motion.div
                    key={botPlayed.id}
                    initial={{ scale: 0.5, opacity: 0, y: -50 }}
                    animate={{ scale: 1.2, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, x: 200 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="absolute z-10"
                  >
                    <PlayingCard card={botPlayed} layoutId={`card-${botPlayed.id}`} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="text-3xl md:text-4xl font-black text-slate-600 italic">VS</div>

            <div className="relative w-32 h-48 flex flex-col items-center justify-center">
              <div className={`absolute inset-0 border-2 border-dashed rounded-2xl transition-colors duration-300 ${
                gameState === 'playerTurn' ? 'border-emerald-500/60 bg-emerald-500/10 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'border-slate-700/50 bg-slate-800/20'
              }`} />
              <span className="absolute -bottom-8 text-sm font-medium text-slate-500 uppercase tracking-widest">{playerName}</span>
              <AnimatePresence>
                {playerPlayed && (
                  <motion.div
                    key={playerPlayed.id}
                    initial={{ scale: 0.5, opacity: 0, y: 50 }}
                    animate={{ scale: 1.2, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, x: 200 }}
                    transition={{ type: 'spring', damping: 15 }}
                    className="absolute z-10"
                  >
                    <PlayingCard card={playerPlayed} layoutId={`card-${playerPlayed.id}`} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="h-48 flex justify-center items-end pb-8 gap-2 perspective-1000 z-20 px-4">
          <AnimatePresence>
            {playerHand.map((card, index) => {
              const offset = index - (playerHand.length - 1) / 2;
              const rotate = offset * 5;
              const y = Math.abs(offset) * 10;

              return (
                <motion.div
                  key={card.id}
                  initial={{ y: 100, opacity: 0 }}
                  animate={{ y, rotate, opacity: 1 }}
                  exit={{ y: -100, opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="relative -ml-4 first:ml-0 hover:z-50"
                  style={{ zIndex: index }}
                >
                  <PlayingCard
                    card={card}
                    isDraggable={gameState === 'playerTurn'}
                    onDragEnd={handleDragEnd}
                    layoutId={`card-${card.id}`}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {gameState === 'start' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 px-4"
            >
              <div className="bg-slate-900/95 p-8 rounded-[2rem] shadow-2xl border border-white/10 max-w-lg w-full text-center relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-r from-indigo-500/20 via-fuchsia-500/15 to-emerald-500/20 blur-2xl" />
                <div className="relative">
                  <div className="w-20 h-20 bg-indigo-500/20 text-indigo-300 rounded-full flex items-center justify-center mx-auto mb-6 ring-1 ring-inset ring-indigo-400/30">
                    <Trophy size={40} />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Choose your username</h2>
                  <p className="text-slate-400 mb-6">
                    Personalize the match before you deal. Your chosen name will appear on the scoreboard and round updates.
                  </p>
                  <label className="block text-left mb-5">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 mb-2 inline-flex items-center gap-2">
                      <PencilLine size={14} />
                      Username
                    </span>
                    <input
                      value={playerNameInput}
                      onChange={(event) => setPlayerNameInput(event.target.value.slice(0, 20))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          startGame();
                        }
                      }}
                      placeholder="Enter your name"
                      className="w-full rounded-2xl border border-white/10 bg-slate-800/80 px-4 py-3 text-lg text-white outline-none transition focus:border-indigo-400/60 focus:ring-4 focus:ring-indigo-500/10"
                    />
                  </label>
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {['Alex', 'Sky', 'Riley', 'Jordan'].map((name) => (
                      <button
                        key={name}
                        onClick={() => setPlayerNameInput(name)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-200 transition hover:border-indigo-400/40 hover:bg-indigo-500/10"
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={startGame}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-indigo-500/25"
                  >
                    Start Game
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === 'gameOver' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 px-4"
            >
              <div className="bg-slate-900/95 p-8 rounded-[2rem] shadow-2xl border border-white/10 max-w-md w-full text-center">
                <h2 className="text-4xl font-black text-white mb-2">
                  {playerScore > botScore ? 'Victory!' : playerScore < botScore ? 'Defeat!' : 'Draw!'}
                </h2>
                <p className="text-slate-400 mb-6">Thanks for playing, {playerName}. Ready for another match?</p>
                <div className="flex justify-center items-center gap-8 my-8">
                  <div className="text-center">
                    <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">{playerName}</div>
                    <div className="text-5xl font-mono font-bold text-emerald-400">{playerScore}</div>
                  </div>
                  <div className="text-3xl font-black text-slate-700 italic">VS</div>
                  <div className="text-center">
                    <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">{botName}</div>
                    <div className="text-5xl font-mono font-bold text-indigo-400">{botScore}</div>
                  </div>
                </div>
                <button
                  onClick={startGame}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-colors shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
                >
                  <RefreshCw size={20} />
                  Play Again
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
