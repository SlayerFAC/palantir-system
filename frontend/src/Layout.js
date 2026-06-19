import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import {
  HomeIcon,
  UsersIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  Bars3Icon,
  MoonIcon,
  SunIcon
} from "@heroicons/react/24/outline";

export default function Layout({ children, userEmail }) {

  const location = useLocation();
  const dropdownRef = useRef();

  // =========================
  // DARK MODE (FIXED INIT)
  // =========================
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [dark]);

  const toggleDark = () => {
    const newMode = !dark;
    setDark(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  // =========================
  // UI STATE
  // =========================
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // =========================
  // PAGE TITLE
  // =========================
  const getTitle = () => {
    if (location.pathname === "/users") return "Users";
    return "Dashboard";
  };

  // =========================
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">

      {/* ================= SIDEBAR ================= */}
      <div
        className={`${collapsed ? "w-16" : "w-64"}
        bg-white dark:bg-gray-800
        shadow-md p-4 flex flex-col
        transition-all duration-300`}
      >

        {/* LOGO */}
        <h2
          className={`text-xl font-semibold mb-8 text-black dark:text-white transition
          ${collapsed && "opacity-0"}`}
        >
          Palantir
        </h2>

        {/* NAV */}
        <nav className="flex flex-col gap-2">

          <NavItem to="/" label="Dashboard" icon={HomeIcon} collapsed={collapsed} />
          <NavItem to="/users" label="Users" icon={UsersIcon} collapsed={collapsed} />

        </nav>

        {/* SETTINGS (disabled style) */}
        <div className="mt-6 text-gray-400 dark:text-gray-500 flex items-center gap-2 px-3">
          <Cog6ToothIcon className="w-5 h-5" />
          {!collapsed && "Settings"}
        </div>

        {/* FOOTER */}
        <div className="mt-auto text-xs pt-6 text-center text-gray-400 dark:text-gray-500">
          {!collapsed && "v1.0"}
        </div>

      </div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">

        {/* HEADER */}
        <div className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center">

          {/* LEFT */}
          <div className="flex items-center gap-4">

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition"
            >
              <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </button>

            <h1 className="text-lg font-semibold text-black dark:text-white">
              {getTitle()}
            </h1>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-4">

            {/* DARK MODE */}
            <button
              onClick={toggleDark}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded transition"
            >
              {dark
                ? <SunIcon className="w-6 h-6 text-yellow-400" />
                : <MoonIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              }
            </button>

            {/* PROFILE */}
            <div ref={dropdownRef} className="relative">

              <div
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded transition"
              >
                <UserCircleIcon className="w-7 h-7 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {userEmail}
                </span>
              </div>

              {/* DROPDOWN */}
              {open && (
                <div
                  className="absolute right-0 mt-2 w-40
                  bg-white dark:bg-gray-700
                  shadow-lg rounded
                  animate-fadeIn"
                >
                  <button
                    onClick={() => {
                      fetch("http://localhost:8000/logout", {
                        credentials: "include"
                      });
                      window.location.href = "/login";
                    }}
                    className="block w-full text-left px-4 py-2 text-sm
                    text-black dark:text-white
                    hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    Logout
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

        {/* CONTENT */}
        <div className="p-6 max-w-5xl mx-auto w-full text-black dark:text-white">
          {children}
        </div>

      </div>

    </div>
  );
}


// =========================
// NAV ITEM COMPONENT ✅
// =========================
function NavItem({ to, label, icon: Icon, collapsed }) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded transition
        ${isActive
          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"}`
      }
    >
      <Icon className="w-5 h-5" />
      {!collapsed && label}
    </NavLink>
  );
}