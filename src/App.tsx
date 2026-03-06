import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { createDeck, shuffleDeck, Card } from './utils/deck';
import { PlayingCard } from './components/PlayingCard';
import { Trophy, RefreshCw, Bot, User } from 'lucide-react';

type GameState = 'start' | 'dealing' | 'playerTurn' | 'botTurn' | 'resolving' | 'gameOver';

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

  const dropZoneRef = useRef<HTMLDivElement>(null);

  const startGame = () => {
    const newDeck = shuffleDeck(createDeck());
    setDeck(newDeck.slice(10));
    setPlayerHand(newDeck.slice(0, 5));
    setBotHand(newDeck.slice(5, 10));
    setPlayerScore(0);
    setBotScore(0);
    setPlayerPlayed(null);
    setBotPlayed(null);
    setGameState('playerTurn');
    setMessage('Your turn! Drag a card to the center.');
  };

  const handleDragEnd = (event: any, info: any, card: Card) => {
    if (gameState !== 'playerTurn') return;

    // Simple check: if dragged up enough
    if (info.offset.y < -100) {
      playCard(card);
    }
  };

  const playCard = (card: Card) => {
    setPlayerHand((prev) => prev.filter((c) => c.id !== card.id));
    setPlayerPlayed(card);
    setGameState('botTurn');
    setMessage('Bot is thinking...');
  };

  useEffect(() => {
    if (gameState === 'botTurn') {
      const timer = setTimeout(() => {
        // Bot plays a random card
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
            setMessage('You win this round!');
          } else if (botPlayed.value > playerPlayed.value) {
            setBotScore((prev) => prev + 1);
            setMessage('Bot wins this round!');
          } else {
            setMessage("It's a tie!");
          }
        }

        setTimeout(() => {
          setPlayerPlayed(null);
          setBotPlayed(null);

          // Draw new cards
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

          setGameState((prev) => {
            // Check if game is over (no cards in hand)
            // Need to use a timeout to check the updated state, or just check current lengths
            return 'playerTurn'; // We'll check game over in another effect
          });
        }, 1500);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState, playerPlayed, botPlayed]);

  useEffect(() => {
    if (gameState === 'playerTurn') {
      if (playerHand.length === 0 && deck.length === 0) {
        setGameState('gameOver');
        if (playerScore > botScore) {
          setMessage('Game Over! You won the match!');
        } else if (botScore > playerScore) {
          setMessage('Game Over! Bot won the match!');
        } else {
          setMessage("Game Over! It's a draw!");
        }
      } else {
        setMessage('Your turn! Drag a card to the center.');
      }
    }
  }, [gameState, playerHand.length, deck.length, playerScore, botScore]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="p-4 flex justify-between items-center bg-slate-800/50 border-b border-slate-700/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Bot size={24} />
          </div>
          <div>
            <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Bot</div>
            <div className="text-2xl font-bold font-mono">{botScore}</div>
          </div>
        </div>

        <div className="text-center flex-1 px-4">
          <h1 className="text-xl font-bold tracking-tight text-white mb-1">Card Battle</h1>
          <div className="text-sm text-indigo-300 h-5 transition-all duration-300">
            {message}
          </div>
        </div>

        <div className="flex items-center gap-2 text-right">
          <div>
            <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">You</div>
            <div className="text-2xl font-bold font-mono">{playerScore}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <User size={24} />
          </div>
        </div>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex flex-col relative">
        {/* Bot Hand */}
        <div className="h-40 flex justify-center items-start pt-4 gap-[-2rem] perspective-1000">
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

        {/* Center Play Area */}
        <div 
          ref={dropZoneRef}
          className="flex-1 flex items-center justify-center gap-8 relative z-0"
        >
          {/* Deck indicator */}
          <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col items-center opacity-50">
            <div className="relative w-24 h-36">
              {deck.length > 0 ? (
                <>
                  <div className="absolute inset-0 bg-indigo-900 rounded-xl border border-indigo-700 transform -rotate-6" />
                  <div className="absolute inset-0 bg-indigo-800 rounded-xl border border-indigo-600 transform -rotate-3" />
                  <div className="absolute inset-0 bg-indigo-600 rounded-xl border-2 border-indigo-400 flex items-center justify-center shadow-xl">
                    <div className="text-indigo-300 font-bold text-2xl opacity-50">{deck.length}</div>
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

          {/* Play slots */}
          <div className="flex gap-12 items-center justify-center w-full max-w-2xl">
            <div className="relative w-32 h-48 flex flex-col items-center justify-center">
              <div className="absolute inset-0 border-2 border-dashed border-slate-700/50 rounded-2xl bg-slate-800/20" />
              <span className="absolute -top-8 text-sm font-medium text-slate-500 uppercase tracking-widest">Bot Plays</span>
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

            <div className="text-3xl font-black text-slate-700 italic">VS</div>

            <div className="relative w-32 h-48 flex flex-col items-center justify-center">
              <div className={`absolute inset-0 border-2 border-dashed rounded-2xl transition-colors duration-300 ${
                gameState === 'playerTurn' ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-700/50 bg-slate-800/20'
              }`} />
              <span className="absolute -bottom-8 text-sm font-medium text-slate-500 uppercase tracking-widest">You Play</span>
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

        {/* Player Hand */}
        <div className="h-48 flex justify-center items-end pb-8 gap-2 perspective-1000 z-20">
          <AnimatePresence>
            {playerHand.map((card, index) => {
              // Calculate a slight fan effect
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

        {/* Overlays */}
        <AnimatePresence>
          {gameState === 'start' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 max-w-md w-full text-center">
                <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy size={40} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Card Battle</h2>
                <p className="text-slate-400 mb-8">
                  Drag your highest cards to the center to beat the bot. The player with the most points wins!
                </p>
                <button
                  onClick={startGame}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-indigo-500/25"
                >
                  Start Game
                </button>
              </div>
            </motion.div>
          )}

          {gameState === 'gameOver' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-50"
            >
              <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700 max-w-md w-full text-center">
                <h2 className="text-4xl font-black text-white mb-2">
                  {playerScore > botScore ? 'Victory!' : playerScore < botScore ? 'Defeat!' : 'Draw!'}
                </h2>
                <div className="flex justify-center items-center gap-8 my-8">
                  <div className="text-center">
                    <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">You</div>
                    <div className="text-5xl font-mono font-bold text-emerald-400">{playerScore}</div>
                  </div>
                  <div className="text-3xl font-black text-slate-700 italic">VS</div>
                  <div className="text-center">
                    <div className="text-sm text-slate-400 uppercase tracking-wider mb-1">Bot</div>
                    <div className="text-5xl font-mono font-bold text-indigo-400">{botScore}</div>
                  </div>
                </div>
                <button
                  onClick={startGame}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-colors shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
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
