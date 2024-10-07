import { useState, useEffect } from 'react';
import './App.css';
import axios from "axios";
import Login from "./components/login/Login";
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from './redux/auth/auth';
import SignUp from "./components/signUp/SignUp";
import ProviderHomePage from "./components/foodProvider/providerHomePage/providerHome";
import AdminDashboard from './components/admin/AdminDashboard';
import ProviderOrderList from "./components/foodProvider/providerOrderList/ProviderOrderList";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ClimbingBoxLoader } from "react-spinners";
import ConsumerHomePage from './components/foodConsumer/consumerHomePage/ConsumerHomePage'

function App() {
  const user = useSelector((state) => state.user);
  const [isLogedIn, setIsLogedIn] =  useState(user.isLogedin);
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    setIsLogedIn(user.isLogedin);
  }, [user.isLogedin] )

  useEffect(() => {
    const checkLoginStatus = async () => {
      setIsLoading(true);
      try {
        const res = await axios.post('/api/getMe');
        if (res.status === 200) {
          console.log(res.data);
          setIsLogedIn(true);
          setUserType(res.data.type)
          dispatch(setUser({
            name: res.data.name,
            email: res.data.email,
            isLogedin: true,
            userType: res.data.type
          }));
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
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signUp" element={<SignUp />} />
        <Route path="/providerHomePage" element={isLogedIn ? <ProviderHomePage /> : <Login />} />
        <Route path="/providerOrderList" element={isLogedIn ? <ProviderOrderList /> : <Login />} />
        <Route path="/consumerHomePage" element={isLogedIn ? <ConsumerHomePage /> : <Login />} />
      </Routes>
    </Router>
  );
}

export default App;
