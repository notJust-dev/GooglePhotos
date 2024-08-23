import { Session, User } from '@supabase/supabase-js';
import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { supabase } from '~/utils/supabase';

type AuthContextType = {
  session: Session | null;
  user: User | undefined;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: undefined,
});

export default function AuthContextProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <AuthContext.Provider value={{ session, user: session?.user }}>{children}</AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
