import Logo from './Logo';
import { FiGithub, FiLinkedin } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: FiGithub, href: '#', label: 'GitHub' },
    { icon: FiLinkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-950 to-slate-900 text-white border-t border-slate-800 ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        
        <div className="md:hidden text-center mb-10">
          <div className="mb-8 flex justify-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Logo size="sm" />
                <span className="font-bold text-lg">BlogDiary</span>
              </div>
              <p className="text-slate-400 text-sm">Share your stories with the world.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8 max-w-xs mx-auto">
            <div>
              <h3 className="font-semibold text-white text-xs mb-4 uppercase tracking-wide">Product</h3>
              <ul className="space-y-2.5">
                <li><a href="/blogs" className="text-slate-400 hover:text-white text-xs transition-colors">Explore</a></li>
                <li><a href="/my-blogs/create-blog" className="text-slate-400 hover:text-white text-xs transition-colors">Create</a></li>
                <li><a href="/pricing" className="text-slate-400 hover:text-white text-xs transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white text-xs mb-4 uppercase tracking-wide">Company</h3>
              <ul className="space-y-2.5">
                <li><a href="/about" className="text-slate-400 hover:text-white text-xs transition-colors">About</a></li>
                <li><a href="/blog" className="text-slate-400 hover:text-white text-xs transition-colors">Blog</a></li>
                <li><a href="/contact" className="text-slate-400 hover:text-white text-xs transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="flex gap-4 justify-center">
            <a
              href="/auth/signin"
              className="px-7 py-2.5 text-sm font-medium border border-slate-700 text-white rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-colors"
            >
              Sign In
            </a>
            <a
              href="/auth/register"
              className="px-7 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Logo size="sm" />
              <span className="font-bold text-lg">BlogDiary</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Share your stories with the world.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white text-sm mb-5 uppercase tracking-wider">Product</h3>
            <ul className="space-y-3">
              <li><a href="/blogs" className="text-slate-400 hover:text-white text-sm transition-colors">Explore</a></li>
              <li><a href="/my-blogs/create-blog" className="text-slate-400 hover:text-white text-sm transition-colors">Create</a></li>
              <li><a href="/pricing" className="text-slate-400 hover:text-white text-sm transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white text-sm mb-5 uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              <li><a href="/about" className="text-slate-400 hover:text-white text-sm transition-colors">About</a></li>
              <li><a href="/blog" className="text-slate-400 hover:text-white text-sm transition-colors">Blog</a></li>
              <li><a href="/contact" className="text-slate-400 hover:text-white text-sm transition-colors">Contact</a></li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="/auth/signin"
              className="px-6 py-3 text-sm font-medium border border-slate-700 text-white rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-colors text-center"
            >
              Sign In
            </a>
            <a
              href="/auth/register"
              className="px-6 py-3 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Get Started
            </a>
          </div>
        </div>

        <div className="h-px bg-slate-800 my-8" />

        <div className="flex flex-row flex-wrap items-center justify-center sm:justify-between gap-5 sm:gap-8">
          <p className="text-slate-500 text-xs sm:text-sm">
            © {currentYear} BlogDiary
          </p>

          <div className="flex items-center gap-6">
            {socialLinks.map((social, idx) => {
              const Icon = social.icon;
              return (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;