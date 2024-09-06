import { useState } from 'react';
import './App.css';
import Login from "./components/login/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome to the home page!</p>
    </div>
  );
}

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
