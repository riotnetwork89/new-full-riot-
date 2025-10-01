import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';

export default function TriviaPage() {
  const [question, setQuestion] = useState(null);
  const [timer, setTimer] = useState(30);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState('');

  useEffect(() => {
    const mockQuestion = {
      id: 1,
      question: 'What year was Riot Network founded?',
      option_a: '2020',
      option_b: '2021',
      option_c: '2022',
      option_d: '2023',
      correct_option: 'c',
      coin_reward: 50
    };
    setQuestion(mockQuestion);
  }, []);

  // Countdown timer
  useEffect(() => {
    let interval;
    if (question && timer > 0 && !selected) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && !selected) {
      setResult("Time's up!");
    }
    return () => clearInterval(interval);
  }, [timer, question, selected]);

  const handleAnswer = async (opt) => {
    if (selected) return;
    setSelected(opt);
    if (!question) return;
    const correct = opt === question.correct_option.toLowerCase();
    
    if (correct) {
      setResult(`Correct! +${question.coin_reward} coins`);
    } else {
      setResult('Wrong answer');
    }
  };

  if (!question) return <p>Loading question...</p>;

  return (
    <div className="container">
      <h1>Trivia Time!</h1>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>
            Time left: <strong style={{ color: '#ff6b6b' }}>{timer}s</strong>
          </p>
          <h2 style={{ marginBottom: '2rem' }}>{question.question}</h2>
        </div>
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          {['a', 'b', 'c', 'd'].map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              disabled={!!selected || timer === 0}
              style={{ 
                margin: '0.5rem 0', 
                padding: '1rem', 
                textAlign: 'left',
                opacity: selected || timer === 0 ? 0.7 : 1
              }}
            >
              <strong>{opt.toUpperCase()}:</strong> {question['option_' + opt]}
            </button>
          ))}
        </div>
        {result && (
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <p style={{ 
              fontSize: '1.3rem', 
              fontWeight: 'bold',
              color: result.includes('Correct') ? '#4ade80' : '#ff6b6b'
            }}>
              {result}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
