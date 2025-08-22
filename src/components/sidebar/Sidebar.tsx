import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  children: any;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const { user, logout, hasPermission } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      permission: null,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v4H8V5z" />
        </svg>
      ),
    },
    {
      name: "Usuários",
      path: "/users",
      permission: "users:read",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      name: "Clientes",
      path: "/customers",
      permission: "customers:read",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      name: "Invoices",
      path: "/invoices",
      permission: "invoices:read",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: "Webhooks",
      path: "/webhooks",
      permission: "webhooks:read",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
    },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    const hasAccess = !item.permission || hasPermission(item.permission);
    console.log(`Menu item: ${item.name}, Permission: ${item.permission}, Has access: ${hasAccess}`);
    return hasAccess;
  });

  return (
    <div className="min-h-screen flex bg-gray-50 overflow-x-hidden">
      {/* Sidebar */}
      <div className="bg-white border-r border-gray-200 w-16 flex flex-col relative z-10">
        <div className="flex flex-col h-full">
          {/* User Avatar */}
          <div className="p-4 flex justify-center">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2">
            <div className="space-y-2">
              {filteredMenuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `group relative flex justify-center items-center p-3 rounded-xl transition-all duration-200 ${
                      isActive ? "bg-orange-500 text-white shadow-lg" : "text-gray-600 hover:bg-gray-100"
                    }`
                  }
                  title={item.name}
                >
                  {item.icon}
                  {/* Tooltip: não afeta largura da página */}
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 translate-x-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                    {item.name}
                  </div>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Settings */}
          <div className="p-2">
            <button className="w-full flex justify-center items-center p-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors group relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 translate-x-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                Configurações
              </div>
            </button>
          </div>

          {/* User Status */}
          <div className="p-2 border-t border-gray-200">
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <div className="absolute top-0 left-0 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <div className="p-2">
            <button
              onClick={logout}
              className="w-full flex justify-center items-center p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors group relative"
              title="Sair"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 translate-x-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                Sair
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {children}
      </div>
    </div>
  );
};

export default Sidebar;