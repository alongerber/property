import { useState, useEffect } from 'react';
import { DEADLINE_DATE } from '../utils/constants';

export function useDeadline() {
  const [daysLeft, setDaysLeft] = useState(() => {
    return Math.ceil((DEADLINE_DATE - new Date()) / (1000 * 60 * 60 * 24));
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setDaysLeft(Math.ceil((DEADLINE_DATE - new Date()) / (1000 * 60 * 60 * 24)));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const isUrgent = daysLeft < 30;
  const progress = Math.max(0, Math.min(100, ((90 - daysLeft) / 90) * 100));

  return { daysLeft, isUrgent, progress };
}
