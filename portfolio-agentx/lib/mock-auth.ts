"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { MockUser } from "./mock-data";
import { mockUser as defaultMockUser } from "./mock-data";

const STORAGE_KEY = "agentx_user";
const REDIRECT_KEY = "agentx_redirect";

function getStoredUser(): MockUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as MockUser;
  } catch {
    return null;
  }
}

export function useMockAuth() {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setUser(getStoredUser());
    setIsLoading(false);
  }, []);

  const login = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMockUser));
    setUser(defaultMockUser);

    const redirect = localStorage.getItem(REDIRECT_KEY);
    if (redirect) {
      localStorage.removeItem(REDIRECT_KEY);
      router.push(redirect);
    } else {
      router.push("/dashboard");
    }
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    router.push("/login");
  }, [router]);

  return { user, isLoading, login, logout };
}

export function saveRedirectPath(path: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(REDIRECT_KEY, path);
  }
}

export function getStoredUserSync(): MockUser | null {
  return getStoredUser();
}
