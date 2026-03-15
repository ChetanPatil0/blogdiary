const Logo = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg' };
  return (
    <div className={`${sizes[size]} ${className} flex items-center justify-center bg-primary-500 rounded-lg text-white font-bold`}>
      BD
    </div>
  );
};
export default Logo;
