import logo from './logo.svg';
import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

export default App;

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BrowserRouter, Link, NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, CalendarDays, ChevronRight, CircleDollarSign, Home, LogIn, LogOut, Plus, ReceiptText, Trash2, UserPlus, WalletCards } from "lucide-react";
import { Toaster, toast } from "sonner";
import "@/App.css";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const CATEGORIES = ["Food", "Transport", "Study", "Entertainment", "Other"];
const categoryColors = { Food: "coral", Transport: "blue", Study: "green", Entertainment: "gold", Other: "ink" };
const apiConfig = { withCredentials: true };
const formatApiError = (detail) => { if (!detail) return "Something went wrong. Please try again."; if (typeof detail === "string") return detail; if (Array.isArray(detail)) return detail.map((item) => item?.msg || JSON.stringify(item)).join(" "); return detail.msg || String(detail); };

const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0);
const prettyDate = (value) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`));

function AppShell({ user, expenses, addExpense, deleteExpense, onLogout }) {
  return <div className="app-shell"><div className="grain" aria-hidden="true" />
    <header className="site-header"><div className="header-inner">
      <Link to="/" className="brand" data-testid="brand-link"><span className="brand-mark"><ReceiptText size={18} /></span><span>Student<span className="brand-accent">Expense</span>Tracker</span></Link>
      <div className="sidebar-label">Workspace</div>
      <nav className="desktop-nav" aria-label="Primary navigation">
        <NavLink to="/" end data-testid="nav-home-link"><Home size={17} />Overview</NavLink><NavLink to="/add" data-testid="nav-add-expense-link"><Plus size={17} />Add expense</NavLink><NavLink to="/dashboard" data-testid="nav-dashboard-link"><BarChart3 size={17} />Dashboard</NavLink>
      </nav>
      <Link to="/add" className="header-cta" data-testid="nav-add-expense-button"><Plus size={17} /> <span>New expense</span></Link>
      <div className="sidebar-footer"><span className="status-dot" /><span className="user-label">{user?.name || user?.email || "Signed in"}</span><button className="logout-button" onClick={onLogout} data-testid="logout-button" title="Log out"><LogOut size={14} /></button></div>
    </div></header>
    <main className="page-wrap"><Routes>
      <Route path="/" element={<HomeView expenses={expenses} />} />
      <Route path="/add" element={<ExpenseForm onAdd={addExpense} />} />
      <Route path="/dashboard" element={<DashboardView expenses={expenses} onDelete={deleteExpense} />} />
    </Routes></main>
    <nav className="mobile-nav" aria-label="Mobile navigation"><NavLink to="/" end data-testid="mobile-nav-home"><Home size={18} /><span>Home</span></NavLink><NavLink to="/add" data-testid="mobile-nav-add"><Plus size={18} /><span>Add</span></NavLink><NavLink to="/dashboard" data-testid="mobile-nav-dashboard"><BarChart3 size={18} /><span>Dashboard</span></NavLink></nav>
    <Toaster position="bottom-right" toastOptions={{ className: "app-toast" }} />
  </div>;
}

function PageIntro({ eyebrow, title, copy }) { return <div className="page-intro reveal"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{copy && <p className="intro-copy">{copy}</p>}</div>; }

function HomeView({ expenses }) {
  const navigate = useNavigate();
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);
  const recent = expenses.slice(0, 3);
  return <div className="home-view"><section className="home-hero"><div className="hero-copy reveal"><div className="welcome-line"><span className="welcome-avatar">SE</span><span>Welcome back</span></div><p className="eyebrow">Your everyday money, made clearer</p><h1 data-testid="home-welcome-heading">Make every<br /><em>dollar count.</em></h1><p className="intro-copy">Track the little things, understand your habits, and make student life feel a little more in control.</p><button className="primary-button" onClick={() => navigate("/add")} data-testid="home-add-expense-button"><Plus size={17} /> Add an expense</button></div><div className="hero-note reveal delay-one"><div className="note-top"><span className="note-label">Total tracked</span><CircleDollarSign size={21} /></div><strong data-testid="home-total-expenses">{money(total)}</strong><span className="note-foot">{expenses.length ? `${expenses.length} ${expenses.length === 1 ? "entry" : "entries"} recorded` : "Ready for your first entry"}</span><div className="rule-line" /><div className="note-status"><span className="status-dot" />Private to your account</div></div></section>
    <section className="home-stats reveal delay-one"><div className="stat-card stat-blue"><span className="stat-icon"><WalletCards size={18} /></span><div><span>Entries recorded</span><strong data-testid="home-entry-count">{expenses.length}</strong></div></div><div className="stat-card stat-coral"><span className="stat-icon"><BarChart3 size={18} /></span><div><span>Categories used</span><strong data-testid="home-category-count">{new Set(expenses.map((item) => item.category)).size}</strong></div></div><Link to="/dashboard" className="stat-card stat-action" data-testid="home-view-dashboard-link"><span className="stat-icon"><ArrowRight size={18} /></span><div><span>See the bigger picture</span><strong>Open dashboard</strong></div><ChevronRight size={18} /></Link></section>
    <section className="recent-section reveal delay-two"><div className="section-heading"><div><p className="eyebrow">A quick look</p><h2>Recent expenses</h2></div><Link to="/dashboard" className="text-link" data-testid="home-recent-view-link">View all <ChevronRight size={16} /></Link></div>{recent.length ? <div className="recent-list">{recent.map((item) => <ExpenseRow key={item.id} expense={item} compact />)}</div> : <div className="empty-strip" data-testid="home-empty-expenses"><WalletCards size={24} /><div><strong>Your ledger is waiting.</strong><span>Add your first expense to start seeing your spending clearly.</span></div><Link to="/add" className="small-button" data-testid="home-empty-add-button">Get started <ArrowRight size={15} /></Link></div>}</section>
  </div>;
}

function ExpenseForm({ onAdd }) {
  const navigate = useNavigate(); const [form, setForm] = useState({ name: "", amount: "", category: "", date: new Date().toISOString().slice(0, 10) }); const [error, setError] = useState("");
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = (event) => { event.preventDefault(); const amount = Number(form.amount); if (!form.name.trim() || !form.amount || !form.category || !form.date) return setError("Please complete every field before saving."); if (!Number.isFinite(amount) || amount < 0) return setError("Enter a valid amount of $0 or more."); onAdd({ ...form, name: form.name.trim(), amount }); toast.success("Expense added", { id: "toast-success" }); navigate("/dashboard"); };
  return <div className="form-page"><PageIntro eyebrow="Keep a simple record" title={<>Add an <em>expense.</em></>} copy="Capture the details while they’re fresh. It only takes a few seconds." /><form className="expense-form reveal delay-one" onSubmit={submit} data-testid="expense-form" noValidate><div className="form-section-label">Expense details</div><div className="field full-field"><label htmlFor="expense-name">What did you spend on?</label><input id="expense-name" data-testid="expense-name-input" value={form.name} onChange={update("name")} placeholder="e.g. Lunch with friends" autoComplete="off" /></div><div className="field-grid"><div className="field"><label htmlFor="expense-amount">Amount</label><div className="input-prefix"><span>$</span><input id="expense-amount" data-testid="expense-amount-input" type="number" min="0" step="0.01" value={form.amount} onChange={update("amount")} placeholder="0.00" /></div></div><div className="field"><label htmlFor="expense-date">Date</label><div className="input-prefix date-prefix"><CalendarDays size={16} /><input id="expense-date" data-testid="expense-date-picker" type="date" value={form.date} onChange={update("date")} /></div></div></div><div className="field"><label htmlFor="expense-category">Category</label><select id="expense-category" data-testid="expense-category-select" value={form.category} onChange={update("category")}><option value="">Choose a category</option>{CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}</select></div>{error && <p className="form-error" role="alert" data-testid="expense-form-error">{error}</p>}<div className="form-actions"><button className="primary-button" type="submit" data-testid="expense-form-submit-button"><Plus size={17} /> Save expense</button><button type="button" className="quiet-button" onClick={() => navigate(-1)} data-testid="expense-form-cancel-button">Cancel</button></div></form></div>;
}

function DashboardView({ expenses, onDelete }) {
  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0); const byCategory = useMemo(() => CATEGORIES.map((category) => ({ category, amount: expenses.filter((item) => item.category === category).reduce((sum, item) => sum + Number(item.amount), 0) })).filter((item) => item.amount > 0), [expenses]); const maxCategory = Math.max(...byCategory.map((item) => item.amount), 1);
  return <div className="dashboard-page"><PageIntro eyebrow="Your spending at a glance" title={<>The <em>dashboard.</em></>} copy="A calm, clear view of where your money is going." /><section className="metric-band reveal delay-one"><div><p className="eyebrow">Total expenses</p><strong data-testid="dashboard-total-expenses">{money(total)}</strong></div><div className="metric-side"><span>{expenses.length} {expenses.length === 1 ? "expense" : "expenses"}</span><span className="metric-dot" /> <span>private to your account</span></div></section><div className="dashboard-grid"><section className="table-section reveal delay-two"><div className="section-heading"><div><p className="eyebrow">Your ledger</p><h2>All expenses</h2></div></div>{expenses.length ? <div className="expense-table-wrap"><table className="expense-table" data-testid="expense-table"><caption className="sr-only">All recorded expenses</caption><thead><tr><th scope="col">Expense</th><th scope="col">Category</th><th scope="col">Date</th><th scope="col" className="amount-cell">Amount</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{expenses.map((item) => <tr key={item.id} data-testid={`expense-row-${item.id}`}><td className="expense-name"><span className={`category-mark ${categoryColors[item.category]}`} />{item.name}</td><td><span className={`category-chip ${categoryColors[item.category]}`}>{item.category}</span></td><td className="date-cell">{prettyDate(item.date)}</td><td className="amount-cell">{money(item.amount)}</td><td><button className="icon-button" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.name}`} data-testid={`expense-delete-button-${item.id}`}><Trash2 size={16} /></button></td></tr>)}</tbody></table></div> : <EmptyState />}</section><CategorySummary byCategory={byCategory} maxCategory={maxCategory} /></div></div>;
}

