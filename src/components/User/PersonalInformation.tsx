import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Store';
import axiosInstance from '../../utils/axiosInstance';
import { setUser } from '../../slices/userSlice';
import { useSnackbar } from '../Snackbar';

const PersonalInformation: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();
  const { showSnackbar } = useSnackbar();

  const initialFormData = React.useMemo(
    () => ({
      username: user?.username || '',
      email: user?.email || '',
      profilePicture: user?.profilePicture || '',
    }),
    [user]
  );

  const [formData, setFormData] = useState(initialFormData);
  const [isChanged, setIsChanged] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    user?.profilePicture ? user?.profilePicture : null
  );
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(
    null
  );

  useEffect(() => {
    setFormData(initialFormData);
  }, [user, initialFormData]);

  useEffect(() => {
    setIsChanged(
      (formData.username !== '' &&
        formData.email !== '' &&
        (formData.username !== initialFormData.username ||
          formData.email !== initialFormData.email)) ||
        imagePreview !== null
    );
  }, [formData, initialFormData, imagePreview]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    axiosInstance
      .patch(
        '/users/update',
        {
          username: formData.username,
          email: formData.email,
          profilePicture: profilePictureFile,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      )
      .then((response) => {
        dispatch(
          setUser({
            ...user,
            id: user?.id || '',
            email: response.data.email,
            username: response.data.username,
            profilePicture: response.data.profile_picture_url,
          })
        );
        showSnackbar('User information updated successfully', 'success');
      })
      .catch((error) => {
        showSnackbar(error.response.data.detail, 'error');
        console.error('Error updating user information', error);
      });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePictureFile(file); // Store the file temporarily without uploading

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string); // Set preview URL
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-6">
        <div>
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden shadow-lg">
              <img
                src={imagePreview ? imagePreview : '/Images/avtar.svg'}
                alt="Profile"
                className="w-full h-full object-cover"
              />
              <label
                className="absolute bottom-0 right-3 bg-green-600 px-2 pt-2 pb-1 rounded-full cursor-pointer"
                htmlFor="profile"
              >
                <i className="fas fa-camera text-xl" />
              </label>
              <input
                type="file"
                id="profile"
                className="hidden"
                onChange={(e) => handleImageUpload(e)}
                name="profilePicture"
              />
            </div>
          </div>
        </div>
        <div className="flex-grow">
          <div className="mb-4">
            <label
              className="block text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 bg-bg-secondary dark:bg-dark-secondary outline-none rounded"
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium"
              style={{ color: 'var(--text-primary)' }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 bg-bg-secondary dark:bg-dark-secondary outline-none rounded"
            />
          </div>
        </div>
      </div>
      <button
        type="submit"
        className={`px-4 py-2 rounded ${
          isChanged
            ? 'bg-button-primary dark:bg-dark-button-primary hover:bg-button-hover dark:hover:bg-dark-button-hover'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
        disabled={!isChanged}
      >
        Save Changes
      </button>
    </form>
  );
};

export default PersonalInformation;
