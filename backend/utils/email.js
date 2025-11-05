const sgMail = require('@sendgrid/mail');
const fs = require('fs').promises;
const path = require('path');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/email.log' })
  ]
});

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Email templates directory
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates', 'emails');

// Load and compile email template
const loadTemplate = async (templateName) => {
  try {
    const templatePath = path.join(TEMPLATES_DIR, `${templateName}.html`);
    const template = await fs.readFile(templatePath, 'utf8');
    return template;
  } catch (error) {
    logger.error(`Failed to load email template: ${templateName}`, error);
    throw new Error(`Email template not found: ${templateName}`);
  }
};

// Replace template variables
const compileTemplate = (template, data = {}) => {
  let compiled = template;

  // Default data
  const defaultData = {
    site_name: process.env.SITE_NAME || 'DoRight Academy',
    site_url: process.env.SITE_URL || 'https://academy.doright.ng',
    support_email: process.env.ADMIN_EMAIL || 'support@doright.ng',
    current_year: new Date().getFullYear()
  };

  const templateData = { ...defaultData, ...data };

  // Replace variables in format {{variable_name}}
  Object.keys(templateData).forEach(key => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    compiled = compiled.replace(regex, templateData[key] || '');
  });

  return compiled;
};

// Send email function
const sendEmail = async ({ to, subject, template, data = {}, attachments = [] }) => {
  try {
    // Load and compile template
    const templateHtml = await loadTemplate(template);
    const compiledHtml = compileTemplate(templateHtml, data);

    // Email configuration
    const msg = {
      to,
      from: {
        email: process.env.FROM_EMAIL || 'noreply@doright.ng',
        name: process.env.SITE_NAME || 'DoRight Academy'
      },
      subject,
      html: compiledHtml,
      attachments
    };

    // Send email
    const result = await sgMail.send(msg);
    
    logger.info('Email sent successfully', {
      to,
      subject,
      template,
      messageId: result[0].headers['x-message-id']
    });

    return {
      success: true,
      messageId: result[0].headers['x-message-id']
    };

  } catch (error) {
    logger.error('Failed to send email', {
      to,
      subject,
      template,
      error: error.message
    });

    throw new Error('Failed to send email');
  }
};

// Send bulk emails
const sendBulkEmails = async (emails) => {
  try {
    const messages = await Promise.all(
      emails.map(async ({ to, subject, template, data = {} }) => {
        const templateHtml = await loadTemplate(template);
        const compiledHtml = compileTemplate(templateHtml, data);

        return {
          to,
          from: {
            email: process.env.FROM_EMAIL || 'noreply@doright.ng',
            name: process.env.SITE_NAME || 'DoRight Academy'
          },
          subject,
          html: compiledHtml
        };
      })
    );

    const result = await sgMail.send(messages);
    
    logger.info('Bulk emails sent successfully', {
      count: messages.length,
      messageIds: result.map(r => r.headers['x-message-id'])
    });

    return {
      success: true,
      count: messages.length,
      messageIds: result.map(r => r.headers['x-message-id'])
    };

  } catch (error) {
    logger.error('Failed to send bulk emails', {
      error: error.message,
      count: emails.length
    });

    throw new Error('Failed to send bulk emails');
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to: user.email,
    subject: `Welcome to ${process.env.SITE_NAME || 'DoRight Academy'}!`,
    template: 'welcome',
    data: {
      first_name: user.first_name,
      email: user.email
    }
  });
};

// Send course enrollment email
const sendEnrollmentEmail = async (user, course) => {
  return sendEmail({
    to: user.email,
    subject: `You're enrolled in ${course.title}`,
    template: 'enrollment',
    data: {
      first_name: user.first_name,
      course_title: course.title,
      course_url: `${process.env.SITE_URL}/courses/${course.slug}`,
      instructor_name: course.instructor_name
    }
  });
};

