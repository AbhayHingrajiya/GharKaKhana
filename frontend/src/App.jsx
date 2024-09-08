import { useState, useEffect } from 'react';
import './App.css';
import axios from "axios";
import Login from "./components/login/Login";
import SignUp from "./components/signUp/SignUp";
import ProviderHomePage from "./components/foodProvider/providerHomePage/providerHome";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ClimbingBoxLoader } from "react-spinners";

function App() {
  const [isLogedIn, setIsLogedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      setIsLoading(true);
      try {
        const res = await axios.post('/api/getMe');
        if (res.status === 200) {
          console.log(res.data);
          setIsLogedIn(true);
          setUserType(res.data.type)
        }
      } catch (error) {
        console.log('Error in checking login status');
      }
      setIsLoading(false);
    };
    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen overflow-hidden">
        <ClimbingBoxLoader color={'#123abc'} />
      </div>
    );
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={!isLogedIn ? (
                                  <Login />
                                // ) : userType == 'foodConsumer' ? (
                                //   <ConsumerHomePage />
                                // ) : userType == 'deliveryBoy' ? (
                                //   <DeliveryHomePage />
                                ) : userType == 'foodProvider' ? (
                                  <ProviderHomePage />
                                ) : (
                                  <Login />
                                )
                              } />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/providerHomePage" element={isLogedIn ? <ProviderHomePage /> : <Login />} />
      </Routes>
    </Router>
  );
}

export default App;
