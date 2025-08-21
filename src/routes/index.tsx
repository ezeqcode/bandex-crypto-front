import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Suspense></Suspense>} />
    </Routes>
  );
};

export default AppRoutes;
