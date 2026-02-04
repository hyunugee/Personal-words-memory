'use client';

import { useState, useEffect, useMemo } from 'react';
import { Word } from '@/types';
import WordCard from './WordCard';
import styles from './QuizEngine.module.css';
import { Check, X, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizEngineProps {
    words: Word[];
    onFinish: () => void;
}

type QuestionType = 'meaning' | 'example';

interface QuestionState {
    word: Word;
    type: QuestionType;
    options: string[]; // For MCQ (meanings)
    correctOptionIndex: number;
    clozeExample?: string; // For Example type
}

export default function QuizEngine({ words, onFinish }: QuizEngineProps) {
    // Local state for the session
    const [queue, setQueue] = useState<Word[]>([...words]);
    // Use a map to track streaks in this session (in a real app, sync this to DB)
    const [sessionStreaks, setSessionStreaks] = useState<Record<string, number>>(
        Object.fromEntries(words.map(w => [w.id, w.consecutiveCorrect]))
    );

    const [currentQuestion, setCurrentQuestion] = useState<QuestionState | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [isDictionaryView, setIsDictionaryView] = useState(false); // To show word card on wrong

    const generateQuestion = (word: Word, wordList: Word[]): QuestionState => {
        // Random question type
        const type: QuestionType = Math.random() > 0.5 ? 'example' : 'meaning';

        if (type === 'meaning') {
            // Pick 3 random distractors
            const distractors = wordList
                .filter(w => w.id !== word.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map(w => w.meanings[0]);

            const options = [...distractors, word.meanings[0]].sort(() => 0.5 - Math.random());

            return {
                word,
                type: 'meaning',
                options,
                correctOptionIndex: options.indexOf(word.meanings[0]),
            };
        } else {
            // Example cloze
            // Use the first example, blank out the word
            const ex = word.examples[0] || "No example provided.";
            // Simple regex replacement (case insensitive)
            const cloze = ex.replace(new RegExp(word.originalText, 'gi'), '_____');

            // Options are the word itself and 3 random other words
            const distractors = wordList
                .filter(w => w.id !== word.id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map(w => w.originalText);

            const options = [...distractors, word.originalText].sort(() => 0.5 - Math.random());

            return {
                word,
                type: 'example',
                options,
                correctOptionIndex: options.indexOf(word.originalText),
                clozeExample: cloze,
            };
        }
    };

    useEffect(() => {
        if (queue.length > 0 && !currentQuestion) {
            setCurrentQuestion(generateQuestion(queue[0], words));
        } else if (queue.length === 0) {
            onFinish();
        }
    }, [queue, currentQuestion, words, onFinish]);

    const handleAnswer = (optionIndex: number) => {
        if (feedback !== null) return; // Block input during feedback

        setSelectedOption(optionIndex);
        const correct = optionIndex === currentQuestion?.correctOptionIndex;

        if (correct) {
            setFeedback('correct');
            const wordId = currentQuestion!.word.id;
            const newStreak = (sessionStreaks[wordId] || 0) + 1;

            setSessionStreaks(prev => ({ ...prev, [wordId]: newStreak }));

            if (newStreak >= 3) {
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                // Remove from queue
                // Wait for animation then move to next
                setTimeout(() => {
                    setQueue(prev => prev.slice(1));
                    resetState();
                }, 1500);
            } else {
                // Correct but not yet memorized, push to back of queue to review again
                setTimeout(() => {
                    setQueue(prev => [...prev.slice(1), prev[0]]);
                    resetState();
                }, 1000);
            }
        } else {
            setFeedback('wrong');
            const wordId = currentQuestion!.word.id;
            // Reset streak
            setSessionStreaks(prev => ({ ...prev, [wordId]: 0 }));

            // Wait a bit, then show Dictionary View
            setTimeout(() => {
                setIsDictionaryView(true);
            }, 1000);
        }
    };

    const handleNextFromDictionary = () => {
        // Push wrong word to back of queue
        setQueue(prev => [...prev.slice(1), prev[0]]);
        resetState();
    };

    const resetState = () => {
        setFeedback(null);
        setSelectedOption(null);
        setCurrentQuestion(null);
        setIsDictionaryView(false);
    };

    if (!currentQuestion) return <div className={styles.loading}>Generating Quiz...</div>;

    if (isDictionaryView) {
        return (
            <div className={styles.container}>
                <div className={styles.feedbackHeader}>
                    <span className={styles.wrongText}>Incorrect! Review this word:</span>
                </div>
                <WordCard word={currentQuestion.word} flipped={true} />
                <button className="btn-primary" onClick={handleNextFromDictionary} style={{ marginTop: '2rem' }}>
                    Next Question <ArrowRight size={18} />
                </button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.progress}>
                <span>Words Left: {queue.length}</span>
                <span>Current Streak: {sessionStreaks[currentQuestion.word.id]} / 3</span>
            </div>

            <div className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: '600px' }}>
                <h2 className={styles.questionTitle}>
                    {currentQuestion.type === 'meaning' ? "What does this word mean?" : "Fill in the blank"}
                </h2>

                {currentQuestion.type === 'meaning' && (
                    <h1 className={styles.mainWord}>{currentQuestion.word.originalText}</h1>
                )}

                {currentQuestion.type === 'example' && (
                    <p className={styles.clozeText}>"{currentQuestion.clozeExample}"</p>
                )}

                <div className={styles.optionsGrid}>
                    {currentQuestion.options.map((opt, idx) => {
                        let btnClass = styles.optionBtn;
                        if (feedback === 'correct' && idx === currentQuestion.correctOptionIndex) btnClass += ` ${styles.correct}`;
                        if (feedback === 'wrong' && idx === selectedOption) btnClass += ` ${styles.wrong}`;
                        if (feedback === 'wrong' && idx === currentQuestion.correctOptionIndex) btnClass += ` ${styles.correctDimmed}`; // Show correct answer

                        return (
                            <button
                                key={idx}
                                className={btnClass}
                                onClick={() => handleAnswer(idx)}
                                disabled={feedback !== null}
                            >
                                {opt}
                                {feedback === 'correct' && idx === currentQuestion.correctOptionIndex && <Check size={20} />}
                                {feedback === 'wrong' && idx === selectedOption && <X size={20} />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
