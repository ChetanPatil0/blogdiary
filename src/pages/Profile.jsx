import { useState, useEffect, useRef, useCallback } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Cropper from "react-easy-crop";
import { FiArrowLeft, FiEdit2, FiEye, FiLoader, FiLogOut, FiBell, FiLock } from "react-icons/fi";
import { useNotificationStore } from "../store/notificationStore";
import { useAuthStore } from "../store/authStore";
import {
  getProfile,
  updateProfile,
  uploadProfileImage,
  updateNotificationPreferences,   
} from "../services/authApi";
import Modal from "../components/Modal";
import { MEDIA_BASE_URL } from "../services/api";
import { useNavigate } from "react-router-dom";

const createCroppedImage = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
  });
};

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.setAttribute("crossOrigin", "anonymous");
    img.src = url;
  });

const getNonSpaceLength = (str) => str.replace(/\s+/g, "").length;

const validationSchema = Yup.object({
  firstName: Yup.string()
    .min(2, "First name must be at least 2 characters")
    .matches(/^[A-Za-z0-9]+$/, "Only letters and numbers allowed")
    .required("First name is required"),
  lastName: Yup.string()
    .min(2, "Last name must be at least 2 characters")
    .matches(/^[A-Za-z0-9]+$/, "Only letters and numbers allowed")
    .required("Last name is required"),
  bio: Yup.string()
    .test(
      "min-non-space",
      "Bio must have at least 10 non-space characters",
      (value) => !value || getNonSpaceLength(value) >= 10,
    )
    .max(300, "Bio cannot exceed 300 characters (including spaces)"),
});

