'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { getUserCategories, UserCategories } from '@/lib/firestore';
import { defaultExpenseCategories, defaultIncomeCategories } from '@/lib/data';

// Global cache to avoid re-fetching on every component mount
let categoryCache: UserCategories | null = null;
let hasFetched = false;

export function useCategories() {
  const [user] = useAuthState(auth);
  const [categories, setCategories] = useState<UserCategories>({
    expense: defaultExpenseCategories,
    income: defaultIncomeCategories,
  });
  const [loading, setLoading] = useState(true);

  const fetchCategories = useCallback(async () => {
    if (categoryCache && hasFetched) {
        setCategories(categoryCache);
        setLoading(false);
        return;
    }
    
    setLoading(true);
    try {
      const userCategories = await getUserCategories();
      setCategories(userCategories);
      categoryCache = userCategories;
      hasFetched = true;
    } catch (error) {
      console.error("Failed to fetch user categories:", error);
      // Fallback to defaults on error
      setCategories({
        expense: defaultExpenseCategories,
        income: defaultIncomeCategories,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
        // Reset cache on user change
        categoryCache = null;
        hasFetched = false;
        fetchCategories();
    } else {
        // No user, use defaults
        setCategories({
            expense: defaultExpenseCategories,
            income: defaultIncomeCategories,
        });
        setLoading(false);
    }
  }, [user, fetchCategories]);
  
  // Mutate function to allow components to trigger a re-fetch
  const mutate = () => {
    categoryCache = null;
    hasFetched = false;
    fetchCategories();
  };

  return { categories, loading, mutate };
}
