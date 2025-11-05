// Email validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation - at least 8 characters, uppercase, lowercase, number, special character
const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// Phone validation (international format)
const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

// URL validation
const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Slug validation (URL-friendly string)
const validateSlug = (slug) => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

// Course price validation
const validatePrice = (price) => {
  return typeof price === 'number' && price >= 0 && price <= 999999.99;
};

// Currency code validation (3-letter ISO codes)
const validateCurrency = (currency) => {
  const validCurrencies = ['USD', 'EUR', 'GBP', 'NGN', 'ZAR', 'KES', 'GHS'];
  return validCurrencies.includes(currency);
};

// Duration validation (in seconds)
const validateDuration = (duration) => {
  return typeof duration === 'number' && duration >= 0 && duration <= 86400; // Max 24 hours
};

// Course status validation
const validateCourseStatus = (status) => {
  const validStatuses = ['draft', 'published', 'archived'];
  return validStatuses.includes(status);
};

// User role validation
const validateUserRole = (role) => {
  const validRoles = ['student', 'instructor', 'admin', 'staff'];
  return validRoles.includes(role);
};

// Enrollment status validation
const validateEnrollmentStatus = (status) => {
  const validStatuses = ['active', 'completed', 'cancelled', 'expired'];
  return validStatuses.includes(status);
};

// Quiz question type validation
const validateQuestionType = (type) => {
  const validTypes = ['mcq', 'multiple_choice', 'true_false', 'short_answer', 'long_answer', 'fill_blank'];
  return validTypes.includes(type);
};

// File size validation (in bytes)
const validateFileSize = (size, maxSizeBytes = 100 * 1024 * 1024) => { // Default 100MB
  return typeof size === 'number' && size > 0 && size <= maxSizeBytes;
};

// MIME type validation
const validateMimeType = (mimeType, allowedTypes = []) => {
  if (allowedTypes.length === 0) {
    // Default allowed types for LMS
    allowedTypes = [
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'audio/mp3', 'audio/wav', 'audio/ogg'
    ];
  }
  return allowedTypes.includes(mimeType);
};

// Pagination validation
const validatePagination = (page, limit, maxLimit = 100) => {
  const validPage = typeof page === 'number' && page >= 1;
  const validLimit = typeof limit === 'number' && limit >= 1 && limit <= maxLimit;
  return { validPage, validLimit };
};

// Text length validation
const validateTextLength = (text, minLength = 0, maxLength = 1000) => {
  if (typeof text !== 'string') return false;
  return text.length >= minLength && text.length <= maxLength;
};

// JSON validation
const validateJSON = (jsonString) => {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
};

// UUID validation
const validateUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Sanitize HTML (basic)
const sanitizeHtml = (html) => {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
};

// Generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

// Validate course content structure
const validateCourseContent = (content) => {
  if (!content || typeof content !== 'object') return false;

  const validTypes = ['video', 'text', 'pdf', 'quiz', 'assignment'];
  
  if (!content.type || !validTypes.includes(content.type)) return false;

  switch (content.type) {
    case 'video':
      return validateUrl(content.video_url) && validateDuration(content.duration);
    case 'text':
      return validateTextLength(content.html, 1, 50000);
    case 'pdf':
      return validateUrl(content.pdf_url);
    case 'quiz':
      return content.quiz_id && validateUUID(content.quiz_id);
    case 'assignment':
      return validateTextLength(content.instructions, 1, 5000);
    default:
      return false;
  }
};

// Validate quiz answers structure
const validateQuizAnswers = (answers, questions) => {
  if (!Array.isArray(answers) || !Array.isArray(questions)) return false;
  if (answers.length !== questions.length) return false;

  return answers.every((answer, index) => {
    const question = questions[index];
    if (!question) return false;

    switch (question.question_type) {
      case 'mcq':
      case 'true_false':
        return typeof answer === 'number' && answer >= 0 && answer < question.options.length;
      case 'multiple_choice':
        return Array.isArray(answer) && answer.every(a => typeof a === 'number' && a >= 0 && a < question.options.length);
      case 'short_answer':
        return typeof answer === 'string' && answer.length <= 500;
      case 'long_answer':
        return typeof answer === 'string' && answer.length <= 5000;
      default:
        return false;
    }
  });
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhone,
  validateUrl,
  validateSlug,
  validatePrice,
  validateCurrency,
  validateDuration,
  validateCourseStatus,
  validateUserRole,
  validateEnrollmentStatus,
  validateQuestionType,
  validateFileSize,
  validateMimeType,
  validatePagination,
  validateTextLength,
  validateJSON,
  validateUUID,
  sanitizeHtml,
  generateSlug,
  validateCourseContent,
  validateQuizAnswers
};