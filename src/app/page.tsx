'use client';

import { useState } from 'react';
import CameraCapture from '@/components/CameraCapture';
import FileUpload from '@/components/FileUpload';
import QuizEngine from '@/components/QuizEngine';
import styles from './page.module.css';
import { Word } from '@/types';
import { BookOpen, Brain, TrendingUp } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  // In a real app, this comes from DB
  const [words, setWords] = useState<Word[]>([]);
  const [mode, setMode] = useState<'dashboard' | 'test'>('dashboard');

  const handleFile = async (file: File) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/process-input', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.words) {
        // Map API response to Word interface
        const newWords = data.words.map((w: any) => ({
          id: crypto.randomUUID(),
          userId: 'guest',
          originalText: w.originalText,
          meanings: w.meanings,
          examples: w.examples,
          status: 'new',
          consecutiveCorrect: 0,
          lastReviewedAt: null,
          createdAt: new Date(),
        }));

        setWords(prev => [...prev, ...newWords]);
      } else {
        alert(data.error || "Failed to process");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  const startTest = () => {
    if (words.length === 0) {
      alert("No words to study! Add some first.");
      return;
    }
    setMode('test');
  };

  const handleTestFinish = () => {
    setMode('dashboard');
    alert("Test Complete! Great job.");
  };

  if (mode === 'test') {
    return (
      <main className={styles.main}>
        <div className="container">
          <button onClick={() => setMode('dashboard')} className={styles.backBtn}>&larr; Back to Dashboard</button>
          <QuizEngine words={words} onFinish={handleTestFinish} />
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>Personal Words Memory</h1>
        <p className={styles.subtitle}>Capture. Analyze. Master.</p>
      </header>

      <div className="container">

        <div className={styles.statsRow}>
          <div className="glass-panel" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <div style={{ opacity: 0.7 }}>Total Words</div>
            <div style={{ fontSize: '2rem', fontWeight: 600 }}>{words.length}</div>
          </div>
          <div className="glass-panel" style={{ padding: '1rem', flex: 1, textAlign: 'center' }}>
            <div style={{ opacity: 0.7 }}>Memorized</div>
            <div style={{ fontSize: '2rem', fontWeight: 600, color: 'var(--primary)' }}>
              {words.filter(w => w.status === 'memorized').length}
            </div>
          </div>
        </div>

        <div className={styles.buttonRow}>
          <button className="btn-primary" style={{ width: '100%' }} onClick={startTest}>
            <Brain size={20} style={{ marginRight: '8px' }} /> Start Test
          </button>
        </div>

        <div className={styles.inputSection}>
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>
              <BookOpen size={20} style={{ marginRight: '8px' }} /> Add New Words
            </h2>
            <div className={styles.actions}>
              <CameraCapture onCapture={handleFile} />
              <div style={{ margin: '1rem 0', textAlign: 'center', opacity: 0.5 }}>OR</div>
              <FileUpload onFileSelect={handleFile} />
            </div>
          </div>
        </div>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Analyzing content with Gemini...</p>
          </div>
        )}

        {words.length > 0 && (
          <div className={styles.results}>
            <h2>Study List</h2>
            <div className={styles.wordGrid}>
              {words.map((w, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '1rem' }}>
                  <h3 style={{ color: 'var(--primary)' }}>{w.originalText}</h3>
                  <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                    {w.meanings[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
