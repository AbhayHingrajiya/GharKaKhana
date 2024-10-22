import React, {useState} from "react";
import axios from "axios";
import {useNavigate} from 'react-router-dom';
import logo from '../../assets/fullLogo.jpeg'
import './Login.css'
import { useDispatch } from 'react-redux';
import { setUser } from '../../redux/auth/auth';
const LoginForm = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleEmailChange = (event) => {
        setEmail(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/login', {email, password});
            if(response.status == 200){
                dispatch(setUser({
                    name: response.data.name,
                    email: response.data.email,
                    isLogedin: true,
                    userType: response.data.type
                }));
                if(response.data.type === 'foodConsumer'){
                    navigate('/consumerHomePage');
                }else if(response.data.type === 'deliveryBoy'){
                    navigate('/deliveryHomePage');
                }else if(response.data.type === 'foodProvider'){
                    navigate('/providerHomePage');
                }else{
                    setMessage("Email or Password doesn't match");
                }
            }else{
                console.log('get a negative responce code '+response.status)
            }
        } catch (error) {
            setMessage("Failed to log in. Please try again.");
            console.log(error)
        }
    };



    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <input
                        type="text"
                        value={email}
                        onChange={handleEmailChange}
                        className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                        placeholder="Email address"
                    />
                </div>
                <div className="mb-6">
                    <input
                        type="password"
                        value={password}
                        onChange={handlePasswordChange}
                        className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                        placeholder="Password"
                    />
                </div>
                <div className="flex justify-between items-center mb-6">
                    <a
                        className="text-blue-600 hover:text-blue-700 focus:text-blue-700 active:text-blue-800 duration-200 transition ease-in-out"
                        onClick={(e) => navigate('/forgot-password')}
                    >
                        Forgot password?
                    </a>
                </div>
                {message && <p className="text-red-500">{message}</p>}
                <button
                    type="submit"
                    className="inline-block px-7 py-3 bg-blue-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out w-full"
                    data-mdb-ripple="true"
                    data-mdb-ripple-color="light"
                >
                    Sign in
                </button>
            </form>
            <div className="flex items-center mb-6 pt-4">
                <p className="text-gray-600 ml-4">Don't have an account? </p>
                <a
                    className="text-blue-500 ml-2 cursor-pointer hover:underline"
                    onClick={() => navigate('/signup')}
                >Sign up</a>
            </div>
        </>
    );
}

const Login = () => {
    return (
        <>
        <section className="h-screen">
            <div className="container px-6 py-12 h-full">
                <div className="flex justify-center items-center flex-wrap h-full g-6 text-gray-800">
                    <div className="md:w-8/12 lg:w-6/12 mb-12 md:mb-0 ">
                        <img
                            src={logo}
                            className="w-full"
                            alt="Phone image"
                        />
                    </div>
                    <div className="md:w-8/12 lg:w-5/12 lg:ml-20">
                        <h2 className="pb-6 text-3xl font-bold">Login</h2>
                        <LoginForm/>
                    </div>
                </div>
            </div>
        </section>
        </>
    );
};

export default Login;
