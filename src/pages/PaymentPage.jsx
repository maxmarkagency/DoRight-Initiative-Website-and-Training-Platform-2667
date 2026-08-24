import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import { FaHandshake, FaWhatsapp, FaBuildingColumns, FaShieldHalved } from 'react-icons/fa6';
import SafeIcon from '../common/SafeIcon';
import useSeo from '../hooks/useSeo';
import supabase from '../lib/supabase';
import {
  PAYMENT_PURPOSES,
  DEFAULT_BANK_DETAILS,
  formatCurrency,
  initializePaystackPayment,
  submitBankTransferNotification,
} from '../services/paystackService';

const {
  FiCheck,
  FiCopy,
  FiArrowRight,
  FiCreditCard,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiPrinter,
  FiShare2,
  FiRefreshCw,
  FiAward,
  FiUserCheck,
  FiGift,
  FiHeart,
  FiInfo,
  FiHelpCircle,
  FiChevronDown,
  FiExternalLink,
  FiPhone,
  FiMail,
} = FiIcons;

const FAQS = [
  {
    q: 'How are my contributions utilized?',
    a: '100% of contributions are allocated directly to civic literacy outreaches, secondary school youth integrity clubs, public governance accountability campaigns, community townhalls, and advocacy publications across Nigeria.',
  },
  {
    q: 'Is online payment secure?',
    a: 'Yes. All online transactions are processed through Paystack, a PCI-DSS Level 1 certified payment gateway with 256-bit bank-grade encryption. Your card details are never stored on our servers.',
  },
  {
    q: 'Can I pay via Direct Bank Transfer?',
    a: 'Absolutely. Select the "Direct Bank Transfer" tab above to view our official Guaranty Trust Bank [GTB] account (0694857871). Once you make the transfer, click "Notify Us" or send confirmation on WhatsApp/email to receive your official receipt.',
  },
  {
    q: 'Can organizations or corporations partner with DoRight?',
    a: 'Yes. Corporate and institutional allies can sponsor programs or establish strategic partnerships. Select the "Partnership" or "Sponsorship" category and enter your organization name.',
  },
  {
    q: 'Will I receive an official receipt?',
    a: 'Yes. An automated digital receipt is generated immediately upon successful payment with your unique transaction reference. You will also receive an email confirmation.',
  },
];

