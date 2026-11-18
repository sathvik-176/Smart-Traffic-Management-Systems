import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

// @ts-expect-error - Existing Supabase client is JavaScript
import { supabase } from "../supabaseClient";
function ProtectedRoute() {
  const [loading, setLoading] = useState<boolean>(true);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    let active = true;

    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      setAuthenticated(!error && !!data.user);
      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
  (_event: AuthChangeEvent, session: Session | null) => {
    setAuthenticated(!!session);
    setLoading(false);
  }
);

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <p>Checking authentication...</p>;

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export default ProtectedRoute;
