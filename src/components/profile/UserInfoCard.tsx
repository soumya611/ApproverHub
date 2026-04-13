import { useEffect, useState } from "react";
import React from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { getStoredUserIdentity } from "../../utils/userIdentity";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [userData, setUserData] = useState<{ name?: string; email?: string; phone?: string; bio?: string } | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    bio: '',
    facebook: 'https://www.facebook.com/PimjoHQ',
    twitter: 'https://x.com/PimjoHQ',
    linkedin: 'https://www.linkedin.com/company/pimjo',
    instagram: 'https://instagram.com/PimjoHQ',
  });

  useEffect(() => {
    const storedUser = getStoredUserIdentity();
    // Also get full user data from storage to access phone and bio
    const storageValue = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    let fullUserData: any = {};
    if (storageValue) {
      try {
        fullUserData = JSON.parse(storageValue);
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
    
    setUserData({
      name: storedUser?.name,
      email: storedUser?.email,
      phone: fullUserData?.phone || '',
      bio: fullUserData?.bio || '',
    });
    
    // Initialize form data when user data is loaded
    if (storedUser) {
      const firstName = storedUser.name?.split(' ')[0] || '';
      const lastName = storedUser.name?.split(' ').slice(1).join(' ') || '';
      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: storedUser.email || '',
        phone: fullUserData?.phone || '',
        bio: fullUserData?.bio || '',
        facebook: fullUserData?.socialLinks?.facebook || prev.facebook,
        twitter: fullUserData?.socialLinks?.twitter || prev.twitter,
        linkedin: fullUserData?.socialLinks?.linkedin || prev.linkedin,
        instagram: fullUserData?.socialLinks?.instagram || prev.instagram,
      }));
    }
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && userData) {
      const firstName = userData.name?.split(' ')[0] || '';
      const lastName = userData.name?.split(' ').slice(1).join(' ') || '';
      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: userData.email || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
      }));
    }
  }, [isOpen, userData]);

  const handleInputChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSave = () => {
    // Combine first and last name
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    
    // Get current storage location (localStorage or sessionStorage)
    const keepMeLoggedIn = localStorage.getItem('keepMeLoggedIn') === 'true';
    const storage = keepMeLoggedIn ? localStorage : sessionStorage;
    
    // Get existing user data
    const existingDataStr = storage.getItem('userData');
    let existingData: any = {};
    
    if (existingDataStr) {
      try {
        existingData = JSON.parse(existingDataStr);
      } catch (e) {
        console.error('Failed to parse existing user data', e);
      }
    }
    
    // Update user data
    const updatedUserData = {
      ...existingData,
      email: formData.email,
      displayName: fullName,
      name: fullName,
      phone: formData.phone,
      bio: formData.bio,
      socialLinks: {
        facebook: formData.facebook,
        twitter: formData.twitter,
        linkedin: formData.linkedin,
        instagram: formData.instagram,
      },
    };
    
    // Save to storage
    storage.setItem('userData', JSON.stringify(updatedUserData));
    
    // Update local state
    setUserData({
      name: fullName,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
    });
    
    closeModal();
    
    // Reload page to reflect changes everywhere
    window.location.reload();
  };

  // Parse name into first and last name
  const firstName = userData?.name?.split(' ')[0] || '';
  const lastName = userData?.name?.split(' ').slice(1).join(' ') || '';
  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Personal Information
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                First Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {firstName || "—"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Last Name
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {lastName || "—"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email address
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData?.email || "—"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Phone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData?.phone || "—"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Bio
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {userData?.bio || "—"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Update your details to keep your profile up-to-date.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div>
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Social Links
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Facebook</Label>
                    <Input
                      type="text"
                      value={formData.facebook}
                      onChange={handleInputChange('facebook')}
                    />
                  </div>

                  <div>
                    <Label>X.com</Label>
                    <Input 
                      type="text" 
                      value={formData.twitter}
                      onChange={handleInputChange('twitter')}
                    />
                  </div>

                  <div>
                    <Label>Linkedin</Label>
                    <Input
                      type="text"
                      value={formData.linkedin}
                      onChange={handleInputChange('linkedin')}
                    />
                  </div>

                  <div>
                    <Label>Instagram</Label>
                    <Input 
                      type="text" 
                      value={formData.instagram}
                      onChange={handleInputChange('instagram')}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Personal Information
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>First Name</Label>
                    <Input 
                      type="text" 
                      value={formData.firstName}
                      onChange={handleInputChange('firstName')}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Last Name</Label>
                    <Input 
                      type="text" 
                      value={formData.lastName}
                      onChange={handleInputChange('lastName')}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email Address</Label>
                    <Input 
                      type="email" 
                      value={formData.email}
                      onChange={handleInputChange('email')}
                    />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Phone</Label>
                    <Input 
                      type="text" 
                      value={formData.phone}
                      onChange={handleInputChange('phone')}
                    />
                  </div>

                  <div className="col-span-2">
                    <Label>Bio</Label>
                    <Input 
                      type="text" 
                      value={formData.bio}
                      onChange={handleInputChange('bio')}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