const Profile = () => {
    const navigate = useNavigate();
  const { updateUser, logout } = useAuthStore();                  
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  const [profileImageSrc, setProfileImageSrc] = useState("");
  const [croppedImageSrc, setCroppedImageSrc] = useState("");
  const [tempCroppedBlob, setTempCroppedBlob] = useState(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [showCropModal, setShowCropModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // New state for notification preference
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savingNotification, setSavingNotification] = useState(false);

  const fileInputRef = useRef(null);

  const splitFullName = (full) => {
    if (!full || typeof full !== "string") return { first: "", last: "" };
    const parts = full.trim().split(/\s+/);
    if (parts.length === 0) return { first: "", last: "" };
    if (parts.length === 1) return { first: parts[0], last: "" };
    const first = parts[0];
    const last = parts.slice(1).join(" ");
    return { first, last };
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const res = await getProfile();
        const data = res.data?.data || res.data;
        console.log("Profile data:", data);

        setProfileData(data);
        updateUser(data);

    
        setEmailNotifications(data.emailNotifications ?? true);

        if (data.profileImage?.url) {
          const url = data.profileImage.url.startsWith("http")
            ? data.profileImage.url
            : `${MEDIA_BASE_URL}${data.profileImage.url}`;
          setProfileImageSrc(url);
          setCroppedImageSrc(url);
        }
      } catch (err) {
        console.error(err);
        addNotification("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [addNotification, updateUser]);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImageSrc(reader.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropSave = async () => {
    if (!croppedAreaPixels) return;
    try {
      const blob = await createCroppedImage(profileImageSrc, croppedAreaPixels);
      const url = URL.createObjectURL(blob);
      setTempCroppedBlob(blob);
      setCroppedImageSrc(url);
      setShowCropModal(false);
      setShowPreviewModal(true);
    } catch (err) {
      addNotification("Failed to crop image", "error");
    }
  };

  const handleConfirmUpload = async () => {
    if (!tempCroppedBlob) return;
    try {
      const formData = new FormData();
      formData.append("profileImage", tempCroppedBlob, "profile.jpg");

      const res = await uploadProfileImage(formData);
      const updated = res.data?.data || res.data;

      setProfileData(updated);
      updateUser(updated);

      const newUrl = updated.profileImage?.url?.startsWith("http")
        ? updated.profileImage.url
        : `${MEDIA_BASE_URL}${updated.profileImage.url}`;

      setProfileImageSrc(newUrl || croppedImageSrc);
      setCroppedImageSrc(newUrl || croppedImageSrc);

      addNotification("Profile picture updated", "success");
      setShowPreviewModal(false);
      setTempCroppedBlob(null);
    } catch (err) {
      addNotification("Failed to upload image", "error");
    }
  };

  // New handler for toggling email notifications
  const handleToggleNotifications = async (e) => {
    const newValue = e.target.checked;
    setEmailNotifications(newValue);
    setSavingNotification(true);

    try {
      await updateNotificationPreferences({ emailNotifications: newValue });
      addNotification("Notification preferences updated", "success");
      setProfileData((prev) => ({ ...prev, emailNotifications: newValue }));
    } catch (err) {
      console.error(err);
      addNotification("Failed to update notification settings", "error");
      setEmailNotifications(!newValue); 
    } finally {
      setSavingNotification(false);
    }
  };

  const handleLogout = () => {
    logout(); 
  };

  const getAvatarInitials = () => {
    const { first, last } = splitFullName(profileData?.fullName);
    if (first && last) return (first[0] + last[0]).toUpperCase();
    if (first) return first[0].toUpperCase();
    if (last) return last[0].toUpperCase();
    return "?";
  };

  if (loading || !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FiLoader className="animate-spin h-10 w-10 text-primary-500" />
      </div>
    );
  }

  const { first: initialFirst, last: initialLast } = splitFullName(profileData.fullName);

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-5 sm:px-8 lg:px-10">
      <div className="mb-8 flex items-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 transition-colors"
        >
          <FiArrowLeft size={18} />
          Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Profile
        </h1>
      </div>

      <div className="max-w-full mx-auto">

        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm mb-6">
       

          <div className="mb-8 relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-7">
              <div className="relative shrink-0">
                {croppedImageSrc ? (
                  <img
                    src={croppedImageSrc}
                    alt="Profile"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-slate-300 dark:border-slate-600 shadow"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-200 text-2xl font-semibold border border-gray-300 dark:border-gray-600">
                    {getAvatarInitials()}
                  </div>
                )}
                <label
                  htmlFor="profile-upload"
                  className="absolute -bottom-1 -right-1 bg-primary-500 hover:bg-primary-600 text-white p-2 rounded-full cursor-pointer shadow transition-all duration-200"
                >
                  <FiEdit2 size={16} />
                </label>
                <input
                  id="profile-upload"
                  type="file"
                  accept="image/png,image/jpeg"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
                  {profileData.fullName || "User"}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-base text-slate-600 dark:text-slate-400">
                    {profileData.email || "No email linked"}
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profileData.isVerified
                        ? "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300"
                    }`}
                  >
                    {profileData.isVerified ? "Verified" : "Unverified"}
                  </span>
                </div>
              </div>

              {!isEditMode && (
                <button
                  onClick={() => setIsEditMode(true)}
                  className="mt-4 sm:mt-0 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg shadow transition flex items-center gap-1.5"
                >
                  <FiEdit2 size={15} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          {isEditMode ? (
            <Formik
              initialValues={{
                firstName: initialFirst,
                lastName: initialLast,
                bio: profileData.bio || "",
              }}
              validationSchema={validationSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  setSubmitting(true);
                  const fullName = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();

                  const payload = {
                    fullName,
                    bio: values.bio.trim(),
                  };

                  const res = await updateProfile(payload);
                  const updated = res.data?.data || res.data;

                  setProfileData(updated);
                  updateUser(updated);
                  addNotification("Profile updated successfully", "success");
                  setIsEditMode(false);
                } catch (err) {
                  const msg = err?.response?.data?.message || "Failed to update profile";
                  addNotification(msg, "error");
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {(formik) => {
                const nonSpace = getNonSpaceLength(formik.values.bio);
                const countColor = nonSpace >= 10 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";

                return (
                  <Form className="space-y-7">
                 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="firstName"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none transition-all text-sm"
                        />
                        <ErrorMessage name="firstName" component="p" className="mt-1 text-xs text-red-600 dark:text-red-400" />
                      </div>

                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <Field
                          type="text"
                          name="lastName"
                          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none transition-all text-sm"
                        />
                        <ErrorMessage name="lastName" component="p" className="mt-1 text-xs text-red-600 dark:text-red-400" />
                      </div>

                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
                        <div className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm cursor-not-allowed">
                          {profileData.username || "Not set"}
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                        <div className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm cursor-not-allowed">
                          {profileData.email || "Not available"}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bio</label>
                      <Field
                        as="textarea"
                        name="bio"
                        rows={4}
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-200 dark:focus:ring-primary-800 outline-none transition-all resize-y min-h-[110px] text-sm"
                      />
                      <ErrorMessage name="bio" component="p" className="mt-1 text-xs text-red-600 dark:text-red-400" />
                      <p className={`mt-1.5 text-xs ${countColor}`}>
                        {nonSpace} / 300 chars
                      </p>
                    </div>

                    <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditMode(false)}
                        className="px-5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={formik.isSubmitting || !formik.dirty}
                        className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[140px]"
                      >
                        {formik.isSubmitting ? (
                          <>
                            <FiLoader className="animate-spin" size={14} />
                            Saving...
                          </>
                        ) : (
                          "Save Changes"
                        )}
                      </button>
                    </div>
                  </Form>
                );
              }}
            </Formik>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First Name</label>
                  <div className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm">
                    {initialFirst || "Not set"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last Name</label>
                  <div className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm">
                    {initialLast || "Not set"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
                  <div className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm">
                    {profileData.username || "Not set"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                  <div className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm">
                    {profileData.email || "Not available"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Bio</label>
                <div className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 min-h-[100px] whitespace-pre-wrap text-sm">
                  {profileData.bio || "No bio added yet."}
                </div>
              </div>
            </div>
          )}
        </div>

     
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm">
  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
    <FiBell size={20} />
    Settings
  </h2>

  <div className="space-y-8">
  
    <div className="flex items-center justify-between">
      <div>
        <label className="text-base font-medium text-slate-800 dark:text-slate-200">
          Email Notifications
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Receive important updates, new messages, and account activity via email
        </p>
      </div>

      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={emailNotifications}
          onChange={handleToggleNotifications}
          disabled={savingNotification}
          className="sr-only peer"
        />
        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
      </label>
    </div>


    <div className="flex items-center justify-between">
      <div>
        <label className="text-base font-medium text-slate-800 dark:text-slate-200">
          Password
        </label>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Update your account password for better security
        </p>
      </div>

     <button
  onClick={() => navigate('/change-password')}
  className="
    px-4 py-2 
    bg-primary-50 hover:bg-primary-200 
    dark:bg-primary-900/30 dark:hover:bg-primary-900/60 
    text-primary-700 dark:text-primary-300 
    border border-primary-200 dark:border-primary-800 
    rounded-lg font-medium text-sm 
    transition-colors duration-200 
    flex items-center gap-2
  "
>
  <FiLock size={14} />
  Change Password
</button>

    </div>

    <div className="pt-6 border-t border-slate-200 dark:border-slate-700 flex justify-end">
      <button
        onClick={handleLogout}
        className="px-6 py-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg font-medium transition flex items-center justify-center gap-2 min-w-[140px]"
      >
        <FiLogOut size={18} />
        Log Out
      </button>
    </div>
  </div>
</div>
      </div>

      <Modal
        isOpen={showCropModal}
        title="Crop Profile Picture"
        onClose={() => {
          setShowCropModal(false);
          setProfileImageSrc(croppedImageSrc);
        }}
        onConfirm={handleCropSave}
        confirmText="Crop & Preview"
        cancelText="Cancel"
      >
        <div className="relative h-72 w-full bg-black/5 dark:bg-black/20 rounded-lg overflow-hidden">
          <Cropper
            image={profileImageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="mt-5 flex items-center gap-3 px-1">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Zoom:</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary-500"
          />
        </div>
      </Modal>

      <Modal
        isOpen={showPreviewModal}
        title="Profile Picture Preview"
        onClose={() => {
          setShowPreviewModal(false);
          setTempCroppedBlob(null);
        }}
        onConfirm={handleConfirmUpload}
        confirmText="Save Picture"
        cancelText="Cancel"
      >
        <div className="flex flex-col items-center gap-5 py-6">
          <div className="w-56 h-56 rounded-full overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-lg">
            <img src={croppedImageSrc} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 text-center px-4">
            This will be your new profile picture
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;