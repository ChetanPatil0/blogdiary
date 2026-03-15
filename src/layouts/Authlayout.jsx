import React from 'react';
import { Outlet } from 'react-router-dom';
import Logo from '../components/Logo';

const AuthLayout = ({ title, subtitle }) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        
        <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 flex-col justify-center items-center p-8 xl:p-12 relative">
        
          <div className="absolute inset-0 bg-black/8" />

          <div className="relative z-10 text-center space-y-7 max-w-md">
            <div className="space-y-4">
              <h1 className="text-5xl xl:text-6xl font-extrabold text-white tracking-tight">
                BlogDiary
              </h1>
              <p className="text-white/90 text-xl font-medium">
                Your Creative Space
              </p>
            </div>

            <div className="pt-3">
              <div className="w-24 h-1 bg-white/35 rounded-full mx-auto" />
            </div>

            <div className="pt-10 space-y-5 text-white/85 text-lg leading-relaxed font-light">
              <p>Write posts that matter.</p>
              <p>Connect with readers who care.</p>
              <p>Grow your voice — your way.</p>
            </div>
          </div>

          <div className="absolute bottom-12 left-0 right-0 text-center">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()} BlogDiary
            </p>
          </div>
        </div>

       
        <div className="flex-1 flex items-center justify-center px-5 sm:px-6 md:px-10 lg:px-12 py-10 lg:py-12">
          <div className="w-full">
           
            <div className="lg:hidden text-center space-y-5">
              <div className="flex justify-center">
                   <Logo/>
              </div>
              
              <div className="flex justify-center">
                <div className="w-16 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full" />
              </div>
              <p className="text-slate-600 text-base sm:text-lg font-medium">
                Your Creative Space
              </p>
            </div>

            {(title || subtitle) && (
              <div className="text-center space-y-3">
                {title && (
                  <h1 className="text-3xl sm:text-4xl font-bold text-slate-800">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-slate-600 text-base sm:text-lg">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            <div className=" p-4 transition-all">
              <Outlet />
            </div>

            <p className="lg:hidden text-center text-sm text-slate-500 pt-4">
              © {new Date().getFullYear()} BlogDiary
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;