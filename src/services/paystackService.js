import supabase from '../lib/supabase';

// Paystack Live / Test Public Key
export const PAYSTACK_PUBLIC_KEY =
  import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ||
  'pk_live_5ab3a41b736e7c716a5727165a510364f45436cf';

// Default Organization Bank Account details (Can be customized or loaded from site_settings)
export const DEFAULT_BANK_DETAILS = {
  bankName: 'Guaranty Trust Bank [GTB]',
  accountName: 'DOING RIGHT AWARENESS INITIATIVE',
  accountNumber: '0694857871',
  accountType: 'Corporate Account',
  supportPhone: '+234 912 339 9968',
  supportEmail: 'admin@doright.ng',
};

// Preset payment configurations per purpose
export const PAYMENT_PURPOSES = {
  sponsorship: {
    id: 'sponsorship',
    title: 'Sponsorship',
    subtitle: 'Sponsor an initiative, youth integrity club, school outreach, or civic campaign',
    badge: 'Impact Champion',
    description:
      'Directly fund community programs, student integrity workshops, public accountability webinars, and anti-corruption advocacy campaigns across Nigerian states.',
    presetAmounts: [25000, 50000, 100000, 250000, 500000, 1000000],
    defaultAmount: 50000,
    impactPoints: [
      'Empowers youth leadership & integrity clubs in secondary schools',
      'Funds grassroots townhall meetings and civic advocacy',
      'Provides public governance watchdog toolkits & educational kits',
    ],
  },
  partnership: {
    id: 'partnership',
    title: 'Partnership',
    subtitle: 'Strategic collaboration for organizations, institutions, and corporate allies',
    badge: 'Institutional Partner',
    description:
      'Collaborate strategically with DoRight to scale sustainable civic transformation, corporate governance training, community development, and policy advocacy.',
    presetAmounts: [100000, 250000, 500000, 1000000, 2500000, 5000000],
    defaultAmount: 250000,
    impactPoints: [
      'Co-branded civic campaigns & joint state-wide interventions',
      'Specialized ethics & leadership workshops for institutions',
      'Direct quarterly accountability & social return reports',
    ],
  },
  registration: {
    id: 'registration',
    title: 'Registration & Dues',
    subtitle: 'Member onboarding, cohort registration, certification, or annual dues',
    badge: 'Official Member',
    description:
      'Pay your official DoRight membership enrollment, certification, annual commitment dues, or specialized leadership cohort training fees.',
    presetAmounts: [5000, 10000, 20000, 50000, 100000],
    defaultAmount: 10000,
    impactPoints: [
      'Official verified Member ID Card & verified registry badge',
      'Access to exclusive sub-committees, resources, and governance circles',
      'Certificate of membership and leadership credentialing',
    ],
  },
  donation: {
    id: 'donation',
    title: 'General Support / Donation',
    subtitle: 'Give any amount to sustain our mission of building an accountable Nigeria',
    badge: 'Civic Supporter',
    description:
      'Every naira helps our independent volunteers keep advocating for integrity, transparency, good governance, and civic responsibility.',
    presetAmounts: [2500, 5000, 10000, 25000, 50000, 100000],
    defaultAmount: 10000,
    impactPoints: [
      '100% committed to mission-driven civic education and community outreach',
      'Transparent financial reporting and governance',
      'Open to individual and diaspora donors globally',
    ],
  },
};

/**
 * Loads Paystack inline popup script on demand
 */
export const loadPaystackScript = () => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }

    const existingScript = document.getElementById('paystack-inline-js');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.PaystackPop));
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.id = 'paystack-inline-js';
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      if (window.PaystackPop) {
        resolve(window.PaystackPop);
      } else {
        reject(new Error('Paystack SDK failed to initialize'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Paystack Inline script'));
    document.body.appendChild(script);
  });
};

/**
 * Format currency with Naira symbol or specified currency
 */
export const formatCurrency = (amount, currency = 'NGN') => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '₦0';
  }
  const numericAmount = Number(amount);
  const formatted = new Intl.NumberFormat('en-NG', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(numericAmount);

  if (currency === 'NGN') {
    return `₦${formatted}`;
  }
  return `${currency} ${formatted}`;
};

/**
 * Generate a clean, unique transaction reference
 */
export const generateReference = (prefix = 'DRAI') => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `${prefix}-${timestamp}-${randomStr}`;
};

/**
 * Initialize Paystack Inline popup
 */
