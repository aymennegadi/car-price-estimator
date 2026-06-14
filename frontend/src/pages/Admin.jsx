import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:3001";

export default function Admin() {
  const [token, setToken] = useState(localStorage.getItem("adminToken"));
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [estimations, setEstimations] = useState([]);
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "" });
  const [passwordMsg, setPasswordMsg] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchUsers();
      fetchEstimations();
    }
  }, [token]);

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/admin/login`, loginForm);
      localStorage.setItem("adminToken", res.data.token);
      setToken(res.data.token);
      setLoginError("");
    } catch {
      setLoginError("Invalid email or password");
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken(null);
  };

  const fetchStats = async () => {
    const res = await axios.get(`${API}/admin/stats`, { headers });
    setStats(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get(`${API}/admin/users`, { headers });
    setUsers(res.data);
  };

  const fetchEstimations = async () => {
    const res = await axios.get(`${API}/admin/estimations`, { headers });
    setEstimations(res.data);
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${API}/admin/password`, passwordForm, { headers });
      setPasswordMsg("✅ Password updated successfully!");
      setPasswordForm({ oldPassword: "", newPassword: "" });
    } catch {
      setPasswordMsg("❌ Wrong current password");
    }
  };

  // Login page
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center text-blue-700 mb-6">
            🔐 Admin Login
          </h1>
          {loginError && <p className="text-red-500 text-sm mb-4">{loginError}</p>}
          <form onSubmit={login} className="space-y-4">
            <input type="email" placeholder="Email" value={loginForm.email}
              onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <input type="password" placeholder="Password" value={loginForm.password}
              onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
              className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            <button type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">🚗 EstiAuto DZ</h1>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: "dashboard", label: "📊 Dashboard" },
            { id: "users", label: "👥 Users" },
            { id: "estimations", label: "🔍 Estimations" },
            { id: "settings", label: "⚙️ Settings" },
          ].map(item => (
            <button key={item.id} onClick={() => setTab(item.id)}
              className={`w-full text-left px-4 py-2 rounded-lg transition ${
                tab === item.id ? "bg-blue-600" : "hover:bg-gray-700"
              }`}>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button onClick={logout}
            className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-700 text-red-400">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8 overflow-auto">

        {/* Dashboard */}
        {tab === "dashboard" && stats && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

            {/* Stats cards */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow">
                <p className="text-gray-500 text-sm">Total Users</p>
                <p className="text-4xl font-bold text-blue-600 mt-1">{stats.totalUsers}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <p className="text-gray-500 text-sm">Total Estimations</p>
                <p className="text-4xl font-bold text-green-600 mt-1">{stats.totalEstimations}</p>
              </div>
            </div>

            {/* Top marques */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="font-semibold text-gray-700 mb-4">🏆 Top Brands</h3>
                {stats.marques.map((m, i) => (
                  <div key={i} className="flex justify-between py-1 text-sm border-b">
                    <span>{m.marque}</span>
                    <span className="font-semibold text-blue-600">{m._count.marque}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-xl p-6 shadow">
                <h3 className="font-semibold text-gray-700 mb-4">📍 Top Wilayas</h3>
                {stats.wilayas.map((w, i) => (
                  <div key={i} className="flex justify-between py-1 text-sm border-b">
                    <span>{w.wilaya}</span>
                    <span className="font-semibold text-green-600">{w._count.wilaya}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent estimations */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h3 className="font-semibold text-gray-700 mb-4">🕐 Recent Estimations</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="pb-2">User</th>
                    <th className="pb-2">Car</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentEstimations.map((e, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2">{e.user.prenom} {e.user.nom}</td>
                      <td className="py-2">{e.marque} {e.modele} {e.annee}</td>
                      <td className="py-2 font-semibold text-blue-600">{e.prix.toLocaleString()} DA</td>
                      <td className="py-2 text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users */}
        {tab === "users" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Users ({users.length})</h2>
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-500">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Estimations</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="p-4 font-medium">{u.prenom} {u.nom}</td>
                      <td className="p-4 text-gray-500">{u.email}</td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold">
                          {u.estimations.length}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Estimations */}
        {tab === "estimations" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Estimations ({estimations.length})</h2>
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left text-gray-500">
                    <th className="p-4">User</th>
                    <th className="p-4">Car</th>
                    <th className="p-4">KM</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Comment</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {estimations.map((e, i) => (
                    <tr key={i} className="border-t hover:bg-gray-50">
                      <td className="p-4 font-medium">{e.user.prenom} {e.user.nom}</td>
                      <td className="p-4">{e.marque} {e.modele} {e.annee}</td>
                      <td className="p-4 text-gray-500">{e.km.toLocaleString()} km</td>
                      <td className="p-4 font-semibold text-blue-600">{e.prix.toLocaleString()} DA</td>
                      <td className="p-4 text-gray-400 italic">{e.commentaire || "—"}</td>
                      <td className="p-4 text-gray-400">{new Date(e.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings */}
        {tab === "settings" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Settings</h2>
            <div className="bg-white rounded-xl p-6 shadow max-w-md">
              <h3 className="font-semibold text-gray-700 mb-4">🔑 Change Password</h3>
              {passwordMsg && <p className="text-sm mb-4">{passwordMsg}</p>}
              <form onSubmit={changePassword} className="space-y-4">
                <input type="password" placeholder="Current Password"
                  value={passwordForm.oldPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <input type="password" placeholder="New Password"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                <button type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Update Password
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}