import React from 'react';
import { motion } from 'motion/react';
import { Card as CardType } from '../utils/deck';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

interface PlayingCardProps {
  card: CardType;
  isFacedown?: boolean;
  isDraggable?: boolean;
  onDragEnd?: (event: any, info: any, card: CardType) => void;
  style?: React.CSSProperties;
  className?: string;
  layoutId?: string;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isFacedown = false,
  isDraggable = false,
  onDragEnd,
  style,
  className = '',
  layoutId,
}) => {
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const colorClass = isRed ? 'text-red-500' : 'text-slate-900';

  const renderSuit = (size: number = 24) => {
    switch (card.suit) {
      case 'hearts':
        return <Heart size={size} className="fill-current" />;
      case 'diamonds':
        return <Diamond size={size} className="fill-current" />;
      case 'clubs':
        return <Club size={size} className="fill-current" />;
      case 'spades':
        return <Spade size={size} className="fill-current" />;
    }
  };

  if (isFacedown) {
    return (
      <motion.div
        layoutId={layoutId}
        className={`w-24 h-36 rounded-xl shadow-md border-2 border-white bg-indigo-600 flex items-center justify-center relative overflow-hidden ${className}`}
        style={style}
      >
        <div className="absolute inset-2 border-2 border-indigo-400 rounded-lg opacity-50" />
        <div className="w-12 h-12 rounded-full border-2 border-indigo-400 opacity-50 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-indigo-400 opacity-50" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={layoutId}
      drag={isDraggable}
      dragSnapToOrigin
      onDragEnd={(e, info) => onDragEnd?.(e, info, card)}
      whileHover={isDraggable ? { y: -10, scale: 1.05, zIndex: 10 } : {}}
      whileDrag={{ scale: 1.1, zIndex: 50, cursor: 'grabbing' }}
      className={`w-24 h-36 rounded-xl shadow-lg border border-slate-200 bg-white flex flex-col justify-between p-2 select-none ${
        isDraggable ? 'cursor-grab' : ''
      } ${colorClass} ${className}`}
      style={style}
    >
      <div className="flex flex-col items-center self-start leading-none">
        <span className="text-lg font-bold">{card.rank}</span>
        {renderSuit(16)}
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        {renderSuit(32)}
      </div>
      
      <div className="flex flex-col items-center self-end leading-none rotate-180">
        <span className="text-lg font-bold">{card.rank}</span>
        {renderSuit(16)}
      </div>
    </motion.div>
  );
};