const PaymentPage = () => {
  useSeo({
    path: '/pay',
    title: 'Support & Make a Payment',
    description:
      'Make payments for Sponsorship, Strategic Partnership, Membership Registration, and Civic Donations to DoRight Awareness Initiative via Paystack or Direct Bank Transfer.',
  });

  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  // Bank settings from Supabase or default
  const [bankDetails, setBankDetails] = useState(DEFAULT_BANK_DETAILS);

  // Purpose tab state
  const initialPurpose =
    queryParams.get('purpose') && PAYMENT_PURPOSES[queryParams.get('purpose')]
      ? queryParams.get('purpose')
      : 'sponsorship';

  const [activePurposeKey, setActivePurposeKey] = useState(initialPurpose);
  const activePurpose = PAYMENT_PURPOSES[activePurposeKey] || PAYMENT_PURPOSES.sponsorship;

  // Amount state
  const initialAmount =
    Number(queryParams.get('amount')) || activePurpose.defaultAmount;
  const [selectedAmount, setSelectedAmount] = useState(initialAmount);
  const [customAmount, setCustomAmount] = useState('');
  const [isCustomAmount, setIsCustomAmount] = useState(false);

  // Payment channel: 'paystack' or 'transfer'
  const [paymentChannel, setPaymentChannel] = useState('paystack');

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: queryParams.get('name') || '',
    email: queryParams.get('email') || '',
    phone: queryParams.get('phone') || '',
    organization: queryParams.get('org') || '',
    notes: '',
    isAnonymous: false,
  });

  // Transfer Proof Form state
  const [transferSenderBank, setTransferSenderBank] = useState('');
  const [transferRefInput, setTransferRefInput] = useState('');
  const [transferSubmitted, setTransferSubmitted] = useState(false);
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);

  // UI status
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [successReceipt, setSuccessReceipt] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);

  const receiptRef = useRef(null);

  // Sync bank details from site_settings if available
  useEffect(() => {
    supabase
      .from('site_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['bank_name', 'account_name', 'account_number', 'contact_phone', 'contact_email'])
      .then(({ data, error }) => {
        if (!error && data) {
          const loaded = {};
          data.forEach((item) => {
            let val = item.setting_value;
            if (typeof val === 'string' && val.startsWith('"') && val.endsWith('"')) {
              val = val.slice(1, -1);
            }
            loaded[item.setting_key] = val;
          });

          setBankDetails((prev) => ({
            ...prev,
            bankName: loaded.bank_name || prev.bankName,
            accountName: loaded.account_name || prev.accountName,
            accountNumber: loaded.account_number || prev.accountNumber,
            supportPhone: loaded.contact_phone || prev.supportPhone,
            supportEmail: loaded.contact_email || prev.supportEmail,
          }));
        }
      });
  }, []);

  // Update selected amount when purpose changes
  const handlePurposeChange = (key) => {
    setActivePurposeKey(key);
    const purpose = PAYMENT_PURPOSES[key];
    setIsCustomAmount(false);
    setCustomAmount('');
    setSelectedAmount(purpose.defaultAmount);
    setErrorMessage('');
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setIsCustomAmount(false);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(rawVal);
    setIsCustomAmount(true);
    setSelectedAmount(Number(rawVal) || 0);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errorMessage) setErrorMessage('');
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const finalAmount = isCustomAmount ? Number(customAmount) : Number(selectedAmount);

  // Validate form
  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setErrorMessage('Please enter your Full Name.');
      return false;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setErrorMessage('Please enter a valid Email Address.');
      return false;
    }
    if (!finalAmount || finalAmount < 500) {
      setErrorMessage('Minimum amount is ₦500.');
      return false;
    }
    return true;
  };

  // Trigger Paystack Payment
  const handlePaystackPayment = () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    setErrorMessage('');

    initializePaystackPayment({
      email: formData.email,
      amount: finalAmount,
      customerName: formData.fullName,
      phone: formData.phone,
      organization: formData.organization,
      purpose: activePurposeKey,
      notes: formData.notes,
      metadata: {
        is_anonymous: formData.isAnonymous,
        source_url: window.location.href,
      },
      onSuccess: (paymentRecord) => {
        setIsProcessing(false);
        setSuccessReceipt({
          reference: paymentRecord.reference,
          customerName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          organization: formData.organization,
          amount: finalAmount,
          purpose: activePurpose.title,
          purposeKey: activePurposeKey,
          channel: 'Paystack Online (Card/USSD/Bank)',
          status: 'Successful',
          date: new Date().toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        });
      },
      onClose: () => {
        setIsProcessing(false);
      },
      onError: (err) => {
        setIsProcessing(false);
        setErrorMessage(
          err.message || 'Payment initiation failed. Please try again or use Bank Transfer.'
        );
      },
    });
  };

  // Submit Bank Transfer Proof
  const handleTransferNotification = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmittingTransfer(true);
    setErrorMessage('');

    try {
      const record = await submitBankTransferNotification({
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        purpose: activePurposeKey,
        amount: finalAmount,
        notes: formData.notes,
        bankUsed: transferSenderBank,
        transferReference: transferRefInput,
      });

      setIsSubmittingTransfer(false);
      setTransferSubmitted(true);
      setSuccessReceipt({
        reference: record.reference,
        customerName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        amount: finalAmount,
        purpose: activePurpose.title,
        purposeKey: activePurposeKey,
        channel: 'Direct Bank Transfer',
        status: 'Pending Verification',
        date: new Date().toLocaleDateString('en-NG', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        isTransferNotice: true,
      });
    } catch (err) {
      setIsSubmittingTransfer(false);
      setErrorMessage('Could not record transfer notice. Please send details to info@doright.ng');
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const whatsappMessage = encodeURIComponent(
    `Hello DoRight Team, I just initiated a payment/transfer for ${activePurpose.title}.\n` +
      `Name: ${formData.fullName || 'Supporter'}\n` +
      `Amount: ${formatCurrency(finalAmount)}\n` +
      `Purpose: ${activePurpose.title}\n` +
      `Email: ${formData.email}\n` +
      (transferRefInput ? `Ref/Narration: ${transferRefInput}\n` : '') +
      `Please confirm receipt. Thank you!`
  );

  const whatsappUrl = `https://wa.me/2349123399968?text=${whatsappMessage}`;

  return (
    <div className="min-h-screen bg-primary text-white pt-24 pb-20 selection:bg-accent selection:text-black">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-yellow-500/10 via-transparent to-transparent pointer-events-none blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs sm:text-sm font-medium mb-4"
          >
            <SafeIcon icon={FaShieldHalved} className="w-3.5 h-3.5" />
            <span>Secure Giving & Support Portal</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-white tracking-tight"
          >
            Powering A Nigeria That{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">
              Does Right
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-sm sm:text-base md:text-lg text-neutral-300 max-w-2xl mx-auto"
          >
            Every contribution directly funds youth integrity training, grassroots accountability
            monitoring, public webinars, and civic transformation across our nation.
          </motion.p>
        </div>

        {/* Main Payment Container Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Purpose & Details Form (7 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Step 1: Select Purpose Tabs */}
            <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 sm:p-7 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                  Step 1 • Choose Category
                </span>
                <span className="text-xs text-neutral-400">Select payment reason</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {Object.values(PAYMENT_PURPOSES).map((purpose) => {
                  const isActive = activePurposeKey === purpose.id;
                  let Icon = FiHeart;
                  if (purpose.id === 'sponsorship') Icon = FiAward;
                  if (purpose.id === 'partnership') Icon = FaHandshake;
                  if (purpose.id === 'registration') Icon = FiUserCheck;
                  if (purpose.id === 'donation') Icon = FiGift;

                  return (
                    <button
                      key={purpose.id}
                      type="button"
                      onClick={() => handlePurposeChange(purpose.id)}
                      className={`relative flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                        isActive
                          ? 'bg-yellow-400/15 border-yellow-400 text-white shadow-md shadow-yellow-400/10'
                          : 'bg-gray-800/60 border-gray-700/80 text-gray-300 hover:bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <SafeIcon
                        icon={Icon}
                        className={`w-5 h-5 mb-2 transition-colors ${
                          isActive ? 'text-yellow-400' : 'text-gray-400'
                        }`}
                      />
                      <span className="text-xs sm:text-sm font-medium tracking-tight leading-tight">
                        {purpose.title.split(' ')[0]}
                      </span>
                      {isActive && (
                        <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-yellow-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Purpose Banner / Description */}
              <div className="mt-5 p-4 rounded-xl bg-gray-800/70 border border-gray-700/70">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>{activePurpose.title}</span>
                      <span className="px-2 py-0.5 text-[11px] font-normal rounded-full bg-yellow-400/20 text-yellow-400 border border-yellow-400/30">
                        {activePurpose.badge}
                      </span>
                    </h3>
                    <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                      {activePurpose.description}
                    </p>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-700/60 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {activePurpose.impactPoints.map((pt, i) => (
                    <div key={i} className="flex items-start space-x-1.5 text-[11px] text-gray-300">
                      <SafeIcon
                        icon={FiCheck}
                        className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5"
                      />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Select Amount */}
            <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 sm:p-7 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                  Step 2 • Select Amount
                </span>
                <span className="text-xs text-neutral-400">Currency: NGN (₦)</span>
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {activePurpose.presetAmounts.map((amt) => {
                  const isSelected = !isCustomAmount && selectedAmount === amt;
                  return (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAmountSelect(amt)}
                      className={`py-3 px-4 rounded-xl font-semibold text-sm sm:text-base border transition-all duration-150 ${
                        isSelected
                          ? 'bg-yellow-400 text-black border-yellow-400 shadow-md shadow-yellow-400/20 font-bold scale-[1.02]'
                          : 'bg-gray-800/80 text-white border-gray-700 hover:border-gray-500 hover:bg-gray-800'
                      }`}
                    >
                      {formatCurrency(amt)}
                    </button>
                  );
                })}
              </div>

              {/* Custom amount field */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Or enter a custom amount (₦)
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-yellow-400 font-bold text-base">
                    ₦
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="e.g. 75,000"
                    value={customAmount ? Number(customAmount).toLocaleString() : ''}
                    onChange={handleCustomAmountChange}
                    className={`block w-full pl-9 pr-4 py-3 bg-gray-800/90 border text-white text-base rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all ${
                      isCustomAmount
                        ? 'border-yellow-400 ring-1 ring-yellow-400 bg-gray-800'
                        : 'border-gray-700'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Payer / Contributor Details */}
            <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-5 sm:p-7 shadow-xl backdrop-blur-sm space-y-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400">
                  Step 3 • Your Information
                </span>
                <span className="text-xs text-neutral-400">For receipt & confirmation</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Full Name <span className="text-yellow-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. Chukwuma Adebayo"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-gray-800/90 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Email Address <span className="text-yellow-400">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="e.g. name@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-gray-800/90 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="e.g. +234 801 234 5678"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-gray-800/90 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1">
                    Organization / Company{' '}
                    {activePurposeKey === 'partnership' && (
                      <span className="text-yellow-400">*</span>
                    )}
                  </label>
                  <input
                    type="text"
                    name="organization"
                    placeholder="e.g. Acme Foundation / Self"
                    value={formData.organization}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-gray-800/90 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                  Dedication / Notes / Specific Project (Optional)
                </label>
                <textarea
                  rows={2}
                  name="notes"
                  placeholder="Mention if you want this directed to a specific state, school outreach, or youth club..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 bg-gray-800/90 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <label className="flex items-center space-x-2 text-xs text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isAnonymous"
                    checked={formData.isAnonymous}
                    onChange={handleInputChange}
                    className="rounded bg-gray-800 border-gray-700 text-yellow-400 focus:ring-yellow-400 focus:ring-offset-gray-900"
                  />
                  <span>Make this contribution anonymous on public reports</span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Checkout & Payment Channels (5 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="lg:col-span-5 space-y-6 sticky top-24"
          >
            {/* Payment Method Switcher Card */}
            <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-5">
                <div>
                  <h3 className="text-lg font-heading font-bold text-white">Payment Method</h3>
                  <p className="text-xs text-neutral-400">Choose how you want to pay</p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Total Amount</span>
                  <span className="text-xl font-bold text-yellow-400">
                    {formatCurrency(finalAmount)}
                  </span>
                </div>
              </div>

              {/* Method Switcher Tabs */}
              <div className="grid grid-cols-2 p-1 bg-gray-800/80 rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentChannel('paystack');
                    setErrorMessage('');
                  }}
                  className={`flex items-center justify-center space-x-2 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    paymentChannel === 'paystack'
                      ? 'bg-yellow-400 text-black shadow-md'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <SafeIcon icon={FiCreditCard} className="w-4 h-4" />
                  <span>Pay Online</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentChannel('transfer');
                    setErrorMessage('');
                  }}
                  className={`flex items-center justify-center space-x-2 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                    paymentChannel === 'transfer'
                      ? 'bg-yellow-400 text-black shadow-md'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <SafeIcon icon={FaBuildingColumns} className="w-4 h-4" />
                  <span>Bank Transfer</span>
                </button>
              </div>

              {/* Error Display */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-center space-x-2"
                  >
                    <SafeIcon icon={FiAlertCircle} className="w-4 h-4 flex-shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Option A: Pay Online with Paystack */}
              {paymentChannel === 'paystack' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gray-800/40 border border-gray-700/60 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-gray-300">
                      <span>Supported Channels:</span>
                      <span className="text-yellow-400 font-medium">Instant Confirmation</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-gray-400">
                      <span className="px-2 py-1 bg-gray-800 rounded-md border border-gray-700">
                        💳 Cards (Visa, Mastercard, Verve)
                      </span>
                      <span className="px-2 py-1 bg-gray-800 rounded-md border border-gray-700">
                        📱 USSD (*737#, *894#)
                      </span>
                      <span className="px-2 py-1 bg-gray-800 rounded-md border border-gray-700">
                        🏦 Bank Transfer
                      </span>
                      <span className="px-2 py-1 bg-gray-800 rounded-md border border-gray-700">
                         Apple Pay
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={handlePaystackPayment}
                    className="w-full py-3.5 px-6 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-base shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isProcessing ? (
                      <>
                        <SafeIcon icon={FiRefreshCw} className="w-5 h-5 animate-spin" />
                        <span>Opening Paystack Checkout...</span>
                      </>
                    ) : (
                      <>
                        <SafeIcon icon={FiLock} className="w-4 h-4 text-black/70" />
                        <span>Pay {formatCurrency(finalAmount)} Now</span>
                        <SafeIcon
                          icon={FiArrowRight}
                          className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                        />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center space-x-2 text-[11px] text-gray-400 pt-2">
                    <SafeIcon icon={FiLock} className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Secured by Paystack • PCI-DSS Level 1 Compliant</span>
                  </div>
                </div>
              )}

              {/* Option B: Direct Bank Transfer */}
              {paymentChannel === 'transfer' && (
                <div className="space-y-4">
                  {/* Official Bank Account Card */}
                  <div className="p-4 rounded-xl bg-gray-800/80 border border-yellow-400/30 space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/5 rounded-full blur-2xl" />

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] uppercase font-bold text-yellow-400 tracking-wider">
                        Official DRAI Account
                      </span>
                      <span className="text-[10px] text-gray-400 px-2 py-0.5 bg-gray-900 rounded-full border border-gray-700">
                        {bankDetails.accountType}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Bank Name */}
                      <div className="flex items-center justify-between py-1 border-b border-gray-700/60">
                        <span className="text-gray-400">Bank Name:</span>
                        <span className="font-semibold text-white">{bankDetails.bankName}</span>
                      </div>

                      {/* Account Name */}
                      <div className="flex items-center justify-between py-1 border-b border-gray-700/60">
                        <span className="text-gray-400">Account Name:</span>
                        <span className="font-semibold text-white text-right max-w-[200px] truncate">
                          {bankDetails.accountName}
                        </span>
                      </div>

                      {/* Account Number with 1-click Copy */}
                      <div className="flex items-center justify-between py-1.5 bg-gray-900/90 px-3 rounded-lg border border-gray-700">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Account Number</span>
                          <span className="font-mono text-base font-bold text-yellow-400 tracking-wider">
                            {bankDetails.accountNumber}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(bankDetails.accountNumber, 'accountNumber')}
                          className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md bg-yellow-400 text-black text-xs font-semibold hover:bg-yellow-500 transition-colors"
                        >
                          <SafeIcon
                            icon={copiedField === 'accountNumber' ? FiCheck : FiCopy}
                            className="w-3.5 h-3.5"
                          />
                          <span>
                            {copiedField === 'accountNumber' ? 'Copied!' : 'Copy'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="text-[11px] text-gray-400 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-gray-800">
                      💡 <strong className="text-gray-300">Narration Advice:</strong> Please include your{' '}
                      <span className="text-yellow-400 font-semibold">{formData.fullName || 'Full Name'}</span>{' '}
                      or Phone in the transfer remarks.
                    </div>
                  </div>

                  {/* Transfer Notice Accordion / Form */}
                  <form onSubmit={handleTransferNotification} className="space-y-3 pt-2">
                    <div className="text-xs font-semibold text-gray-300">
                      Send Proof / Notify After Transfer:
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Your Bank (e.g. GTBank)"
                        value={transferSenderBank}
                        onChange={(e) => setTransferSenderBank(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Session ID / Narration"
                        value={transferRefInput}
                        onChange={(e) => setTransferRefInput(e.target.value)}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <button
                        type="submit"
                        disabled={isSubmittingTransfer}
                        className="py-2.5 px-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                      >
                        {isSubmittingTransfer ? (
                          <SafeIcon icon={FiRefreshCw} className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <SafeIcon icon={FiCheckCircle} className="w-3.5 h-3.5" />
                        )}
                        <span>I Have Made Transfer</span>
                      </button>

                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5 text-center"
                      >
                        <SafeIcon icon={FaWhatsapp} className="w-4 h-4" />
                        <span>Confirm on WhatsApp</span>
                      </a>
                    </div>
                  </form>
                </div>
              )}
            </div>

            {/* Need Assistance Card */}
            <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center text-yellow-400">
                  <SafeIcon icon={FiPhone} className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white">Need Support?</div>
                  <div className="text-gray-400">{bankDetails.supportPhone}</div>
                </div>
              </div>
              <a
                href={`mailto:${bankDetails.supportEmail}`}
                className="text-yellow-400 hover:underline flex items-center space-x-1"
              >
                <span>Email Us</span>
                <SafeIcon icon={FiArrowRight} className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </div>

        {/* FAQ & Transparency Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Clear answers regarding financial transparency and payment options.
            </p>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-gray-800 bg-gray-900/70 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left text-sm font-semibold text-white hover:text-yellow-400 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <SafeIcon
                      icon={FiChevronDown}
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-yellow-400' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-5 pb-4 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-gray-800/60 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Success / Digital Receipt Modal */}
      <AnimatePresence>
        {successReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-gray-900 border border-yellow-400/40 rounded-2xl shadow-2xl p-6 sm:p-8 text-white my-8"
            >
              {/* Receipt Header */}
              <div className="text-center pb-6 border-b border-gray-800">
                <div className="w-14 h-14 bg-yellow-400/20 text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-3 border border-yellow-400/30">
                  <SafeIcon icon={FiCheckCircle} className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-heading font-bold text-white">
                  {successReceipt.isTransferNotice
                    ? 'Transfer Notice Received'
                    : 'Payment Successful!'}
                </h3>
                <p className="text-xs text-neutral-300 mt-1">
                  Thank you for standing with DoRight Awareness Initiative.
                </p>
              </div>

              {/* Printable Receipt Body */}
              <div ref={receiptRef} className="py-5 space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between py-1.5 border-b border-gray-800">
                  <span className="text-gray-400">Transaction Reference:</span>
                  <span className="font-mono font-semibold text-yellow-400 break-all">
                    {successReceipt.reference}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-800">
                  <span className="text-gray-400">Contributor:</span>
                  <span className="font-semibold text-white">{successReceipt.customerName}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-800">
                  <span className="text-gray-400">Email:</span>
                  <span className="text-neutral-300">{successReceipt.email}</span>
                </div>

                {successReceipt.organization && (
                  <div className="flex justify-between py-1.5 border-b border-gray-800">
                    <span className="text-gray-400">Organization:</span>
                    <span className="text-neutral-300">{successReceipt.organization}</span>
                  </div>
                )}

                <div className="flex justify-between py-1.5 border-b border-gray-800">
                  <span className="text-gray-400">Purpose:</span>
                  <span className="font-semibold text-white">{successReceipt.purpose}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-800">
                  <span className="text-gray-400">Channel:</span>
                  <span className="text-neutral-300">{successReceipt.channel}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-gray-800">
                  <span className="text-gray-400">Date:</span>
                  <span className="text-neutral-300">{successReceipt.date}</span>
                </div>

                <div className="flex justify-between py-2 pt-3 text-base font-bold bg-gray-800/60 px-3 rounded-lg">
                  <span>Amount:</span>
                  <span className="text-yellow-400">{formatCurrency(successReceipt.amount)}</span>
                </div>
              </div>

              {/* Receipt Modal Actions */}
              <div className="pt-4 space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="py-2.5 px-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <SafeIcon icon={FiPrinter} className="w-3.5 h-3.5" />
                    <span>Print Receipt</span>
                  </button>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `I just supported the DoRight Awareness Initiative with ${formatCurrency(
                        successReceipt.amount
                      )}! Join the movement to build an accountable Nigeria at https://doright.ng/pay`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors text-center"
                  >
                    <SafeIcon icon={FaWhatsapp} className="w-3.5 h-3.5" />
                    <span>Share Impact</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSuccessReceipt(null);
                    setTransferSubmitted(false);
                    setTransferRefInput('');
                    setTransferSenderBank('');
                  }}
                  className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl text-xs sm:text-sm transition-colors"
                >
                  Close & Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PaymentPage;