// Send course completion email
const sendCompletionEmail = async (user, course) => {
  return sendEmail({
    to: user.email,
    subject: `Congratulations! You've completed ${course.title}`,
    template: 'completion',
    data: {
      first_name: user.first_name,
      course_title: course.title,
      certificate_url: `${process.env.SITE_URL}/certificates/${course.id}`
    }
  });
};

// Send certificate email
const sendCertificateEmail = async (user, course, certificateUrl) => {
  return sendEmail({
    to: user.email,
    subject: `Your certificate for ${course.title}`,
    template: 'certificate',
    data: {
      first_name: user.first_name,
      course_title: course.title,
      certificate_url: certificateUrl
    },
    attachments: [
      {
        filename: `${course.title}-Certificate.pdf`,
        content: certificateUrl, // This should be the base64 content in production
        type: 'application/pdf',
        disposition: 'attachment'
      }
    ]
  });
};

// Send password reset email
const sendPasswordResetEmail = async (user, resetUrl) => {
  return sendEmail({
    to: user.email,
    subject: 'Reset your password - DoRight Academy',
    template: 'password-reset',
    data: {
      first_name: user.first_name,
      reset_url: resetUrl
    }
  });
};

// Send payment receipt email
const sendPaymentReceiptEmail = async (user, course, paymentDetails) => {
  return sendEmail({
    to: user.email,
    subject: `Payment receipt for ${course.title}`,
    template: 'payment-receipt',
    data: {
      first_name: user.first_name,
      course_title: course.title,
      amount: paymentDetails.amount,
      currency: paymentDetails.currency,
      transaction_id: paymentDetails.transaction_id,
      payment_date: new Date(paymentDetails.created_at).toLocaleDateString()
    }
  });
};

// Send assignment submission email to instructor
const sendAssignmentNotificationEmail = async (instructor, student, course, assignment) => {
  return sendEmail({
    to: instructor.email,
    subject: `New assignment submission in ${course.title}`,
    template: 'assignment-notification',
    data: {
      instructor_name: instructor.first_name,
      student_name: `${student.first_name} ${student.last_name}`,
      course_title: course.title,
      assignment_title: assignment.title,
      submission_url: `${process.env.SITE_URL}/admin/assignments/${assignment.id}/submissions`
    }
  });
};

// Send course announcement email
const sendCourseAnnouncementEmail = async (students, course, announcement) => {
  const emails = students.map(student => ({
    to: student.email,
    subject: `New announcement in ${course.title}`,
    template: 'course-announcement',
    data: {
      first_name: student.first_name,
      course_title: course.title,
      announcement_title: announcement.title,
      announcement_content: announcement.content,
      course_url: `${process.env.SITE_URL}/courses/${course.slug}`
    }
  }));

  return sendBulkEmails(emails);
};

// Send reminder email for incomplete courses
const sendCourseReminderEmail = async (user, course, lastActivity) => {
  return sendEmail({
    to: user.email,
    subject: `Continue learning: ${course.title}`,
    template: 'course-reminder',
    data: {
      first_name: user.first_name,
      course_title: course.title,
      course_url: `${process.env.SITE_URL}/courses/${course.slug}`,
      last_activity: new Date(lastActivity).toLocaleDateString(),
      progress_percentage: course.progress_percentage
    }
  });
};

// Email templates validation
const validateEmailTemplate = async (templateName) => {
  try {
    await loadTemplate(templateName);
    return true;
  } catch {
    return false;
  }
};

// Get available email templates
const getAvailableTemplates = async () => {
  try {
    const files = await fs.readdir(TEMPLATES_DIR);
    return files
      .filter(file => file.endsWith('.html'))
      .map(file => file.replace('.html', ''));
  } catch (error) {
    logger.error('Failed to get available templates', error);
    return [];
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  sendWelcomeEmail,
  sendEnrollmentEmail,
  sendCompletionEmail,
  sendCertificateEmail,
  sendPasswordResetEmail,
  sendPaymentReceiptEmail,
  sendAssignmentNotificationEmail,
  sendCourseAnnouncementEmail,
  sendCourseReminderEmail,
  validateEmailTemplate,
  getAvailableTemplates,
  loadTemplate,
  compileTemplate
};