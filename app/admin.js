import React, { useCallback, useEffect, useRef, useState } from "react";
import { Redirect, useFocusEffect, useRouter } from "expo-router";
import { Platform, StyleSheet } from "react-native";
import {
  Feather,
  MaterialCommunityIcons,
  Pressable,
  Text,
  TextInput,
  View,
} from "../components/Themed";
import ScreenContainer from "../components/ScreenContainer";
import ChoiceField from "../components/ChoiceField";
import ProfileAvatar from "../components/ProfileAvatar";
import { useAuth } from "../context/AuthContext";
import { glossyMenuTab, useMenuGlass } from "../styles/menuGlass";
import { supabase } from "../lib/supabase";

const serif = Platform.select({
  ios: "Georgia",
  web: "Georgia",
  default: "serif",
});
const sans = Platform.select({
  ios: "Arial",
  web: "Arial",
  default: "sans-serif",
});
const roles = ["staff", "kitchen", "rider"].map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
}));
const accountGroups = [
  { role: "staff", label: "Staff", icon: "users" },
  { role: "rider", label: "Riders", icon: "navigation" },
  { role: "kitchen", label: "Kitchen", icon: "coffee" },
  { role: "customer", label: "Customers", icon: "user" },
  { role: "admin", label: "Administrators", icon: "shield" },
];
const money = (value) =>
  "₱" +
  Number(value || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 });

export default function AdminRoute() {
  const { currentUser, logout } = useAuth();
  if (!currentUser) return <Redirect href="/login" />;
  if (currentUser.role !== "admin") return <Redirect href="/" />;
  return (
    <Dashboard key={currentUser.id} account={currentUser} logout={logout} />
  );
}

