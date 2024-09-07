import { useState } from 'react';
import './App.css';
import Login from "./components/login/Login";
import SignUp from "./components/signUp/SignUp";
import ProviderHomePage from "./components/foodProvider/providerHomePage/providerHome";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/providerHomePage" element={<ProviderHomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
