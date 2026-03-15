import crypto from 'crypto';

export const generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const getTokenExpiry = (minutes = 60) => {
  return new Date(Date.now() + minutes * 60 * 1000);
};
