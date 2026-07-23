"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProfile, changePassword } from "@/lib/api/auth";
import { ImageWithFallback } from "@/components/ImageWithFallback";

interface ProfileFormProps {
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    address?: string;
    image?: string;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  // Initialize with user data from signup
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || "");
  const [address, setAddress] = useState(user.address || "");
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [imageError, setImageError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.BACKEND_URL || "http://localhost:5000";

  const existingImageUrl = useMemo(() => {
    if (!user.image) return "";
    if (user.image.startsWith("http://") || user.image.startsWith("https://")) return user.image;
    return `${baseUrl}${user.image}`;
  }, [baseUrl, user.image]);

  useEffect(() => {
    return () => {
      if (profileImage && profileImage.startsWith("blob:")) {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || "");
    setAddress(user.address || "");
    setProfileImage(null);
    setProfileImageFile(null);
    setSaveMessage("");
    setNameError("");
    setEmailError("");
    setPhoneError("");
    setImageError("");
  }, [user._id, user.name, user.email, user.phone, user.address]);

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      setSaveMessage("");
      setNameError("");
      setEmailError("");
      setPhoneError("");
      setImageError("");

      const trimmedName = name.trim();
      const trimmedEmail = email.trim();

      if (!trimmedName) {
        setNameError("Name is required");
        setIsSaving(false);
        return;
      }

      if (!trimmedEmail) {
        setEmailError("Email is required");
        setIsSaving(false);
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(trimmedEmail)) {
        setEmailError("Enter a valid email address");
        setIsSaving(false);
        return;
      }
      
      // Validate phone number if provided
      if (phone && phone.length !== 10) {
        setPhoneError("Phone number must be exactly 10 digits");
        setIsSaving(false);
        return;
      }
      
      const profileData = new FormData();
      profileData.append("name", trimmedName);
      profileData.append("email", trimmedEmail);
      profileData.append("phone", phone);
      profileData.append("address", address);
      if (profileImageFile) {
        profileData.append("image", profileImageFile);
      }

      // Save to backend
      const response = await updateProfile(user._id, profileData);

      const savedImageUrl = response.data.image
        ? response.data.image.startsWith("http://") || response.data.image.startsWith("https://")
          ? response.data.image
          : `${baseUrl}${response.data.image}`
        : null;
      if (savedImageUrl) {
        setProfileImage(savedImageUrl);
        setProfileImageFile(null);
      }
      
      // Update cookie with new data
      if (typeof window !== "undefined") {
        const profileStorage = {
          userId: response.data._id,
          name: trimmedName,
          email: trimmedEmail,
          phone,
          address,
          image: response.data.image,
        };

        document.cookie = `user=${JSON.stringify(response.data)}; path=/`;
        localStorage.setItem("user", JSON.stringify(response.data));
        localStorage.setItem(
          `profileData:${response.data._id}`,
          JSON.stringify(profileStorage)
        );
      }
      
      setSaveMessage("Profile updated successfully!");
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (error: unknown) {
      console.error("Profile update error:", error);
      let errorMsg = "Failed to update profile";
      
      if (error instanceof Error && error.message) {
        errorMsg = error.message;
      }
      
      // Show more specific error for network issues
      if (errorMsg.includes("Network Error") || errorMsg.includes("ERR_CONNECTION_REFUSED")) {
        errorMsg = "Cannot connect to server. Please make sure the backend server is running.";
      }
      
      setSaveMessage(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      setIsChangingPassword(true);
      setPasswordMessage("");
      setCurrentPasswordError("");
      setNewPasswordError("");
      setConfirmPasswordError("");

      // Validation
      if (!currentPassword.trim()) {
        setCurrentPasswordError("Current password is required");
        setIsChangingPassword(false);
        return;
      }

      if (!newPassword.trim()) {
        setNewPasswordError("New password is required");
        setIsChangingPassword(false);
        return;
      }

      if (newPassword.length < 6) {
        setNewPasswordError("New password must be at least 6 characters");
        setIsChangingPassword(false);
        return;
      }

      if (newPassword === currentPassword) {
        setNewPasswordError("New password must be different from current password");
        setIsChangingPassword(false);
        return;
      }

      if (newPassword !== confirmPassword) {
        setConfirmPasswordError("Passwords do not match");
        setIsChangingPassword(false);
        return;
      }

      // Call API
      await changePassword(user._id, {
        currentPassword,
        newPassword,
      });

      setPasswordMessage("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      setTimeout(() => setPasswordMessage(""), 3000);
    } catch (error: unknown) {
      console.error("Password change error:", error);
      let errorMsg = "Failed to update password";

      if (error instanceof Error && error.message) {
        errorMsg = error.message;
      }

      if (errorMsg.includes("Network Error") || errorMsg.includes("ERR_CONNECTION_REFUSED")) {
        errorMsg = "Cannot connect to server. Please make sure the backend server is running.";
      }

      setPasswordMessage(errorMsg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxBytes = 20 * 1024 * 1024;
      if (file.size > maxBytes) {
        setImageError("Image is too large. Max size is 20MB.");
        setProfileImageFile(null);
        setProfileImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setProfileImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setProfileImage(previewUrl);
    }
  };

  // Get the first letter of the name for the avatar
  const avatarLetter = name.charAt(0).toUpperCase();

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div 
              className="w-16 h-16 rounded-full bg-green-700 flex items-center justify-center text-white text-2xl font-semibold overflow-hidden cursor-pointer"
              onClick={handleImageClick}
            >
              {profileImage || existingImageUrl ? (
                <ImageWithFallback
                  src={profileImage || existingImageUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                avatarLetter
              )}
            </div>
            <button
              onClick={handleImageClick}
              className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center hover:bg-green-600 transition cursor-pointer"
              aria-label="Upload profile photo"
            >
              <svg 
                className="w-3 h-3 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" 
                />
              </svg>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{name}</h2>
            <p className="text-sm text-gray-600">{email}</p>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Information</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
            {nameError ? (
              <p className="text-sm text-red-600 mt-1">{nameError}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
            {emailError ? (
              <p className="text-sm text-red-600 mt-1">{emailError}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                const numericValue = e.target.value.replace(/\D/g, "");
                if (numericValue.length <= 10) {
                  setPhone(numericValue);
                  setPhoneError("");
                }
              }}
              placeholder="10-digit phone number"
              maxLength={10}
              className={`w-full ${phoneError ? "border-red-500" : ""}`}
            />
            {phoneError && (
              <p className="text-red-500 text-xs mt-1">{phoneError}</p>
            )}
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <Input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder=""
              className="w-full"
            />
          </div>

          <Button 
            onClick={handleSaveChanges}
            disabled={isSaving}
            className="bg-green-700 hover:bg-green-800 text-white disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          
          {saveMessage && (
            <p className={`text-sm ${saveMessage.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
              {saveMessage}
            </p>
          )}
          {imageError && <p className="text-sm text-red-600">{imageError}</p>}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Change Password</h3>
        <form autoComplete="off" onSubmit={e => { e.preventDefault(); handleUpdatePassword(); }}>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <Input
                id="currentPassword"
                name="oldPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full"
                autoComplete="off"
              />
              {currentPasswordError && (
                <p className="text-sm text-red-600 mt-1">{currentPasswordError}</p>
              )}
            </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full"
            />
            {newPasswordError && (
              <p className="text-sm text-red-600 mt-1">{newPasswordError}</p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full"
            />
            {confirmPasswordError && (
              <p className="text-sm text-red-600 mt-1">{confirmPasswordError}</p>
            )}
          </div>

          <Button 
            type="submit"
            disabled={isChangingPassword}
            className="bg-green-700 hover:bg-green-800 text-white disabled:opacity-50"
          >
            {isChangingPassword ? "Updating..." : "Update Password"}
          </Button>

          {passwordMessage && (
            <p className={`text-sm ${passwordMessage.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
              {passwordMessage}
            </p>
          )}
        </div>
      </form>
    </div>
    </div>
  );
}
