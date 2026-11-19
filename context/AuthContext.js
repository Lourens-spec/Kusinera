import React, { createContext, useContext, useState } from "react";
import { supabase } from "../lib/supabase";
import { saveAccountProfile } from "../lib/profile";
import { useFavorites } from "../lib/favorites";

const AuthContext = createContext(null);

const demoAccounts = [
  { username: "staff", password: "StaffDemo123", role: "staff" },
  { username: "kitchen", password: "KitchenDemo123", role: "kitchen" },
  { username: "rider", password: "RiderDemo123", role: "rider", displayName: "Alex" },
  { username: "rider2", password: "RiderDemo123", role: "rider", displayName: "Sam" },
];

export function AuthProvider({ children }) {
  // Keep local accounts available for the demo when Supabase is unconfigured.
  const [storedAccounts, setAccounts] = useState([]);
  const accounts = [
    ...demoAccounts,
    ...storedAccounts.filter((account) => !demoAccounts.some((demo) => demo.username === account.username)),
  ];
  const [currentUser, setCurrentUser] = useState(null);
  const [browsingMenu, setBrowsingMenu] = useState(false);
  const [message, setMessage] = useState("");

  const favorites = useFavorites(currentUser);

  async function register(account) {
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: { data: { username: account.username } },
      });
      if (error) {
        if (error.code === "unexpected_failure") {
          throw new Error("Couldn’t create the account. Try a different username.");
        }
        throw error;
      }
      if (data.session) {
        const { error: signOutError } = await supabase.auth.signOut({ scope: "local" });
        if (signOutError) throw signOutError;
      }
      setMessage(data.session
        ? "Account created. You can now log in."
        : "Check your email for a verification code before logging in.");
      return { requiresVerification: !data.session, email: account.email.trim().toLowerCase() };
    }

    setAccounts((current) => [...current, { ...account, role: "customer" }]);
    setMessage("Account created. You can now log in.");
  }

  async function login(identifier, password) {
    const normalized = identifier.toLowerCase();
    let account = supabase ? null : accounts.find(user => user.username.toLowerCase() === normalized && user.password === password);
    if (supabase && !account) {
      const { data, error } = normalized.includes("@")
        ? await supabase.auth.signInWithPassword({ email: normalized, password })
        : await signInWithUsername(identifier, password);
      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      if (profileError) {
        await supabase.auth.signOut({ scope: "local" });
        throw new Error("Couldn’t load your account profile. Please try again.");
      }
      account = {
        id: profile.id,
        username: profile.username.toLowerCase(),
        email: data.user.email,
        displayName: profile.display_name || profile.username,
        photoUri: profile.photo_uri || null,
        role: profile.role,
      };
    }
    if (!account) throw new Error("Incorrect username or password.");
    setCurrentUser(account);
    setMessage("");
    return account;
  }

  async function updateProfile({ displayName, photoUri, photoBase64 }) {
    if (currentUser?.role !== "customer") throw new Error("Sign in as a customer to edit your profile.");
    const user = currentUser;
    if (supabase && !user.id) throw new Error("Sign in again with your Supabase account to save your profile.");
    const name = displayName.trim();
    if (name.length > 40) throw new Error("Use a display name of up to 40 characters.");
    const profile = supabase && user.id
      ? await saveAccountProfile(user.id, { displayName: name, photoUri, photoBase64 })
      : { displayName: name, photoUri };
    setAccounts(current => current.map(account =>
      account.username === user.username ? { ...account, ...profile } : account
    ));
    setCurrentUser(current => current && current.id === user.id && current.username === user.username
      ? { ...current, ...profile } : current);
  }

  function logout() {
    if (currentUser?.id && supabase) {
      supabase.auth.signOut({ scope: "local" }).catch(() => {});
    }
    setBrowsingMenu(false);
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{
      accounts, currentUser, message, setMessage, register, login, logout, updateProfile, ...favorites,
      browsingMenu, exploreMenu: () => setBrowsingMenu(true),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

async function signInWithUsername(username, password) {
  const { data, error } = await supabase.functions.invoke("username-login", {
    body: { username, password },
  });
  if (error) {
    const response = error.context;
    const body = await response?.json?.().catch(() => null);
    throw new Error(body?.error || "Username sign-in is unavailable. You can still sign in with your email.");
  }
  return supabase.auth.setSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
  });
}

