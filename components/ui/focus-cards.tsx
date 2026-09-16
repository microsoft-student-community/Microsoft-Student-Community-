"use client";
import Image from "next/image";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export type CardType = {
  id?: string;
  title: string;
  src?: string;
  image_url?: string;
  image?: string;
  category?: string;
  date?: string;
  desc?: string;
  [key: string]: any;
};

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
    onCardClick,
  }: {
    card: CardType;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
    onCardClick?: (card: CardType, index: number) => void;
  }) => {
    const imageSrc = card.src || card.image_url || card.image || "";
    const isHovered = hovered === index;

    return (
      <div
        onMouseEnter={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => onCardClick?.(card, index)}
        className={cn(
          "rounded-2xl relative bg-neutral-900 overflow-hidden h-72 sm:h-80 md:h-96 w-full transition-all duration-400 ease-out cursor-pointer group shadow-xl border border-white/10 hover:border-blue-500/40 hover:shadow-2xl hover:shadow-blue-500/10",
          hovered !== null && !isHovered && "blur-[1.5px] scale-[0.98] opacity-75"
        )}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={card.title || "Gallery photo"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
            unoptimized={imageSrc.startsWith("http")}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-neutral-500 font-mono text-sm">
            No image available
          </div>
        )}

        {/* Clean bottom-center event title overlay */}
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end items-center p-6 text-center transition-all duration-300",
            isHovered
              ? "opacity-100 translate-y-0"
              : "opacity-100 md:opacity-0 translate-y-0 md:translate-y-2 md:group-hover:opacity-100 md:group-hover:translate-y-0"
          )}
        >
          <h3
            style={{ fontFamily: "var(--font-sans, 'Inter', sans-serif)" }}
            className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight leading-snug line-clamp-2 drop-shadow-md text-center max-w-[90%]"
          >
            {card.title}
          </h3>
        </div>
      </div>
    );
  }
);

Card.displayName = "Card";

export function FocusCards({
  cards,
  onCardClick,
}: {
  cards: CardType[];
  onCardClick?: (card: CardType, index: number) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto px-2 sm:px-4 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.id || `${card.title}-${index}`}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}

