
import { createContext, useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

export const AuthContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL;

axios.defaults.baseURL = backendUrl;

export const AuthProvider = ({ children }) => {

    // States
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);


    // Connect Socket
    const connectSocket = (userData) => {

        if (socket) return;

        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id
            }
        });

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });

        setSocket(newSocket);
    };


    // Disconnect Socket
    const disconnectSocket = () => {

        if (socket) {
            socket.disconnect();
            setSocket(null);
            setOnlineUsers([]);
        }
    };


    // Check Login Status
    const checkAuth = async () => {

        const savedToken = localStorage.getItem("token");

        if (!savedToken) {
            setIsCheckingAuth(false);
            return;
        }

        try {

            axios.defaults.headers.common["token"] = savedToken;

            const { data } = await axios.get("/api/auth/check");

            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }

        } catch (error) {

            console.log(error);

            localStorage.removeItem("token");
            delete axios.defaults.headers.common["token"];

            setToken(null);
            setAuthUser(null);

        } finally {
            setIsCheckingAuth(false);
        }
    };


    // Login / Signup
    const login = async (state, credentials) => {

        try {

            const { data } = await axios.post(
                `/api/auth/${state}`,
                credentials
            );

            if (data.success) {

                // Save user and token
                setAuthUser(data.userData);
                setToken(data.token);

                localStorage.setItem("token", data.token);

                axios.defaults.headers.common["token"] = data.token;

                // Connect socket
                connectSocket(data.userData);

                toast.success(data.message);

            } else {
                toast.error(data.message);
            }

        } catch (error) {

            toast.error(
                error.response?.data?.message || error.message
            );
        }
    };


    // Logout
    const logout = () => {

        disconnectSocket();

        localStorage.removeItem("token");
        delete axios.defaults.headers.common["token"];

        setToken(null);
        setAuthUser(null);

        toast.success("Logout Successfully.");
    };


    // Update Profile
    const updateProfile = async (body) => {

        try {

            const { data } = await axios.put(
                "/api/auth/update-profile",
                body
            );

            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile Updated Successfully.");
            } else {
                toast.error(data.message);
            }

        } catch (error) {

            toast.error(
                error.response?.data?.message || error.message
            );
        }
    };


    // Run when application starts
    useEffect(() => {

        checkAuth();

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };

    }, []);


    // Share data with other components
    const value = {
        axios,
        token,
        authUser,
        onlineUsers,
        socket,
        isCheckingAuth,
        login,
        logout,
        updateProfile
    };


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
