import { useEffect, useState } from 'react';
import supabase from '../../utils/supabase';

export default function TriviaPage() {
  const [question, setQuestion] = useState(null);
  const [timer, setTimer] = useState(30);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState('');

  useEffect(() => {
    async function fetchQuestion() {
      // Fetch a single trivia question (modify query as needed)
      const { data, error } = await supabase
        .from('trivia_questions')
        .select('*')
        .limit(1)
        .single();
      if (!error) {
        setQuestion(data);
      }
    }
    fetchQuestion();
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
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();
    // Insert response into trivia_responses table
    await supabase.from('trivia_responses').insert({
      question_id: question.id,
      user_email: user ? user.email : null,
      selected_option: opt.toUpperCase(),
      correct,
    });
    if (correct) {
      // Add coins to user coin ledger
      await supabase.from('coin_ledger').insert({
        user_email: user ? user.email : null,
        coins: question.coin_reward,
        note: 'Trivia reward',
      });
      setResult(`Correct! +${question.coin_reward} coins`);
    } else {
      setResult('Wrong answer');
    }
  };

  if (!question) return <p>Loading question...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Trivia Time!</h1>
      <p>Time left: {timer}s</p>
      <h2>{question.question}</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {['a', 'b', 'c', 'd'].map((opt) => (
          <li key={opt} style={{ marginBottom: '0.5rem' }}>
            <button
              onClick={() => handleAnswer(opt)}
              disabled={!!selected || timer === 0}
              style={{ padding: '0.5rem 1rem' }}
            >
              {opt.toUpperCase()}. {question['option_' + opt]}
            </button>
          </li>
        ))}
      </ul>
      {result && <p>{result}</p>}
    </div>
  );
}