function Dashboard({ account, logout }) {
  const router = useRouter();
  const glass = useMenuGlass();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [expandedRole, setExpandedRole] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (!supabase) throw new Error("Supabase is not configured.");
      const result = await supabase.rpc("admin_dashboard");
      if (result.error) throw result.error;
      setData(result.data);
    } catch (failure) {
      setError(failure.message || "Couldn’t load the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  const accounts =
    data?.accounts.filter((user) =>
      [user.username, user.display_name, user.role]
        .join(" ")
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
    ) ?? [];

  const ratings = data?.ratings ?? [];
  const average = ratings.length
    ? (
        ratings.reduce((sum, r) => sum + Number(r.stars), 0) / ratings.length
      ).toFixed(1)
    : "—";
  return (
    <ScreenContainer
      glassBackground
      keyboardShouldPersistTaps="handled"
      scrollStyle={styles.scroll}
      contentStyle={styles.content}
      header={
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>KUSINERA</Text>
            <Text style={styles.light}>RESTAURANT ADMIN</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open accounts"
            onPress={() => setTab("Accounts")}
            style={styles.avatar}
          >
            <Text style={styles.light}>A</Text>
          </Pressable>
        </View>
      }
      footer={
        <View style={styles.footer}>
          <View style={[styles.tabs, glass.surface]}>
            {["Overview", "Accounts", "Ratings"].map((label, index) => (
              <Pressable
                key={label}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === label }}
                onPress={() => setTab(label)}
                style={[styles.tab, tab === label && glossyMenuTab]}
              >
                <Feather
                  name={["grid", "users", "star"][index]}
                  size={20}
                  color={tab === label ? "#FFF8ED" : "#6D0808"}
                />
                <Text
                  style={tab === label ? styles.navActive : styles.navLabel}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      }
    >
      <View style={styles.banner}>
        <Text style={styles.eyebrow}>YOUR RESTAURANT, AT A GLANCE</Text>
        <Text style={styles.welcome}>Good food.{"\n"}In good hands.</Text>
        <Text style={styles.greeting}>Welcome back, Admin.</Text>
        <View style={styles.stamp}>
          <MaterialCommunityIcons
            name="pot-steam-outline"
            size={27}
            color="#FFF1DA"
          />
        </View>
      </View>
      <View style={styles.bodyContent}>
        <View style={styles.section}>
          <Text accessibilityRole="header" style={styles.title}>
            {tab === "Accounts"
              ? "Accounts & roles"
              : tab === "Ratings"
                ? "Customer feedback"
                : "Overview"}
          </Text>
          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={load}
            style={styles.refresh}
          >
            <Feather name="refresh-cw" size={15} color="#8B6262" />
            <Text style={styles.meta}>{loading ? "Loading…" : "Refresh"}</Text>
          </Pressable>
        </View>
        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}
        {data ? (
          <>
            {tab === "Overview" ? (
              <>
                <View style={[styles.card, glass.surface]}>
                  <Text style={styles.body}>Paid orders · All time</Text>
                  <Text style={styles.amount}>
                    {money(data.summary.paid_total)}
                  </Text>
                  <Text style={styles.body}>
                    {data.summary.orders} orders recorded
                  </Text>
                </View>
                <View style={styles.row}>
                  <View style={[styles.card, styles.flex, glass.surface]}>
                    <Feather name="credit-card" size={20} color="#8B6262" />
                    <Text style={styles.meta}>Unpaid balance</Text>
                    <Text style={styles.statValue}>
                      {money(data.summary.unpaid_total)}
                    </Text>
                  </View>
                  <View style={[styles.card, styles.flex, glass.surface]}>
                    <Feather name="star" size={20} color="#8B6262" />
                    <Text style={styles.meta}>Customer rating</Text>
                    <Text style={styles.statValue}>{average} / 5</Text>
                  </View>
                </View>
                <Text style={styles.subheading}>Manage your restaurant</Text>
                <View style={[styles.linkGroup, glass.surface]}>
                  {["Accounts", "Ratings"].map((label) => (
                    <Pressable
                      key={label}
                      accessibilityRole="button"
                      onPress={() => setTab(label)}
                      style={styles.linkRow}
                    >
                      <View style={styles.person}>
                        <Feather
                          name={
                            label === "Accounts" ? "users" : "message-square"
                          }
                          size={18}
                          color="#6D0808"
                        />
                      </View>
                      <View style={styles.flex}>
                        <Text style={styles.heading}>
                          {label === "Accounts"
                            ? "Accounts & roles"
                            : "Customer feedback"}
                        </Text>
                        <Text style={styles.meta}>
                          {label === "Accounts"
                            ? "Manage your team’s access"
                            : "Read ratings and suggestions"}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={18} color="#8B6262" />
                    </Pressable>
                  ))}
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => router.push("/admin-promos")}
                    style={styles.linkRow}
                  >
                    <View style={styles.person}>
                      <Feather name="tag" size={18} color="#6D0808" />
                    </View>
                    <View style={styles.flex}>
                      <Text style={styles.heading}>Promos &amp; vouchers</Text>
                      <Text style={styles.meta}>
                        Create offers and manage voucher codes
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={18} color="#8B6262" />
                  </Pressable>
                </View>
                <Text style={styles.subheading}>Customer feedback</Text>
                {ratings.length ? (
                  <Rating rating={ratings[0]} />
                ) : (
                  <Text style={styles.body}>No customer ratings yet.</Text>
                )}
              </>
            ) : null}
            {tab === "Accounts" ? (
              <>
                <View style={[styles.searchRow, glass.surface]}>
                  <Feather name="search" size={18} color="#8B6262" />
                  <TextInput
                    accessibilityLabel="Search accounts"
                    placeholder="Search name or role"
                    value={query}
                    onChangeText={setQuery}
                    style={styles.search}
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => router.push("/create-employee")}
                  style={[styles.createEmployee, glossyMenuTab]}
                >
                  <Feather name="user-plus" size={18} color="#FFFAF0" />
                  <View style={styles.flex}>
                    <Text style={styles.employeeLabel}>
                      Create employee account
                    </Text>
                    <Text style={styles.employeeHint}>
                      Staff, Kitchen or Rider
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color="#FFFAF0" />
                </Pressable>
                <Text style={styles.body}>
                  Manage your team below. Role changes take effect at the next
                  sign-in.
                </Text>
                {accountGroups.map((group) => {
                  const members = accounts.filter(
                    (user) => user.role === group.role,
                  );
                  const expanded =
                    query.trim().length > 0 || expandedRole === group.role;
                  return (
                    <View
                      key={group.role}
                      style={[styles.accountGroup, glass.surface]}
                    >
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ expanded }}
                        accessibilityLabel={
                          group.label + ", " + members.length + " accounts"
                        }
                        onPress={() => {
                          setQuery("");
                          setExpandedRole(
                            expandedRole === group.role ? null : group.role,
                          );
                        }}
                        style={styles.groupHeader}
                      >
                        <View style={styles.person}>
                          <Feather
                            name={group.icon}
                            size={18}
                            color="#6D0808"
                          />
                        </View>
                        <Text style={[styles.heading, styles.flex]}>
                          {group.label}
                        </Text>
                        <View style={styles.count}>
                          <Text style={styles.roleLabel}>{members.length}</Text>
                        </View>
                        <Feather
                          name={expanded ? "chevron-up" : "chevron-down"}
                          size={17}
                          color="#8B6262"
                        />
                      </Pressable>
                      {expanded ? (
                        <View>
                          {members.map((user) => (
                            <Account
                              key={user.id}
                              user={user}
                              self={user.id === account.id}
                              reload={load}
                            />
                          ))}
                          {!members.length ? (
                            <Text style={styles.emptyGroup}>
                              {query.trim()
                                ? "No matching accounts in this group."
                                : "No accounts in this group yet."}
                            </Text>
                          ) : null}
                        </View>
                      ) : null}
                    </View>
                  );
                })}
                {!accounts.length && (
                  <Text style={styles.body}>No matching accounts.</Text>
                )}
              </>
            ) : tab === "Ratings" ? (
              <>
                <View
                  style={[styles.card, styles.ratingSummary, glass.surface]}
                >
                  <Text style={styles.score}>
                    {average}
                    <Text style={styles.meta}> /5</Text>
                  </Text>
                  <View>
                    <Text style={styles.stars}>★★★★★</Text>
                    <Text style={styles.meta}>
                      Based on {ratings.length} ratings
                    </Text>
                  </View>
                </View>
                <View style={styles.row}>
                  {["All", "Dine-in", "Delivery"].map((label) => (
                    <Pressable
                      key={label}
                      accessibilityRole="button"
                      accessibilityState={{ selected: filter === label }}
                      onPress={() => setFilter(label)}
                      style={[
                        styles.filter,
                        filter === label && styles.selected,
                      ]}
                    >
                      <Text
                        style={
                          filter === label
                            ? styles.filterActive
                            : styles.filterLabel
                        }
                      >
                        {label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {data.ratings
                  .filter(
                    (rating) =>
                      filter === "All" ||
                      (filter === "Dine-in"
                        ? rating.order.startsWith("DI-")
                        : rating.order.startsWith("DL-")),
                  )
                  .map((rating) => (
                    <Rating key={rating.order} rating={rating} />
                  ))}
                {!data.ratings.length && (
                  <Text style={styles.body}>No customer ratings yet.</Text>
                )}
              </>
            ) : null}
          </>
        ) : null}
        <Pressable
          accessibilityRole="button"
          style={styles.logout}
          onPress={() => {
            logout();
            router.dismissTo("/");
          }}
        >
          <Text style={styles.meta}>Log out of workspace</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

function Rating({ rating }) {
  const glass = useMenuGlass();
  return (
    <View style={[styles.card, glass.surface]}>
      <View style={styles.reviewTop}>
        <Text
          style={styles.stars}
          accessibilityLabel={rating.stars + " out of 5 stars"}
        >
          {"★".repeat(Math.max(0, Math.min(5, Number(rating.stars))))}
        </Text>
        <Text style={styles.meta}>
          {rating.order.startsWith("DI-") ? "Dine-in" : "Delivery"} ·{" "}
          {rating.order}
        </Text>
      </View>
      <View style={styles.dishes}>
        <Text style={styles.dishLabel}>ORDERED DISHES</Text>
        {rating.dishes?.length ? (
          rating.dishes.map((dish, index) => (
            <Text key={index} style={styles.dishName}>
              {dish.quantity} × {dish.name}
            </Text>
          ))
        ) : (
          <Text style={styles.body}>Dish details unavailable.</Text>
        )}
      </View>
      <Text style={styles.quote}>{rating.comment || "No comment added."}</Text>
    </View>
  );
}

function Account({ user, self, reload }) {
  const username =
    user.username && user.username !== user.id ? user.username : "";
  const name =
    user.display_name && user.display_name !== user.id
      ? user.display_name
      : username ||
        `${user.role[0].toUpperCase()}${user.role.slice(1)} account`;
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const pending = useRef(false);
  const [role, setRole] = useState(
    roles.some((option) => option.value === user.role) ? user.role : "",
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setRole(
      roles.some((option) => option.value === user.role) ? user.role : "",
    );
  }, [user.role]);

  async function save() {
    if (
      pending.current ||
      self ||
      !roles.some((option) => option.value === role) ||
      role === user.role
    )
      return;
    pending.current = true;
    setSaving(true);
    setError("");
    try {
      const result = await supabase.rpc("admin_set_role", {
        p_id: user.id,
        p_role: role,
      });
      if (result.error) throw result.error;
      await reload();
      setConfirming(false);
      setEditing(false);
    } catch (failure) {
      setError(failure.message || "Couldn’t update this role.");
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }
  return (
    <View style={styles.account}>
      <View style={styles.accountRow}>
        <ProfileAvatar
          name={name}
          uri={user.role === "customer" ? user.photo_uri : null}
          size={35}
        />
        <View style={styles.flex}>
          <Text style={styles.heading}>{name}</Text>
          <Text style={styles.meta}>
            {username || "Username not set"}
            {self ? " · You" : ""}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={"Edit role for " + name}
          disabled={self || saving}
          onPress={() => {
            setEditing((value) => !value);
            setConfirming(false);
            setError("");
          }}
          style={styles.role}
        >
          <Text style={styles.roleLabel}>{user.role}</Text>
          {!self ? (
            <Feather
              name={editing ? "chevron-up" : "edit-2"}
              size={12}
              color="#8B6262"
            />
          ) : null}
        </Pressable>
      </View>
      {!self && editing ? (
        <>
          {!saving ? (
            <ChoiceField
              label="Account role"
              value={role}
              options={roles}
              onChange={(value) => {
                setRole(value);
                setConfirming(false);
                setError("");
              }}
            />
          ) : (
            <Text style={styles.body}>Saving {role} role…</Text>
          )}
          {confirming ? (
            <View style={styles.roleConfirmation}>
              <Text style={styles.heading}>
                Change {name} to {role}?
              </Text>
              <Text style={styles.body}>
                Current role: {user.role}. The new role applies at their next
                sign-in.
              </Text>
              <Pressable
                accessibilityRole="button"
                disabled={saving}
                accessibilityState={{ disabled: saving }}
                onPress={save}
                style={[styles.save, saving && styles.disabledSave]}
              >
                <Text style={styles.saveLabel}>
                  {saving ? "Saving…" : "Confirm role change"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                disabled={saving}
                onPress={() => setConfirming(false)}
                style={styles.cancelRole}
              >
                <Text style={styles.tabLabel}>Cancel</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Pressable
                accessibilityRole="button"
                disabled={saving || !role || role === user.role}
                accessibilityState={{
                  disabled: saving || !role || role === user.role,
                }}
                onPress={() => setConfirming(true)}
                style={[
                  styles.save,
                  (!role || role === user.role) && styles.disabledSave,
                ]}
              >
                <Text style={styles.saveLabel}>Save role</Text>
              </Pressable>
              {!role || role === user.role ? (
                <Text style={styles.meta}>
                  {!role
                    ? "Choose a role to continue."
                    : "Select a different role to enable Save."}
                </Text>
              ) : null}
            </>
          )}
        </>
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 0, paddingBottom: 8 },
  content: { maxWidth: 600 },
  bodyContent: { padding: 20, gap: 6 },
  header: {
    backgroundColor: "#6D0808",
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    color: "#FFF1DA",
    fontFamily: serif,
    fontWeight: "700",
    letterSpacing: 2,
    fontSize: 24,
  },
  light: {
    color: "#FFF1DA",
    fontFamily: sans,
    fontSize: 10,
    letterSpacing: 1.8,
    marginTop: 5,
  },
  avatar: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#FFF1DA55",
    backgroundColor: "#FFFFFF15",
  },
  banner: {
    backgroundColor: "#6D0808",
    paddingHorizontal: 22,
    paddingTop: 9,
    paddingBottom: 26,
    borderBottomRightRadius: 35,
  },
  eyebrow: {
    color: "#EBC9B5",
    fontFamily: sans,
    fontSize: 10,
    letterSpacing: 1.6,
  },
  welcome: {
    color: "#FFF1DA",
    fontFamily: serif,
    fontSize: 34,
    lineHeight: 37,
    letterSpacing: -0.5,
    marginTop: 13,
    marginBottom: 11,
    paddingRight: 58,
  },
  greeting: { color: "#EED9CE", fontFamily: sans, fontSize: 13 },
  stamp: {
    position: "absolute",
    right: 24,
    bottom: 33,
    width: 55,
    height: 55,
    borderRadius: 28,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#EDC3A6",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "10deg" }],
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 8,
  },
  title: {
    color: "#302525",
    fontFamily: sans,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  refresh: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minHeight: 44,
  },
  subheading: {
    color: "#302525",
    fontFamily: sans,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
  },
  card: { padding: 18, borderRadius: 18, gap: 8, marginBottom: 10 },
  heading: {
    color: "#302525",
    fontFamily: sans,
    fontSize: 13,
    fontWeight: "700",
  },
  body: {
    color: "#776564",
    fontFamily: sans,
    fontSize: 12,
    lineHeight: 18,
    marginVertical: 4,
  },
  meta: {
    color: "#776564",
    fontFamily: sans,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
  },
  amount: { color: "#6D0808", fontFamily: serif, fontSize: 34 },
  statValue: {
    color: "#6D0808",
    fontFamily: sans,
    fontSize: 21,
    fontWeight: "700",
  },
  row: { flexDirection: "row", gap: 10, marginBottom: 8 },
  flex: { flex: 1, minWidth: 0 },
  linkGroup: { borderRadius: 18, paddingHorizontal: 14, marginBottom: 8 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#D9C5C280",
  },
  person: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#F8E8DF",
    alignItems: "center",
    justifyContent: "center",
  },
  createEmployee: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 68,
    padding: 16,
    borderRadius: 18,
    marginBottom: 8,
  },
  employeeLabel: { color: "#FFFAF0", fontSize: 13, fontWeight: "700" },
  employeeHint: { color: "#F3D8CF", fontSize: 11, marginTop: 4 },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    marginBottom: 8,
  },
  search: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 12,
    color: "#302525",
    fontFamily: sans,
    fontSize: 16,
    minHeight: 46,
  },
  accountGroup: { borderRadius: 18, paddingHorizontal: 14, marginBottom: 10 },
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 68,
  },
  count: {
    backgroundColor: "#F8E8DF",
    borderRadius: 12,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  emptyGroup: {
    color: "#776564",
    fontFamily: sans,
    fontSize: 12,
    paddingVertical: 16,
    lineHeight: 18,
  },
  account: {
    paddingVertical: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#D9C5C280",
    gap: 10,
  },
  accountRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  role: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    minHeight: 44,
    paddingLeft: 8,
  },
  roleLabel: {
    color: "#6D0808",
    fontFamily: sans,
    fontSize: 11,
    textTransform: "capitalize",
  },
  ratingSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    padding: 22,
  },
  score: { color: "#6D0808", fontFamily: serif, fontSize: 40 },
  reviewTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    flexWrap: "wrap",
  },
  stars: { color: "#6D0808", fontSize: 15, letterSpacing: 2 },
  dishes: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "#D9C5C280",
    paddingTop: 12,
    marginTop: 5,
    gap: 6,
  },
  dishLabel: {
    color: "#776564",
    fontFamily: sans,
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 2,
  },
  dishName: {
    color: "#302525",
    fontFamily: sans,
    fontSize: 13,
    fontWeight: "500",
  },
  quote: {
    color: "#302525",
    fontFamily: serif,
    fontStyle: "italic",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 5,
  },
  filter: {
    borderWidth: 1,
    borderColor: "#D9C5C280",
    borderRadius: 22,
    paddingHorizontal: 15,
    minHeight: 44,
    justifyContent: "center",
  },
  selected: { backgroundColor: "#6D0808" },
  filterLabel: { color: "#776564", fontFamily: sans, fontSize: 12 },
  filterActive: { color: "#FFF8ED", fontFamily: sans, fontSize: 12 },
  footer: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 14 },
  tabs: {
    flexDirection: "row",
    padding: 6,
    gap: 4,
    borderRadius: 28,
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: "center",
    borderRadius: 23,
    gap: 5,
  },
  navLabel: { fontFamily: sans, color: "#776564", fontSize: 10 },
  navActive: { fontFamily: sans, color: "#FFF8ED", fontSize: 10 },
  roleConfirmation: {
    borderWidth: 1,
    borderColor: "#D9C9B8",
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  disabledSave: { opacity: 0.45 },
  cancelRole: { minHeight: 44, alignItems: "center", justifyContent: "center" },
  save: {
    backgroundColor: "#6D0808",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  saveLabel: {
    color: "#FFF8ED",
    fontFamily: sans,
    fontSize: 13,
    fontWeight: "700",
  },
  logout: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  error: {
    color: "#B42318",
    fontFamily: sans,
    fontSize: 13,
    marginVertical: 8,
  },
});
