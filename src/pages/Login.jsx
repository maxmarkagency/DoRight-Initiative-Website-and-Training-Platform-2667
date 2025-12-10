import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiLock, FiMail, FiLogIn, FiUserPlus, FiAlertCircle } = FiIcons;

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccessMessage('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError('');
    setLoading(true);
    setSuccessMessage('');
    try {
      await register(email, password);
      setSuccessMessage('Registration successful! Please check your email to verify your account.');
      setIsRegister(false); // Switch to login form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || "Failed to register. Please try again.");
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
        className="w-full max-w-md p-6 sm:p-8 bg-gray-800 rounded-2xl shadow-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/" className="text-3xl sm:text-4xl font-bold text-accent">
            DoRight
          </Link>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
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
              <SafeIcon icon={FiMail} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-10 sm:px-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
                required
              />
            </div>
            <div className="relative">
              <SafeIcon icon={FiLock} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-10 sm:px-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
                required
              />
            </div>
            {isRegister && (
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg py-3 px-10 sm:px-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent text-sm sm:text-base"
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

        <div className="mt-6 sm:mt-8 text-center text-gray-400">
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