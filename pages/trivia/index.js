import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase';
import Nav from '../../components/Nav';
import { useRouter } from 'next/router';

export default function TriviaPage() {
  const [question, setQuestion] = useState(null);
  const [timer, setTimer] = useState(30);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (router.isReady) {
          router.push('/login');
        }
        return;
      }
      setUser(user);
    };
    getUser();

    async function fetchQuestion() {
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
  }, [router]);

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
    
    await supabase.from('trivia_responses').insert({
      question_id: question.id,
      user_email: user ? user.email : null,
      selected_option: opt.toUpperCase(),
      correct,
    });
    
    if (correct) {
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

  if (!question) {
    return (
      <div className="min-h-screen bg-riot-black">
        <Nav />
        <div className="flex justify-center items-center h-96">
          <div className="text-white text-xl">Loading question...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-riot-black">
      <Nav />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-riot-red mb-4">TRIVIA TIME!</h1>
          <div className={`inline-block px-6 py-3 rounded-full text-2xl font-bold ${
            timer > 10 ? 'bg-green-600 text-white' : 'bg-red-600 text-white animate-pulse'
          }`}>
            {timer}s
          </div>
        </div>

        <div className="bg-riot-gray rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">{question.question}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['a', 'b', 'c', 'd'].map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                disabled={!!selected || timer === 0}
                className={`p-6 rounded-lg text-left transition-all transform hover:scale-105 ${
                  selected === opt
                    ? 'bg-riot-red text-white'
                    : 'bg-riot-black text-white hover:bg-gray-700'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
              >
                <span className="text-riot-red font-bold text-xl mr-4">
                  {opt.toUpperCase()}.
                </span>
                <span className="text-lg">{question['option_' + opt]}</span>
              </button>
            ))}
          </div>
        </div>

        {result && (
          <div className={`text-center p-6 rounded-lg text-2xl font-bold ${
            result.includes('Correct') 
              ? 'bg-green-600 text-white' 
              : 'bg-red-600 text-white'
          }`}>
            {result}
          </div>
        )}
      </main>
    </div>
  );
}
