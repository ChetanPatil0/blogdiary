import { FaUser } from "react-icons/fa";
import { MEDIA_BASE_URL } from "../services/api";
import { charColors } from "../constants";

const Avatar = ({
  name = "",
  url = null,
  size = "md",
  showIcon = false,
  className = "",
}) => {

  const getInitials = (fullName) =>
    fullName
      ? fullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "?";


  const getBgColor = (name) => {
    if (!name) return "bg-gray-500";
    const firstChar = name.trim()[0].toUpperCase();
    return charColors[firstChar] || "bg-gray-500";
  };

  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
    profile: "w-24 h-24 text-3xl",
    profileLg: "w-32 h-32 text-4xl",
  };

  return (
    <div className={`relative ${className}`}>
      {url ? (
        <img
          src={MEDIA_BASE_URL + url}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover border-2 border-gray-100 dark:border-dark-700`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full ${getBgColor(
            name
          )} text-white font-semibold flex items-center justify-center border-2 border-gray-100 dark:border-dark-700`}
        >
          {showIcon ? (
            <FaUser className="w-1/2 h-1/2 opacity-90" />
          ) : (
            getInitials(name)
          )}
        </div>
      )}
    </div>
  );
};

export default Avatar;