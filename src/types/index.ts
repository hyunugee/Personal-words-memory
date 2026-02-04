export type WordStatus = "new" | "studying" | "memorized";

export interface Word {
    id: string;
    userId: string;
    originalText: string; // The word itself
    meanings: string[]; // JSON array of strings
    examples: string[]; // JSON array of strings
    status: WordStatus;
    consecutiveCorrect: number; // For spaced repetition logic (>= 3 -> memorized)
    lastReviewedAt: Date | null;
    createdAt: Date;
}

export interface QuizQuestion {
    type: "meaning" | "example-fill" | "matching";
    question: string;
    options?: string[]; // For multiple choice
    correctAnswer: string;
    wordId: string;
}

export interface User {
    id: string;
    username: string;
    // Simple auth for now
}
