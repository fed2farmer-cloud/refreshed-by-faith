useEffect(() => {
  if (!supabase) {
    setAuthLoading(false);
    return;
  }

  const client = supabase;
  let mounted = true;

  const load = async () => {
    const { data: sessionData } = await client.auth.getSession();

    if (!mounted) return;

    const current = sessionData.session;
    setSession(current);
    setAuthLoading(false);

    if (!current?.user) return;

    const { data: a, error } = await client
      .from('applications')
      .select('*')
      .eq('user_id', current.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!mounted) return;

    if (error) setMsg(error.message);

    if (a) {
      setAppId(a.id);
      setData(a as Record<string, string>);
    }
  };

  load();

  const { data: listener } = client.auth.onAuthStateChange(
    (_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setAuthLoading(false);
    }
  );

  return () => {
    mounted = false;
    listener.subscription.unsubscribe();
  };
}, []);