export const initializePaystackPayment = async ({
  email,
  amount, // in Naira
  currency = 'NGN',
  customerName,
  phone = '',
  organization = '',
  purpose = 'sponsorship',
  notes = '',
  metadata = {},
  onSuccess,
  onClose,
  onError,
}) => {
  try {
    const PaystackPop = await loadPaystackScript();
    const reference = generateReference(
      purpose === 'sponsorship'
        ? 'DRAI-SPO'
        : purpose === 'partnership'
        ? 'DRAI-PRT'
        : purpose === 'registration'
        ? 'DRAI-REG'
        : 'DRAI-DON'
    );

    // Paystack amount is in kobo (1 NGN = 100 Kobo)
    const amountInKobo = Math.round(Number(amount) * 100);

    const handler = PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email.trim(),
      amount: amountInKobo,
      currency: currency || 'NGN',
      ref: reference,
      metadata: {
        custom_fields: [
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: customerName,
          },
          {
            display_name: 'Payment Purpose',
            variable_name: 'purpose',
            value: purpose,
          },
          {
            display_name: 'Phone Number',
            variable_name: 'phone_number',
            value: phone || 'N/A',
          },
          {
            display_name: 'Organization',
            variable_name: 'organization',
            value: organization || 'Individual',
          },
          {
            display_name: 'Notes',
            variable_name: 'notes',
            value: notes || 'N/A',
          },
        ],
        ...metadata,
      },
      callback: async function (response) {
        // Response format: { reference: "...", trans: "...", status: "success", message: "Approved", trxref: "..." }
        try {
          const paymentRecord = {
            reference: response.reference || reference,
            customer_name: customerName,
            email: email.trim(),
            phone: phone.trim(),
            organization: organization.trim(),
            purpose,
            amount: Number(amount),
            currency,
            channel: 'paystack',
            status: 'successful',
            paystack_transaction_id: response.trans || response.transaction || response.trxref || '',
            notes,
            metadata: {
              paystack_response: response,
              completed_at: new Date().toISOString(),
            },
          };

          // Save to database
          await recordPaymentToDatabase(paymentRecord);

          // Trigger automated donation acknowledgement email
          try {
            supabase.functions.invoke('send-lead-welcome-email', {
              body: {
                action: 'PAYMENT_ACKNOWLEDGEMENT',
                record: paymentRecord,
                email: email.trim(),
                fullName: customerName,
                amount: Number(amount),
              },
            }).catch((err) => console.warn('Payment acknowledgement email trigger warning:', err));
          } catch (e) {
            // Non-blocking
          }

          if (typeof onSuccess === 'function') {
            onSuccess(paymentRecord);
          }
        } catch (err) {
          console.error('Error post-processing payment:', err);
          if (typeof onSuccess === 'function') {
            onSuccess({
              reference: response.reference || reference,
              customer_name: customerName,
              email,
              amount,
              currency,
              purpose,
              status: 'successful',
            });
          }
        }
      },
      onClose: function () {
        if (typeof onClose === 'function') {
          onClose();
        }
      },
    });

    handler.openIframe();
  } catch (err) {
    console.error('Failed to initialize Paystack checkout:', err);
    if (typeof onError === 'function') {
      onError(err);
    }
  }
};

/**
 * Record a payment into the Supabase database
 */
export const recordPaymentToDatabase = async (paymentData) => {
  try {
    const { data, error } = await supabase.from('payments').insert([
      {
        reference: paymentData.reference,
        customer_name: paymentData.customer_name,
        email: paymentData.email,
        phone: paymentData.phone || null,
        organization: paymentData.organization || null,
        purpose: paymentData.purpose || 'sponsorship',
        tier_or_category: paymentData.tier_or_category || null,
        amount: paymentData.amount,
        currency: paymentData.currency || 'NGN',
        channel: paymentData.channel || 'paystack',
        status: paymentData.status || 'successful',
        paystack_transaction_id: paymentData.paystack_transaction_id || null,
        notes: paymentData.notes || null,
        proof_url: paymentData.proof_url || null,
        metadata: paymentData.metadata || {},
      },
    ]);

    if (error) {
      console.warn('Supabase payments insert error (graceful fallback):', error.message);
    }
    return data;
  } catch (e) {
    console.warn('Could not record payment to database:', e);
    return null;
  }
};

/**
 * Submit a Direct Bank Transfer notification
 */
export const submitBankTransferNotification = async ({
  customerName,
  email,
  phone = '',
  organization = '',
  purpose = 'sponsorship',
  amount,
  notes = '',
  proofUrl = '',
  bankUsed = '',
  transferReference = '',
}) => {
  const reference = transferReference || generateReference('TRF');

  const record = {
    reference,
    customer_name: customerName,
    email: email.trim(),
    phone: phone.trim(),
    organization: organization.trim(),
    purpose,
    amount: Number(amount),
    currency: 'NGN',
    channel: 'bank_transfer',
    status: 'pending_verification',
    notes,
    proof_url: proofUrl,
    metadata: {
      bank_used: bankUsed,
      submitted_at: new Date().toISOString(),
    },
  };

  await recordPaymentToDatabase(record);
  return record;
};
