import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { firestore } from '@/FirebaseConfig';
import { useAuth } from '@/utilities/hooks/useAuth';

interface UserPreferences {
  darkMode: boolean;
  notifications: boolean;
  reminderTime: 'at_time' | '5_min_before' | '15_min_before' | '1_hour_before';
}

const defaultPreferences: UserPreferences = {
  darkMode: false,
  notifications: true,
  reminderTime: 'at_time',
};

export const useUserPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPreferences(defaultPreferences);
      setIsLoading(false);
      return;
    }

    const userRef = doc(firestore, 'users', user.uid);
    const unsubscribe = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const dbPreferences = snapshot.data()?.preferences || {};
        setPreferences({ ...defaultPreferences, ...dbPreferences });
      } else {
        setPreferences(defaultPreferences);
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching user preferences:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { preferences, isLoading };
};
