import React, { useState } from 'react';
import fullLogo from '../../assets/logoBlack.png';
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/auth/auth';

const ProviderNavbar = ( {activeLink} ) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const signOut = async () =>{
    try{
      const response = await axios.post('/api/signOut');
      if(response.status === 200){
        dispatch(logout());
        navigate('/login');
      }else{
        console.log('Something is wrong in signout request');
      }
    }catch(error){
      console.log("Error in signOut: "+error);
    }
  }

  return (
    <nav className="bg-white fixed w-full z-20 top-0 left-0 border-b border-gray-200">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo */}
        <a href="/" className="flex items-center space-x-3">
          <img src={fullLogo} className="h-12" alt="Logo" />
          <span className="self-center text-2xl font-semibold whitespace-nowrap">Ghar Ka Khana</span>
        </a>

        {/* Menu Toggle */}
        <div className="flex md:hidden">
          <button
            data-collapse-toggle="navbar-sticky"
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="navbar-sticky"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>

        {/* Navigation Links */}
        <div className={`items-center justify-between ${isMenuOpen ? 'block' : 'hidden'} w-full md:flex md:w-auto`} id="navbar-sticky">
          <ul className="flex flex-col cursor-pointer p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 md:flex-row md:mt-0 md:border-0 md:bg-white">
            <li>
              <a className={`${(activeLink === 'home') 
              ? 'block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0' 
              : "block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0" }`}
              onClick={() => 
                user.userType === 'foodProvider' 
                  ? navigate('/providerHomePage') 
                  : user.userType === 'foodConsumer' 
                  ? navigate('/consumerHomePage') 
                  : navigate('/deliveryBoyHomePage')
              }
              >
                Home
              </a>
            </li>
            <li>
              <a className={`${(activeLink === 'order') 
              ? 'block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0' 
              : "block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0" }`}
              onClick={() => 
                user.userType === 'foodProvider' 
                  ? navigate('/providerOrderList') 
                  : user.userType === 'foodConsumer' 
                  ? navigate('/consumerOrderList') 
                  : navigate('/deliveryBoyOrderPage')
              }
              >
                Orders
              </a>
            </li>
            <li>
              <a className={`${(activeLink === 'profile') 
              ? 'block py-2 px-3 text-white bg-blue-700 rounded md:bg-transparent md:text-blue-700 md:p-0' 
              : "block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0" }`}
              onClick={() => 
                navigate('/profilePage')
              }
              >
                Profile
              </a>
            </li>
            <li>
              <a className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0">
                About Us
              </a>
            </li>
            <li>
              <a className="block py-2 px-3 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0"
              onClick={signOut}>
                Sign Out
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default ProviderNavbar;
