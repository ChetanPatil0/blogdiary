// import { useState, useRef, useEffect } from "react";
// import { useNavigate, Link, useSearchParams } from "react-router-dom";
// import { authAPI } from "../services/api";
// import { useNotificationStore } from "../store/notificationStore";
// import { useAuthStore } from "../store/authStore";
// import Logo from "../components/Logo";

// const VerifyEmail = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();

//   const addNotification = useNotificationStore((state) => state.addNotification);
//   const login = useAuthStore((state) => state.login);

//   const [loading, setLoading] = useState(false);
//   const email = searchParams.get("email") || "";

//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const inputsRef = useRef([]);

//   const [timer, setTimer] = useState(30);
//   const [canResend, setCanResend] = useState(false);

//   useEffect(() => {
//     if (timer === 0) {
//       setCanResend(true);
//       return;
//     }

//     const interval = setInterval(() => {
//       setTimer((prev) => prev - 1);
//     }, 1000);

//     return () => clearInterval(interval);
//   }, [timer]);

//   const handleChange = (value, index) => {
//     if (!/^[0-9]?$/.test(value)) return;

//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     if (value && index < 5) {
//       inputsRef.current[index + 1].focus();
//     }
//   };

//   const handleKeyDown = (e, index) => {
//     if (e.key === "Backspace") {
//       if (!otp[index] && index > 0) {
//         inputsRef.current[index - 1].focus();
//       }
//     }
//   };

//   const handlePaste = (e) => {
//     const paste = e.clipboardData.getData("text").trim();

//     if (!/^\d{6}$/.test(paste)) return;

//     const newOtp = paste.split("");
//     setOtp(newOtp);

//     inputsRef.current[5].focus();
//   };

//   const handleVerify = async () => {
//     const otpValue = otp.join("");

//     if (otpValue.length !== 6) {
//       return addNotification("Enter valid 6 digit OTP", "error");
//     }

//     setLoading(true);

//     try {
//       const response = await authAPI.verifyEmail({
//         email,
//         otp: otpValue,
//       });

//       if (response.data.success) {
//         login(response.data.data.user, response.data.data.token);
//         addNotification("Email verified successfully!", "success");
//         navigate("/dashboard");
//       }
//     } catch (error) {
//       addNotification(
//         error.response?.data?.message || "Verification failed",
//         "error"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     setLoading(true);

//     try {
//       const response = await authAPI.resendVerification({
//         email,
//       });

//       if (response.data.success) {
//         addNotification("OTP sent again!", "success");
//         setTimer(30);
//         setCanResend(false);
//       }
//     } catch (error) {
//       addNotification(
//         error.response?.data?.message || "Failed to resend",
//         "error"
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-light-50 dark:bg-dark-900 px-4">
//       <div className="w-full max-w-md text-center">

//         <Logo size="lg" className="mx-auto mb-8" />

//         <h2 className="text-3xl font-bold text-dark-900 dark:text-light-50 mb-2">
//           Verify Email
//         </h2>

//         <p className="text-dark-600 dark:text-light-400 mb-1">
//           We sent a verification code to
//         </p>

//         <p className="font-semibold text-primary-500 mb-8">
//           {email}
//         </p>

//         <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
//           {otp.map((digit, index) => (
//             <input
//               key={index}
//               ref={(el) => (inputsRef.current[index] = el)}
//               value={digit}
//               maxLength={1}
//               onChange={(e) => handleChange(e.target.value, index)}
//               onKeyDown={(e) => handleKeyDown(e, index)}
//               className="w-12 h-12 text-center text-lg font-semibold rounded-xl border-2 border-light-200 dark:border-dark-700 bg-light-50 dark:bg-dark-800 text-dark-900 dark:text-light-50 focus:border-primary-500 focus:outline-none transition"
//             />
//           ))}
//         </div>

//         <button
//           onClick={handleVerify}
//           disabled={loading}
//           className="w-full px-4 py-2 mb-6 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 font-medium"
//         >
//           {loading ? "Verifying..." : "Verify OTP"}
//         </button>

//         {!canResend ? (
//           <p className="text-sm text-dark-500 dark:text-light-400 mb-4">
//             Didn't receive the code?
//             <span className="ml-1 font-semibold">
//               Resend in {timer}s
//             </span>
//           </p>
//         ) : (
//           <button
//             onClick={handleResend}
//             className="text-primary-500 hover:text-primary-600 font-medium mb-4"
//           >
//             Resend OTP
//           </button>
//         )}

//         <Link
//           to="/login"
//           className="block text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
//         >
//           Back to Login
//         </Link>

//       </div>
//     </div>
//   );
// };

// export default VerifyEmail;


import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";

import { useNotificationStore } from "../../store/notificationStore";
import { useAuthStore } from "../../store/authStore";
import { FiMail, FiRotateCcw, FiCheck } from 'react-icons/fi';
import { resendVerification, verifyUserEmail } from "../../services/authApi";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const addNotification = useNotificationStore((state) => state.addNotification);
  const login = useAuthStore((state) => state.login);

  const [loading, setLoading] = useState(false);
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputsRef.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(paste)) return;
    const newOtp = paste.split("");
    setOtp(newOtp);
    inputsRef.current[5].focus();
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      return addNotification("Enter valid 6 digit OTP", "error");
    }
    setLoading(true);
    try {
      const response = await verifyUserEmail( email, otpValue );
      if (response.success) {
        login(response.data.user, response.data.token);
        addNotification("Email verified successfully!", "success");
        navigate("/dashboard");
      }
    } catch (error) {
      addNotification(error.response?.data?.message || "Verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const response = await resendVerification({ email });
      if (response.data.success) {
        addNotification("OTP sent again!", "success");
        setTimer(30);
        setCanResend(false);
      }
    } catch (error) {
      addNotification(error.response?.data?.message || "Failed to resend", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-300/20">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-dark-900 dark:text-light-50 mb-3">
          Verify Email
        </h1>
        <p className="text-dark-500 dark:text-light-400 text-sm sm:text-base">
          Enter the code we sent to your email
        </p>
      </div>

      <div className="space-y-6">
        
        <div className="flex items-center gap-3 p-4 rounded-xl bg-primary-50 dark:bg-dark-700 border border-primary-200 dark:border-dark-600">
          <FiMail className="text-primary-500 flex-shrink-0" size={20} />
          <div className="min-w-0">
            <p className="text-sm text-dark-600 dark:text-light-400">Verification code sent to</p>
            <p className="text-sm font-semibold text-dark-900 dark:text-light-50 truncate">{email}</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-dark-900 dark:text-light-50 mb-4">
            Enter Code
          </label>
          <div className="flex justify-center gap-2.5 sm:gap-3" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                value={digit}
                maxLength={1}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 sm:w-14 sm:h-14 text-center text-lg sm:text-2xl font-bold rounded-xl border-2 border-light-200 dark:border-dark-700 bg-light-50 dark:bg-dark-700 text-dark-900 dark:text-light-50 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-900 transition-all"
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleVerify}
          disabled={loading}
          className="w-full py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white rounded-xl font-semibold transition-colors duration-200"
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>

        <div className="text-center">
          {!canResend ? (
            <p className="text-sm text-dark-600 dark:text-light-400">
              Didn't receive the code?
              <span className="ml-2 font-semibold text-primary-500">
                Resend in {timer}s
              </span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={loading}
              className="text-sm text-primary-500 hover:text-primary-600 font-semibold transition-colors"
            >
              Resend Code
            </button>
          )}
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="text-sm text-dark-600 dark:text-light-400 hover:text-dark-900 dark:hover:text-light-50 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;