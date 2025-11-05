import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiArrowRight, FiCheck, FiCalendar, FiStar, FiAward, FiGlobe, FiTarget } = FiIcons;

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthMonth: '',
    birthDay: '',
    birthYear: ''
  });

  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Floating elements for background animation (same as Home page)
  const floatingElements = [
    { icon: FiStar, delay: 0, x: 20, y: -20 },
    { icon: FiAward, delay: 0.5, x: -30, y: 30 },
    { icon: FiGlobe, delay: 1, x: 40, y: 20 },
    { icon: FiTarget, delay: 1.5, x: -20, y: -30 }
  ];

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/training';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }
    if (!isLogin) {
      if (!formData.firstName || !formData.lastName) {
        setError('First name and last name are required');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.password
        );
      }

      if (result.success) {
        setSuccess(isLogin ? 'Welcome back!' : 'Account created successfully! You are now signed in.');
        // Brief delay to show success message,then redirect
        setTimeout(() => {
          const from = location.state?.from?.pathname || '/training';
          navigate(from, { replace: true });
        }, 1000);
      } else {
        setError(result.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      birthMonth: '',
      birthDay: '',
      birthYear: ''
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-primary via-neutral-800 to-black text-white py-12 px-4 w-full overflow-hidden relative"
    >
      {/* Animated Background Elements - Same as Home page */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 80%,rgba(255,215,0,0.1) 0%,transparent 50%)",
              "radial-gradient(circle at 80% 20%,rgba(255,215,0,0.1) 0%,transparent 50%)",
              "radial-gradient(circle at 40% 40%,rgba(255,215,0,0.1) 0%,transparent 50%)"
            ]
          }}
          transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0"
        />
        {/* Floating geometric shapes */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 right-1/4 w-32 h-32 border border-accent/20 rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 left-1/4 w-24 h-24 border-2 border-white/10 rotate-45"
        />
        {/* Floating icons */}
        {floatingElements.map((element, index) => (
          <motion.div
            key={index}
            animate={{ y: [0, element.y, 0], x: [0, element.x, 0], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, delay: element.delay, ease: "easeInOut" }}
            className="absolute hidden lg:block"
            style={{ top: `${20 + index * 15}%`, right: `${10 + index * 20}%` }}
          >
            <SafeIcon icon={element.icon} className="w-8 h-8 text-accent/30" />
          </motion.div>
        ))}
      </div>

      <div className="relative max-w-md w-full mx-auto">
        {/* Header with Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <motion.img whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} src="https://quest-media-storage-bucket.s3.us-east-2.amazonaws.com/1759755907515-drai.png" alt="DRAI Logo" className="h-16 w-auto mx-auto" />
          </Link>
          <motion.h1 className="text-2xl font-heading font-bold text-white mb-2" animate={{ color: ['#FFFFFF', '#FFD700', '#FFFFFF'] }} transition={{ duration: 3, repeat: Infinity }}>
            {isLogin ? 'Welcome Back' : 'Join DRAI'}
          </motion.h1>
          <p className="text-neutral-300"> {isLogin ? 'Sign in to continue your learning journey' : 'Create an account to start learning'} </p>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-white/20">
          {/* Success Message */}
          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-green-500/20 border border-green-400/30 rounded-lg p-4 mb-6 flex items-center backdrop-blur-sm">
              <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-400 mr-3" />
              <span className="text-green-100">{success}</span>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mb-6 backdrop-blur-sm">
              <span className="text-red-100">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields (Register only) */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-neutral-200 mb-2"> First Name </label>
                  <div className="relative">
                    <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-neutral-400 backdrop-blur-sm" placeholder="John" required={!isLogin} />
                  </div>
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-neutral-200 mb-2"> Last Name </label>
                  <div className="relative">
                    <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                    <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-neutral-400 backdrop-blur-sm" placeholder="Doe" required={!isLogin} />
                  </div>
                </div>
              </div>
            )}
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-200 mb-2"> Email Address </label>
              <div className="relative">
                <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-neutral-400 backdrop-blur-sm" placeholder="john@example.com" required />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-200 mb-2"> Password </label>
              <div className="relative">
                <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input type={showPassword ? "text" : "password"} id="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-white placeholder-neutral-400 backdrop-blur-sm" placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-300">
                  <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button type="submit" disabled={loading} whileHover={{ scale: loading ? 1 : 1.02 }} whileTap={{ scale: loading ? 1 : 0.98 }} className="w-full bg-accent text-black px-6 py-3 rounded-lg font-semibold hover:brightness-90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg">
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-black border-t-transparent rounded-full mr-2" />
              ) : (
                <SafeIcon icon={FiArrowRight} className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </motion.button>
          </form>

          {/* Toggle Mode */}
          <div className="mt-6 text-center">
            <p className="text-neutral-300">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button onClick={toggleMode} className="ml-2 text-accent hover:brightness-90 font-semibold transition-colors">
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10 backdrop-blur-sm">
            <p className="text-sm text-neutral-200 mb-2 font-medium">Demo Credentials:</p>
            <p className="text-xs text-neutral-400"> Email: demo@doingright.ng<br /> Password: password123 </p>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8">
          <Link to="/" className="text-neutral-300 hover:text-accent transition-colors"> ← Back to Home </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Login;