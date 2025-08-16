import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function PaywallGuard({ children }) {
  const [state, setState] = useState({ loading: true, authed: false, hasAccess: false });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          if (mounted) setState({ loading: false, authed: false, hasAccess: false });
          return;
        }
        const resp = await fetch("/api/has-access", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const info = await resp.json();
        if (mounted) setState({ loading: false, authed: info.authed, hasAccess: info.hasAccess });
      } catch (error) {
        console.error('PaywallGuard fetch error:', error);
        if (mounted) setState({ loading: false, authed: false, hasAccess: false });
      }
    })();

    return () => { mounted = false; };
  }, []);

  if (state.loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white text-xl font-bold uppercase tracking-widest">Loading...</div>
    </div>
  );

  if (!state.authed) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-black uppercase tracking-wide">Please log in to continue</h2>
          <a href="/" className="inline-block px-8 py-4 bg-riot-red text-white font-bold uppercase tracking-[0.1em] hover:bg-red-700 transition-colors">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  if (!state.hasAccess) {
    return (
      <div className="min-h-screen bg-black text-white p-8 flex items-center justify-center">
        <div className="text-center space-y-8">
          <h2 className="text-4xl font-black uppercase tracking-wide">You need a PPV to watch the stream</h2>
          <a href="/checkout" className="inline-block px-8 py-4 bg-riot-red text-white font-bold uppercase tracking-[0.1em] hover:bg-red-700 transition-colors">
            Buy PPV
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
