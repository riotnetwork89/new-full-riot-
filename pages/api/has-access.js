import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: req.headers.authorization || "" } } }
  );

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) return res.status(200).json({ authed: false, hasAccess: false });

  const { data, error } = await supabase
    .from("orders")
    .select("id,status,email")
    .eq("user_id", user.id)
    .eq("status", "COMPLETED")
    .limit(1)
    .maybeSingle();

  return res.status(200).json({ authed: true, hasAccess: !!data });
}
