import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';
import useSeo from '../hooks/useSeo';

const { FiUser, FiLock, FiMail, FiLogIn, FiUserPlus, FiAlertCircle } = FiIcons;

const LoginPage = () => {
  useSeo({
    path: '/login',
    title: 'Log In',
    description: "Log in to your DoRight Awareness Initiative training account.",
    noindex: true
  });

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { user, profile, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  useEffect(() => {
    if (user && profile) {
      if (from) {
        navigate(from, { replace: true });
      } else {
        const dashboardPath = profile.role === 'admin' ? '/admin/dashboard' : '/dashboard/courses';
        navigate(dashboardPath, { replace: true });
      }
    }
  }, [user, profile, navigate, from]);

  const getFriendlyAuthError = (err, isRegisterMode) => {
    if (!err) return 'An unexpected error occurred. Please try again.';
    const msg = typeof err === 'string' ? err : err.message || '';
    if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
      return 'The email address or password you entered is incorrect. Please check your details and try again.';
    }
    if (msg.includes('Email not confirmed') || msg.includes('unconfirmed')) {
      return 'Your email address has not been verified yet. Please check your inbox for the verification link.';
    }
    if (msg.includes('User already registered') || msg.includes('already exists')) {
      return 'An account with this email address already exists. Please sign in with your password.';
    }
    if (msg.includes('Password should be at least') || msg.includes('weak_password')) {
      return 'Your password must be at least 6 characters long.';
    }
    if (msg.includes('rate limit') || msg.includes('Too many requests')) {
      return 'Too many attempts. Please wait a moment before trying again.';
    }
    if (msg.includes('Network') || msg.includes('Failed to fetch')) {
      return 'Could not reach the authentication server. Please check your internet connection.';
    }
    return isRegisterMode
      ? 'Unable to create your account right now. Please check your information and try again.'
      : 'Unable to sign in. Please check your credentials and try again.';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccessMessage('');
    try {
      await login(email, password);
    } catch (err) {
      setError(getFriendlyAuthError(err, false));
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("The passwords you entered do not match. Please re-enter them.");
      return;
    }
    setError('');
    setLoading(true);
    setSuccessMessage('');
    try {
      await register(email, password);
      setSuccessMessage('Account created successfully! Please check your email to verify your address.');
      setIsRegister(false);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(getFriendlyAuthError(err, true));
    } finally {
      setLoading(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen bg-primary text-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <motion.div
        className="w-full max-w-md p-6 sm:p-8 bg-neutral-800 rounded-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="text-3xl sm:text-4xl font-bold text-accent">
            DoRight
          </Link>
          <p className="text-neutral-400 mt-2 text-sm sm:text-base">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {error && (
          <motion.div
            className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 sm:mb-6 flex items-center text-sm sm:text-base"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SafeIcon icon={FiAlertCircle} className="mr-2 sm:mr-3 w-4 h-4" />
            <span>{error}</span>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            className="bg-green-500/20 text-green-300 p-3 rounded-lg mb-4 sm:mb-6 flex items-center text-sm sm:text-base"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <SafeIcon icon={FiAlertCircle} className="mr-2 sm:mr-3 w-4 h-4" />
            <span>{successMessage}</span>
          </motion.div>
        )}

        <motion.form
          variants={formVariants}
          initial="hidden"
          animate="visible"
          onSubmit={isRegister ? handleRegister : handleLogin}
        >
          <div className="space-y-4 sm:space-y-6">
            <div className="relative">
              <label htmlFor="login-email" className="sr-only">Email</label>
              <SafeIcon icon={FiMail} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                id="login-email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg py-3 px-10 sm:px-12 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
                required
              />
            </div>
            <div className="relative">
              <label htmlFor="login-password" className="sr-only">Password</label>
              <SafeIcon icon={FiLock} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                id="login-password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-700 border border-neutral-600 rounded-lg py-3 px-10 sm:px-12 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
                required
              />
            </div>
            {isRegister && (
              <div className="relative">
                <label htmlFor="login-confirm-password" className="sr-only">Confirm Password</label>
                <SafeIcon icon={FiLock} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  id="login-confirm-password"
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-neutral-700 border border-neutral-600 rounded-lg py-3 px-10 sm:px-12 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
                  required
                />
              </div>
            )}
          </div>
          <motion.button
            type="submit"
            className="w-full mt-6 sm:mt-8 bg-accent text-primary font-bold py-3 rounded-lg flex items-center justify-center transition-all duration-300 hover:brightness-90 disabled:opacity-50 text-sm sm:text-base"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            <SafeIcon icon={isRegister ? FiUserPlus : FiLogIn} className="mr-2 w-4 h-4" />
            {loading ? 'Processing...' : (isRegister ? 'Register' : 'Login')}
          </motion.button>
        </motion.form>

        <div className="mt-6 sm:mt-8 text-center text-neutral-400">
          <button
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccessMessage('');
            }}
            className="hover:text-accent transition-colors duration-300 text-sm sm:text-base"
          >
            {isRegister
              ? 'Already have an account? Log in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;