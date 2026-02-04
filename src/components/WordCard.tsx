'use client';

import { useState } from 'react';
import { Word } from '@/types';
import { Volume2, RotateCw } from 'lucide-react';
import styles from './WordCard.module.css';

interface WordCardProps {
    word: Word;
    flipped?: boolean;
    onFlip?: () => void;
}

export default function WordCard({ word, flipped = false, onFlip }: WordCardProps) {
    const [isFlipped, setIsFlipped] = useState(flipped);

    const handleFlip = () => {
        if (onFlip) {
            onFlip();
        } else {
            setIsFlipped(!isFlipped);
        }
    };

    const speak = (e: React.MouseEvent) => {
        e.stopPropagation();
        const utterance = new SpeechSynthesisUtterance(word.originalText);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
    };

    const showBack = onFlip ? flipped : isFlipped;

    return (
        <div className={`${styles.card} ${showBack ? styles.flipped : ''}`} onClick={handleFlip}>
            <div className={styles.inner}>
                <div className={styles.front}>
                    <div className={styles.content}>
                        <h2 className={styles.word}>{word.originalText}</h2>
                        <button className={styles.audioBtn} onClick={speak}>
                            <Volume2 size={24} />
                        </button>
                        <p className={styles.hint}>Tap to reveal meaning</p>
                    </div>
                </div>
                <div className={styles.back}>
                    <div className={styles.content}>
                        <div className={styles.section}>
                            <h3>Meaning</h3>
                            <ul>
                                {word.meanings.map((m, i) => <li key={i}>{m}</li>)}
                            </ul>
                        </div>
                        <div className={styles.section}>
                            <h3>Examples</h3>
                            <ul>
                                {word.examples.map((ex, i) => (
                                    <li key={i} dangerouslySetInnerHTML={{ __html: ex.replace(new RegExp(word.originalText, 'gi'), '<b>$&</b>') }} />
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
