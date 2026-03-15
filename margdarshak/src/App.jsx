import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import MargDarshak from "./pages/MargDarshak";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Login />} />
        <Route path="/dashboard" element={<MargDarshak />} />
      </Routes>
    </BrowserRouter>
  );
}