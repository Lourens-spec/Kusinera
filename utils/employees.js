export const employeeRoles = [
  { value: "staff", label: "Staff", icon: "users", detail: "Orders, payments & menu" },
  { value: "kitchen", label: "Kitchen", icon: "coffee", detail: "Preparation & kitchen queue" },
  { value: "rider", label: "Rider", icon: "navigation", detail: "Deliveries & cash collection" },
];

export function prepareEmployee(draft) {
  const display_name = draft.displayName.trim();
  const username = draft.username.trim().toLowerCase();
  const email = draft.email.trim().toLowerCase();
  if (!display_name || display_name.length > 40) return { error: "Enter a display name of up to 40 characters." };
  if (!/^[a-z0-9][a-z0-9_.-]{2,31}$/.test(username)) return { error: "Use 3–32 letters, numbers, dots, hyphens or underscores for the username." };
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  if (draft.password.length < 12 || draft.password.length > 72 || !/[A-Za-z]/.test(draft.password) || !/[0-9]/.test(draft.password)) return { error: "Use an initial password of 12–72 characters with a letter and a number." };
  if (draft.password !== draft.confirmPassword) return { error: "The passwords don’t match." };
  if (!employeeRoles.some(role => role.value === draft.role)) return { error: "Choose Staff, Kitchen or Rider." };
  return { employee: { display_name, username, email, password: draft.password, role: draft.role } };
}