function CategorySummary({ byCategory, maxCategory }) { return <aside className="category-summary reveal delay-three" data-testid="dashboard-category-summary"><div className="section-heading"><div><p className="eyebrow">By category</p><h2>Where it goes</h2></div></div>{byCategory.length ? <div className="category-list">{byCategory.map(({ category, amount }) => <div className="category-item" key={category}><div className="category-line"><span>{category}</span><strong>{money(amount)}</strong></div><div className="meter"><span className={`meter-fill ${categoryColors[category]}`} style={{ width: `${(amount / maxCategory) * 100}%` }} /></div></div>)}</div> : <p className="muted-copy">Category totals will appear after your first expense.</p>}</aside>; }
function ExpenseRow({ expense, compact }) { return <div className={`expense-row ${compact ? "compact" : ""}`} data-testid={compact ? `recent-expense-${expense.id}` : undefined}><span className={`category-mark ${categoryColors[expense.category]}`} /><div><strong>{expense.name}</strong><span>{expense.category} · {prettyDate(expense.date)}</span></div><b>{money(expense.amount)}</b></div>; }
function EmptyState() { return <div className="empty-state" data-testid="empty-expenses-state"><WalletCards size={28} /><strong>No expenses yet</strong><span>Start with your latest coffee, bus ride, or study supply.</span><Link to="/add" className="small-button" data-testid="empty-add-expense-button">Add first expense <ArrowRight size={15} /></Link></div>; }

