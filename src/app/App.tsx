import api from "@/api/baseApi";
import Sidebar from "@/components/sidebar/Sidebar";
import AppRoutes from "@/routes";
import React from "react";

const App: React.FC = () => {
  //const { logoutContext } = useAuth();

  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error?.response && error?.response?.status === 401) {
        // logoutContext();
      }
      return Promise.reject(error);
    }
  );

  return (
    <div className="min-w-[100vw] min-h-dvh ">
      <Sidebar>
        <AppRoutes />
      </Sidebar>
    </div>
  );
};

export default App;
