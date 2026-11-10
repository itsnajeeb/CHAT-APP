
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets";
import { AuthContext } from "../../context/AuthContext";

const ProfilePage = () => {

    const { authUser, updateProfile } = useContext(AuthContext);

    const navigate = useNavigate();

    // Form states
    const [name, setName] = useState(authUser?.fullName || "");
    const [bio, setBio] = useState(authUser?.bio || "");
    const [image, setImage] = useState(null);


    // Show selected image
    const imagePreview = image
        ? URL.createObjectURL(image)
        : authUser?.profilePic || assets.avatar_icon;


    // Handle form submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        let profilePic = authUser?.profilePic;

        // Convert image into Base64
        if (image) {
            const reader = new FileReader();

            reader.readAsDataURL(image);

            reader.onload = async () => {
                await saveProfile(reader.result);
            };

            return;
        }

        await saveProfile(profilePic);
    };


    // Update profile
    const saveProfile = async (profilePic) => {

        await updateProfile({
            fullName: name,
            bio: bio,
            profilePic: profilePic
        });

        navigate("/");
    };


    return (
        <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center">

            <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5 p-10 flex-1"
                >

                    <h3 className="text-lg text-white">
                        Profile Details
                    </h3>


                    {/* Upload Image */}
                    <label
                        htmlFor="avatar"
                        className="flex items-center gap-3 cursor-pointer"
                    >

                        <input
                            type="file"
                            id="avatar"
                            accept="image/*"
                            hidden
                            onChange={(e) => setImage(e.target.files[0])}
                        />

                        <img
                            src={imagePreview}
                            alt="Profile"
                            className="w-12 h-12 rounded-full object-cover"
                        />

                        Upload Profile Image

                    </label>


                    {/* Name */}
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your Name"
                        required
                        className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />


                    {/* Bio */}
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Write Profile Bio..."
                        rows={4}
                        required
                        className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />


                    {/* Save Button */}
                    <button
                        type="submit"
                        className="bg-linear-to-r from-purple-400 to-violet-400 text-white p-2 rounded-full text-lg cursor-pointer"
                    >
                        Save
                    </button>

                </form>


                {/* Profile Image Preview */}
                <img
                    src={imagePreview}
                    alt="User Profile"
                    className="w-44 h-44 aspect-square rounded-full object-cover mx-10 max-sm:mt-10"
                />

            </div>

        </div>
    );
};

export default ProfilePage;
