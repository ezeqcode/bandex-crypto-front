import React from "react";
// import { NavLink } from "react-router-dom";
// import { useTheme } from "@/contexts/Theme";
// import { useAuth } from "@/contexts/Auth";


interface SidebarProps {
  children: any;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  // const { token, logoutContext } = useAuth();
  // const { darkModeHandler, isLight } = useTheme();

  // SEM TOKEN
  if (true) {
    return (
      <div className="">
        <div className="w-full h-full max-h-full  overflow-y-auto ">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-w-full min-h-dvh flex  flex-col-reverse sm:flex-row  
    dark:text-primary-text-dark-100 text-primary-text-light-100 h-[100dvh]"
    >
      <div
        className="min-w-24 dark:bg-primary-dark-100 bg-primary-light-100 flex  flex-col justify-evenly xl:justify-between items-center py-1 xl:py-4 
        shadow-sidebar min-h-[18dvh] max-h-[18dvh] sm:max-h-full"
      ></div>

      <div className="dark:bg-primary-dark-500 bg-primary-light-500 w-full h-full max-h-full flex ">
        <div
          className={`w-full h-full   overflow-y-auto max-h-[82dvh] md:max-h-[100dvh]`}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
