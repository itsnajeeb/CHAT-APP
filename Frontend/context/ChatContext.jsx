
import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
} from 'react';

import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios } = useContext(AuthContext);

    // Keep selected user updated for socket callbacks
    const selectedUserRef = useRef(selectedUser);

    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    // Get all users
    const getUsers = useCallback(async () => {
        try {
            const { data } = await axios.get('/api/message/users');

            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages || {});
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || error.message
            );
        }
    }, [axios]);

    // Get messages of selected user
    const getMessages = useCallback(async (userId) => {
        try {
            const { data } = await axios.get(`/api/message/${userId}`);

            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || error.message
            );
        }
    }, [axios]);

    // Send message
    const sendMessage = useCallback(async (messageData) => {
        if (!selectedUser?._id) return;
        try {
            const { data } = await axios.post(
                `/api/message/send/${selectedUser._id}`,
                messageData
            );

            if (data.success) {
                setMessages((prev) => [...prev, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || error.message
            );
        }
    }, [axios, selectedUser]);

    // Subscribe to incoming messages
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = async (newMessage) => {
            const currentUser = selectedUserRef.current;

            if (
                currentUser &&
                newMessage.senderId === currentUser._id
            ) {
                setMessages((prev) => [...prev, {
                    ...newMessage,
                    seen: true,
                }]);

                try {
                    await axios.put(
                        `/api/message/mark/${newMessage._id}`
                    );
                } catch (error) {
                    console.error('Message marking failed:', error);
                }
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]:
                        (prev[newMessage.senderId] || 0) + 1,
                }));
            }
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, axios]);

    // Context values
    const value = {
        messages,
        message: messages, // Backward compatibility
        users,
        selectedUser,
        setUsers,
        getMessages,
        sendMessage,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        getUsers,

        // getMessages,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
