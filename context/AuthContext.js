import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const demoAccounts = [
  { username: "staff", password: "StaffDemo123", role: "staff" },
  { username: "kitchen", password: "KitchenDemo123", role: "kitchen" },
  { username: "rider", password: "RiderDemo123", role: "rider", displayName: "Alex" },
  { username: "rider2", password: "RiderDemo123", role: "rider", displayName: "Sam" },
];

export function AuthProvider({ children }) {
  // This is a class prototype. Accounts reset when the app reloads.
  const [storedAccounts, setAccounts] = useState([]);
  const accounts = [
    ...demoAccounts,
    ...storedAccounts.filter((account) => !demoAccounts.some((demo) => demo.username === account.username)),
  ];
  const [currentUser, setCurrentUser] = useState(null);
  const [browsingMenu, setBrowsingMenu] = useState(false);
  const [message, setMessage] = useState("");

  const [favoritesByUser, setFavoritesByUser] = useState(() => new Map());
  const favoriteIds = favoritesByUser.get(currentUser?.username) ?? [];

  function toggleFavorite(id) {
    if (!currentUser) return;

    setFavoritesByUser((current) => {
      const ids = current.get(currentUser.username) ?? [];
      const nextIds = ids.includes(id) ? ids.filter((favoriteId) => favoriteId !== id) : [...ids, id];
      return new Map(current).set(currentUser.username, nextIds);
    });
  }

  function register(account) {
    setAccounts((current) => [...current, { ...account, role: "customer" }]);
    setMessage("Account created. You can now log in.");
  }

  function login(account) {
    setCurrentUser(account);
    setMessage("");
  }

  function updateProfile({ displayName, photoUri }) {
    if (currentUser?.role !== "customer") return;

    const username = currentUser.username;
    const profile = { displayName: displayName.trim(), photoUri };
    setAccounts((current) => current.map((account) =>
      account.username === username ? { ...account, ...profile } : account
    ));
    setCurrentUser((current) =>
      current?.username === username ? { ...current, ...profile } : current
    );
  }

  function logout() {
    setBrowsingMenu(false);
    setCurrentUser(null);
  }

  return (
    <AuthContext.Provider value={{
      accounts, currentUser, message, setMessage, register, login, logout, updateProfile, favoriteIds, toggleFavorite,
      browsingMenu, exploreMenu: () => setBrowsingMenu(true),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

