import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";

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

  // ✅ DARK MODE (PERSISTED)
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const toggleDark = () => {
    const newMode = !dark;
    setDark(newMode);

    if (newMode) {
      localStorage.setItem("theme", "dark");
    } else {
      localStorage.setItem("theme", "light");
    }
  };

  // ✅ UI STATE
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);

  // ✅ PAGE TITLE
  const getTitle = () => {
    if (location.pathname === "/users") return "Users";
    return "Dashboard";
  };

  // =========================
  return (
    <div className={dark ? "dark" : ""}>

      <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">

        {/* ================= SIDEBAR ================= */}
        <div
          className={`${collapsed ? "w-16" : "w-64"}
          bg-white dark:bg-gray-800
          shadow-md p-4 flex flex-col
          transition-all duration-300`}
        >

          {/* LOGO */}
          <h2
            className={`text-xl font-semibold mb-8
            text-black dark:text-white
            ${collapsed && "hidden"}`}
          >
            Palantir App
          </h2>

          {/* NAV */}
          <nav className="flex flex-col gap-2">

            {/* DASHBOARD */}
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`
              }
            >
              <HomeIcon className="w-5 h-5" />
              {!collapsed && "Dashboard"}
            </NavLink>

            {/* USERS */}
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`
              }
            >
              <UsersIcon className="w-5 h-5" />
              {!collapsed && "Users"}
            </NavLink>

            {/* SETTINGS */}
            <div className="flex items-center gap-2 px-3 py-2 mt-4
              text-gray-400 dark:text-gray-500">
              <Cog6ToothIcon className="w-5 h-5" />
              {!collapsed && "Settings"}
            </div>

          </nav>

          {/* FOOTER */}
          <div className="mt-auto text-xs pt-6 text-center
            text-gray-400 dark:text-gray-500">
            {!collapsed && "v1.0"}
          </div>

        </div>

        {/* ================= MAIN ================= */}
        <div className="flex-1 flex flex-col">

          {/* HEADER */}
          <div className="bg-white dark:bg-gray-800 shadow px-6 py-4 flex justify-between items-center">

            {/* LEFT */}
            <div className="flex items-center gap-3">

              <button onClick={() => setCollapsed(!collapsed)}>
                <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
              </button>

              <h1 className="text-lg font-semibold text-black dark:text-white">
                {getTitle()}
              </h1>

            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4">

              {/* ✅ DARK MODE TOGGLE */}
              <button onClick={toggleDark}>
                {dark
                  ? <SunIcon className="w-6 h-6 text-yellow-400" />
                  : <MoonIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                }
              </button>

              {/* PROFILE */}
              <div className="relative">

                <div
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <UserCircleIcon className="w-7 h-7 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {userEmail}
                  </span>
                </div>

                {/* DROPDOWN */}
                {open && (
                  <div className="absolute right-0 mt-2 w-40
                    bg-white dark:bg-gray-700
                    shadow rounded">

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
          <div className="p-6 max-w-5xl mx-auto w-full
            text-black dark:text-white">
            {children}
          </div>

        </div>

      </div>

    </div>
  );
}