function AuthView({ mode, onSuccess }) {
  const navigate = useNavigate(); const isRegister = mode === "register"; const [form, setForm] = useState({ name: "", email: "", password: "" }); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (event) => { event.preventDefault(); setError(""); setLoading(true); try { const endpoint = isRegister ? "/auth/register" : "/auth/login"; const payload = isRegister ? form : { email: form.email, password: form.password }; await axios.post(`${API}${endpoint}`, payload, apiConfig); await onSuccess(); navigate("/dashboard"); } catch (requestError) { setError(formatApiError(requestError.response?.data?.detail)); } finally { setLoading(false); } };
  return <div className="auth-page"><div className="auth-brand"><span className="brand-mark"><ReceiptText size={18} /></span><span>Student<span className="brand-accent">Expense</span>Tracker</span></div><div className="auth-layout"><div className="auth-copy"><p className="eyebrow">Your money, your view</p><h1>{isRegister ? <>Start your<br /><em>ledger.</em></> : <>Welcome<br /><em>back.</em></>}</h1><p>{isRegister ? "Create a private account and make every dollar count." : "Sign in to pick up where you left off."}</p></div><form className="auth-form" onSubmit={submit} data-testid={isRegister ? "register-form" : "login-form"}><div className="auth-icon">{isRegister ? <UserPlus size={22} /> : <LogIn size={22} />}</div><h2>{isRegister ? "Create your account" : "Sign in to your account"}</h2>{isRegister && <div className="field"><label htmlFor="auth-name">Name</label><input id="auth-name" data-testid="auth-name-input" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Your name" autoComplete="name" required /></div>}<div className="field"><label htmlFor="auth-email">Email</label><input id="auth-email" data-testid="auth-email-input" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" autoComplete="email" required /></div><div className="field"><label htmlFor="auth-password">Password</label><input id="auth-password" data-testid="auth-password-input" type="password" minLength="8" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" autoComplete={isRegister ? "new-password" : "current-password"} required /></div>{error && <p className="form-error" role="alert" data-testid="auth-error">{error}</p>}<button className="primary-button auth-submit" type="submit" disabled={loading} data-testid={isRegister ? "register-submit-button" : "login-submit-button"}>{loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}</button><p className="auth-switch">{isRegister ? "Already have an account?" : "New to StudentExpenseTracker?"} <button type="button" onClick={() => navigate(isRegister ? "/login" : "/register")} data-testid="auth-switch-button">{isRegister ? "Sign in" : "Create an account"}</button></p></form></div></div>;
}

function LoadingScreen() { return <div className="loading-screen" data-testid="auth-loading">Checking your account...</div>; }

export default function App() {
  const [authState, setAuthState] = useState(null); const [user, setUser] = useState(null); const [expenses, setExpenses] = useState([]);
  const loadSession = async () => { try { const response = await axios.get(`${API}/auth/me`, apiConfig); setUser(response.data); setAuthState(true); const expenseResponse = await axios.get(`${API}/expenses`, apiConfig); setExpenses(Array.isArray(expenseResponse.data) ? expenseResponse.data : expenseResponse.data.expenses || []); } catch { setUser(null); setAuthState(false); } };
  useEffect(() => { loadSession(); }, []);
  const addExpense = async (expense) => { try { const response = await axios.post(`${API}/expenses`, expense, apiConfig); const saved = response.data.expense || response.data; setExpenses((items) => [saved, ...items]); } catch (error) { toast.error(formatApiError(error.response?.data?.detail)); } };
  const deleteExpense = async (id) => { if (!window.confirm("Delete this expense?")) return; try { await axios.delete(`${API}/expenses/${id}`, apiConfig); setExpenses((items) => items.filter((item) => item.id !== id && item._id !== id)); toast.success("Expense deleted"); } catch (error) { toast.error(formatApiError(error.response?.data?.detail)); } };
  const logout = async () => { try { await axios.post(`${API}/auth/logout`, {}, apiConfig); } finally { setUser(null); setAuthState(false); } };
  return <BrowserRouter><Routes><Route path="/login" element={authState === true ? <Navigate to="/dashboard" replace /> : <AuthView mode="login" onSuccess={loadSession} />} /><Route path="/register" element={authState === true ? <Navigate to="/dashboard" replace /> : <AuthView mode="register" onSuccess={loadSession} />} /><Route path="*" element={authState === null ? <LoadingScreen /> : authState ? <AppShell user={user} expenses={expenses} addExpense={addExpense} deleteExpense={deleteExpense} onLogout={logout} /> : <Navigate to="/login" replace />} /></Routes></BrowserRouter>;
} 
