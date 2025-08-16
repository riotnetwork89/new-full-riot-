import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import Nav from '../components/Nav';
import Link from 'next/link';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-black font-riot flex items-center justify-center">
        <div className="text-white text-xl font-bold uppercase tracking-widest">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black font-riot">
      <Nav />
      
      <main className="max-w-7xl mx-auto px-8 py-32">
        <div className="text-center space-y-16">
          <div className="space-y-8">
            <div className="riot-underline inline-block">
              <h1 className="text-11xl lg:text-12xl font-black text-white leading-none tracking-tighter">
                THE RIOT
              </h1>
            </div>
            <p className="text-gray-500 text-sm uppercase tracking-[0.2em] max-w-2xl mx-auto">
              Premium live streaming events and exclusive content
            </p>
          </div>

          {!user ? (
            <div className="space-y-12 py-16">
              <div className="space-y-8">
                <h2 className="text-4xl font-black text-white uppercase tracking-wide">
                  Get Started
                </h2>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                  Sign in to access exclusive live streams, events, and premium content.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/login" className="bg-riot-red text-white px-12 py-4 text-lg font-black uppercase tracking-[0.1em] hover:bg-red-700 transition-colors">
                  Sign In
                </Link>
                <Link href="/login" className="bg-black border border-gray-800 text-white px-12 py-4 text-lg font-black uppercase tracking-[0.1em] hover:border-riot-red transition-colors">
                  Create Account
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-12 py-16">
              <div className="space-y-8">
                <h2 className="text-4xl font-black text-white uppercase tracking-wide">
                  Welcome Back
                </h2>
                <p className="text-gray-400 text-lg max-w-xl mx-auto">
                  Access your premium content and live streaming events.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Link href="/stream" className="group bg-black border border-gray-800 p-8 hover:border-riot-red transition-colors">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-riot-red"></div>
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Live</span>
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase">Stream</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Watch live events with community chat
                    </p>
                    <div className="text-riot-red text-lg font-bold">→</div>
                  </div>
                </Link>
                
                <Link href="/schedule" className="group bg-black border border-gray-800 p-8 hover:border-riot-red transition-colors">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-gray-600"></div>
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Events</span>
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase">Schedule</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      View upcoming events and shows
                    </p>
                    <div className="text-riot-red text-lg font-bold">→</div>
                  </div>
                </Link>

                <Link href="/merch" className="group bg-black border border-gray-800 p-8 hover:border-riot-red transition-colors">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-4 h-4 bg-gray-600"></div>
                      <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em]">Shop</span>
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase">Merch</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      Official merchandise and gear
                    </p>
                    <div className="text-riot-red text-lg font-bold">→</div>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
