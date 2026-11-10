
import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { ChatContext } from '../../context/ChatContext.jsx';

const Sidebar = () => {
  const {
    getUsers,
    users,
    selectedUser,
    setSelectedUser,
    unseenMessages,
    setUnseenMessages
  } = useContext(ChatContext);

  const { logout, onlineUsers } = useContext(AuthContext);

  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  // Fetch users
  useEffect(() => {
    getUsers();
  }, [getUsers, onlineUsers]);

  // Filter users
  const filteredUsers = (users || []).filter((user) =>
    user?.fullName?.toLowerCase().includes(search.toLowerCase())
  );

  // Handle logout
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Handle user selection
  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  return (
    <div
      className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white ${selectedUser ? 'max-md:hidden' : ''
        }`}
    >
      {/* Header */}
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img
            src={assets.logo}
            alt="logo"
            className="max-w-40"
          />

          {/* Menu */}
          <div className="relative py-2 group">
            <img
              src={assets.menu_icon}
              alt="menu"
              className="max-h-5 cursor-pointer"
            />

            <div className="absolute top-full right-0 z-20 w-32 p-4 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
              <p
                onClick={() => navigate('/profile')}
                className="cursor-pointer text-sm"
              >
                Edit Profile
              </p>

              <hr className="my-2 border-t border-gray-500" />

              <p
                onClick={handleLogout}
                className="cursor-pointer text-sm"
              >
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5">
          <img
            src={assets.search_icon}
            alt="search"
            className="w-3"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search User..."
          />

          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-gray-400 text-xs"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Users List */}
      <div className="flex flex-col">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div
              onClick={() => {handleSelectUser(user); setUnseenMessages(prev=>({...prev, [user._id]:0}))}}
        key={user._id}
        className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm ${selectedUser?._id === user._id
            ? 'bg-[#282142]/50'
            : ''
          }`}
            >
        {/* Profile Image */}
        <img
          src={user?.profilePic || assets.avatar_icon}
          className="w-[35px] aspect-square rounded-full object-cover"
          alt={user.fullName || 'User'}
        />

        {/* User Info */}
        <div className="flex flex-col leading-5">
          <p>{user.fullName}</p>

          {onlineUsers.includes(user._id) ? (
            <span className="text-green-400 text-xs">
              Online
            </span>
          ) : (
            <span className="text-neutral-400 text-xs">
              Offline
            </span>
          )}
        </div>

        {/* Unseen Messages */}
        {unseenMessages?.[user._id] > 0 && (
          <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">
            {unseenMessages[user._id]}
          </p>
        )}
      </div>
      ))
      ) : (
      <p className="text-center text-gray-400 text-sm mt-5">
        No users found.
      </p>
        )}
    </div>
    </div >
  );
};

export default Sidebar;
