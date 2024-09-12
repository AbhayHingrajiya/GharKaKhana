import React, { useState } from "react";
import logo from '../../assets/logo2.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {useDispatch, useSelector} from "react-redux";
import { setUser, logout } from '../../redux/auth/auth';

const SignUp = () => {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [signUpFor, setSignUpFor]=useState('consumer');
    const [message, setMessage] = useState('');
  
    const handleOptionChange = (event) => {
        setSignUpFor(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if(signUpFor === 'consumer'){
            let consumerName=document.getElementById('nameConsumer').value;
            let consumerEmail=document.getElementById('emailConsumer').value;
            let consumerPhoneNumber=document.getElementById('phoneNumberConsumer').value;
            let consumerPassword=document.getElementById('passwordConsumer').value;
            let consumerRepassword=document.getElementById('confirmPasswordConsumer').value;

            if (consumerPassword !== consumerRepassword) {
                setMessage("The password and confirm password do not match");
                return;
            }

            try {
                const response = await axios.post('/api/signUpFoodConsumer', {name: consumerName, email: consumerEmail, phoneNumber: consumerPhoneNumber, password: consumerPassword});

                if (response.data.error) {
                    setMessage(response.data.error);
                } else {
                    setMessage(response.data.message);

                    dispatch(setUser({
                        name: response.data.foodConsumer.name,
                        email: response.data.foodConsumer.email,
                        isLogedin: true,
                        userType: 'foodConsumer'
                    }));

                    alert('You are sign up successfully')
                    navigate('/consumerHomePage');
                }
            } catch (error) {
                setMessage('Your data filds is not valid.');
            }
        }else if(signUpFor === 'provider'){
            let ProviderName=document.getElementById('nameProvider').value;
            let ProviderEmail=document.getElementById('emailProvider').value;
            let ProviderPhoneNumber=document.getElementById('phoneNumberProvider').value;
            let ProviderPassword=document.getElementById('passwordProvider').value;
            let ProviderRepassword=document.getElementById('confirmPasswordProvider').value;

            if (ProviderPassword !== ProviderRepassword) {
                setMessage("The password and confirm password do not match");
                return;
            }

            try {
                const response = await axios.post('/api/signUpFoodProvider', {name: ProviderName, email: ProviderEmail, phoneNumber: ProviderPhoneNumber, password: ProviderPassword});

                if (response.data.error) {
                    setMessage(response.data.error);
                } else {
                    setMessage(response.data.message);
                    dispatch(setUser({
                        name: response.data.foodProvider.name,
                        email: response.data.foodProvider.email,
                        isLogedin: true,
                        userType: 'foodProvider'
                    }))
                    alert('You are signed up successfully');
                    navigate('/providerHomePage');
                }
            } catch (error) {
                setMessage('Your data filds is not valid.');
            }
        }else if(signUpFor === 'deliveryPerson'){
            let deliveryName=document.getElementById('nameDelivery').value;
            let deliveryEmail=document.getElementById('emailDelivery').value;
            let deliveryPhoneNumber=document.getElementById('phoneNumberDelivery').value;
            let deliveryLicenseNumber=document.getElementById('licenseNumberDelivery').value;
            let deliveryLicensePhoto=document.getElementById('licensePhotoDelivery').files[0];
            let deliveryVehicleNumber=document.getElementById('vehicleNumberDelivery').value;
            let deliveryVehicleName=document.getElementById('vehicleNameDelivery').value;
            let deliveryCityName=document.getElementById('cityNameDelivery').value;
            let deliveryPassword=document.getElementById('passwordDelivery').value;
            let deliveryRepassword=document.getElementById('confirmPasswordDelivery').value;

            if (deliveryPassword !== deliveryRepassword) {
                setMessage("The password and confirm password do not match");
                return;
            }

            try {
                let data={
                    name : deliveryName, 
                    email : deliveryEmail, 
                    phoneNumber : deliveryPhoneNumber, 
                    licenseNumber : deliveryLicenseNumber, 
                    licensePhoto : deliveryLicensePhoto, 
                    vehicleNumber : deliveryVehicleNumber, 
                    vehicleName : deliveryVehicleName, 
                    cityName : deliveryCityName,
                    password : deliveryPassword
                }
                const response = await axios.post('/api/signUpDeliveryBoy', data, {
                    headers: {
                      'Content-Type': 'multipart/form-data', // Required for file uploads
                    },
                  });

                if (response.data.error) {
                    setMessage(response.data.error);
                } else {
                    setMessage(response.data.message);

                    dispatch(setUser({
                        name: response.data.deliveryBoy.name,
                        email: response.data.deliveryBoy.email,
                        isLogedin: true,
                        userType: 'deliveryBoy'
                    }));
                    
                    alert('You are sign up successfully')
                    navigate('/deliveryHomePage');
                }
            } catch (error) {
                setMessage('Your data filds is not valid.');
            }
        }
    };

    return (
        <section className="h-screen">
            <div className="container px-6 py-12 h-full">
                <div className="flex justify-center items-center flex-wrap h-full g-6 text-gray-800">
                    <div className="md:w-8/12 lg:w-6/12 mb-12 md:mb-0">
                        <img
                            src={logo}
                            className="w-full"
                            alt="logo"
                        />
                    </div>
                    <div className="md:w-8/12 lg:w-5/12 lg:ml-20">
                        <div className="text-3xl font-extrabold text-gray-800 mb-8 self-center text-2xl leading-8 text-center whitespace-nowrap text-neutral-900">
                            Sign up to Ghar Ka Khana
                        </div>
                        <h3 className="text-xl font-extrabold text-center">Are you a?</h3><br />
                        <div className="flex items-center space-x-4 ml-8">
                            <label className="inline-flex items-center">
                                <input
                                type="radio"
                                className="form-radio text-blue-600"
                                name="option"
                                value="consumer"
                                checked={signUpFor === 'consumer'}
                                onChange={handleOptionChange}
                                />
                                <span className="ml-2">Food Consumer</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                type="radio"
                                className="form-radio text-blue-600"
                                name="option"
                                value="provider"
                                checked={signUpFor === 'provider'}
                                onChange={handleOptionChange}
                                />
                                <span className="ml-2">Food Provider</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                type="radio"
                                className="form-radio text-blue-600"
                                name="option"
                                value="deliveryPerson"
                                checked={signUpFor === 'deliveryPerson'}
                                onChange={handleOptionChange}
                                />
                                <span className="ml-2">Delivery</span>
                            </label>
                        </div>
                        { (signUpFor=='consumer')
                        && (<form
                            className="flex flex-col justify-center px-8 py-9 max-w-full bg-white rounded-lg shadow-sm w-[448px] max-md:px-5 max-md:mt-10"
                            onSubmit={handleSubmit}
                        >
                            <div className="mt-4">
                            
                                <input
                                    type="text"
                                    id="nameConsumer"
                                    name="nameConsumer"
                                    autoComplete="off"
                                    placeholder="Name"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                                
                                <input
                                    type="email"
                                    id="emailConsumer"
                                    name="emailConsumer"
                                    placeholder="Email"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                            
                                <input
                                    type="text"
                                    id="phoneNumberConsumer"
                                    name="phoneNumberConsumer"
                                    autoComplete="off"
                                    placeholder="Phone Number"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                       
                                <input
                                    type="password"
                                    id="passwordConsumer"
                                    name="passwordConsumer"
                                    placeholder="Password"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                            
                                <input
                                    type="password"
                                    id="confirmPasswordConsumer"
                                    name="confirmPasswordConsumer"
                                    placeholder="Confirm Password"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            {message && <p className='text-red-600'>{message}</p>}
                            <button
                                type="submit"
                                className="px-4 py-2 mt-4 text-base font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                            >
                                Sign Up
                            </button>
                            <div className="flex gap-3.5 self-center mt-4 text-center whitespace-nowrap">
                                <div className="grow text-gray-500">Already have an account?</div>
                                <a href="/login" className="text-blue-500 hover:underline">Log in</a>
                            </div>
                        </form>) }
                        { (signUpFor=='provider')
                        && (<form
                            className="flex flex-col justify-center px-8 py-9 max-w-full bg-white rounded-lg shadow-sm w-[448px] max-md:px-5 max-md:mt-10"
                            onSubmit={handleSubmit}
                        >
                            <div className="mt-4">
                            
                                <input
                                    type="text"
                                    id="nameProvider"
                                    name="nameProvider"
                                    autoComplete="off"
                                    placeholder="Name"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                                
                                <input
                                    type="email"
                                    id="emailProvider"
                                    name="emailProvider"
                                    placeholder="Email"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                            
                                <input
                                    type="text"
                                    id="phoneNumberProvider"
                                    name="phoneNumberProvider"
                                    autoComplete="off"
                                    placeholder="Phone Number"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                       
                                <input
                                    type="password"
                                    id="passwordProvider"
                                    name="passwordProvider"
                                    placeholder="Password"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                            
                                <input
                                    type="password"
                                    id="confirmPasswordProvider"
                                    name="confirmPasswordProvider"
                                    placeholder="Confirm Password"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            {message && <p className='text-red-600'>{message}</p>}
                            <button
                                type="submit"
                                className="px-4 py-2 mt-4 text-base font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                            >
                                Sign Up
                            </button>
                            <div className="flex gap-3.5 self-center mt-4 text-center whitespace-nowrap">
                                <div className="grow text-gray-500">Already have an account?</div>
                                <a href="/login" className="text-blue-500 hover:underline">Log in</a>
                            </div>
                        </form>)}
                        { (signUpFor=='deliveryPerson')
                        && (<form
                            className="flex flex-col justify-center px-8 py-9 max-w-full bg-white rounded-lg shadow-sm w-[448px] max-md:px-5 max-md:mt-10"
                            onSubmit={handleSubmit}
                        >
                            <div className="mt-4">
                            
                                <input
                                    type="text"
                                    id="nameDelivery"
                                    name="nameDelivery"
                                    autoComplete="off"
                                    placeholder="Name"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                                
                                <input
                                    type="email"
                                    id="emailDelivery"
                                    name="emailDelivery"
                                    placeholder="Email"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                            
                                <input
                                    type="text"
                                    id="phoneNumberDelivery"
                                    name="phoneNumberDelivery"
                                    placeholder="Phone Number"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                            
                                <input
                                    type="text"
                                    id="licenseNumberDelivery"
                                    name="licenseNumberDelivery"
                                    autoComplete="off"
                                    placeholder="License Number"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                            
                                <label className="mr-3 font-bold">License Photo: </label><input
                                    type="file"
                                    id="licensePhotoDelivery"
                                    name="licensePhotoDelivery"
                                    accept="image/*"
                                    placeholder="License Photo"
                                    className="max-w-60"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                            
                                <input
                                    type="text"
                                    id="vehicleNumberDelivery"
                                    name="vehicleNumberDelivery"
                                    autoComplete="off"
                                    placeholder="Vehicle Number"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                            
                                <input
                                    type="text"
                                    id="vehicleNameDelivery"
                                    name="vehicleNameDelivery"
                                    autoComplete="off"
                                    placeholder="Vehicle Name"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                            
                                <input
                                    type="text"
                                    id="cityNameDelivery"
                                    name="cityNameDelivery"
                                    autoComplete="off"
                                    placeholder="City Name"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                       
                                <input
                                    type="password"
                                    id="passwordDelivery"
                                    name="passwordDelivery"
                                    placeholder="Password"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            <div className="mt-4">
                            
                                <input
                                    type="password"
                                    id="confirmPasswordDelivery"
                                    name="confirmPasswordDelivery"
                                    placeholder="Confirm Password"
                                    className="w-full px-4 py-2 mt-1 text-base text-gray-800 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-300"
                                    required
                                />
                            </div>
                            {message && <p className='text-red-600'>{message}</p>}
                            <button
                                type="submit"
                                className="px-4 py-2 mt-4 text-base font-semibold text-white bg-blue-500 rounded-full hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                            >
                                Sign Up
                            </button>
                            <div className="flex gap-3.5 self-center mt-4 text-center whitespace-nowrap">
                                <div className="grow text-gray-500">Already have an account?</div>
                                <a href="/login" className="text-blue-500 hover:underline">Log in</a>
                            </div>
                        </form>) }
                    </div>
                </div>  
            </div>
        </section>
    );
};

export default SignUp;
