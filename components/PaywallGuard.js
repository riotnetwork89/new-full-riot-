import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useRouter } from 'next/router';

export default function PaywallGuard({ children, requireAccess = true }) {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        if (requireAccess) {
          router.push('/login');
          return;
        }
        setLoading(false);
        return;
      }

      setUser(user);

      if (requireAccess) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profile?.role === 'admin') {
          setHasAccess(true);
        } else {
          const { data } = await supabase
            .from('orders')
            .select('id')
            .eq('email', user.email)
            .eq('status', 'COMPLETED')
            .single();

          if (data) {
            setHasAccess(true);
          } else {
            router.push('/checkout');
            return;
          }
        }
      } else {
        setHasAccess(true);
      }

      setLoading(false);
    };

    checkAccess();
  }, [requireAccess, router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-riot-black">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (requireAccess && !hasAccess) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-riot-black">
        <div className="text-white text-xl">Access denied</div>
      </div>
    );
  }

  return children;
}
