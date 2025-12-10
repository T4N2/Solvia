import nodemailer from 'nodemailer';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  serviceInterest?: string;
}

export interface ContactResponse {
  success: boolean;
  message: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// Rate limiting store (in-memory for simplicity)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 3;

// Email configuration
const createTransporter = () => {
  // For development, use ethereal email (fake SMTP service)
  // In production, replace with actual SMTP credentials
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // Development mode: log to console instead of sending
  return nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });
};

export function validateContactForm(data: any): { valid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Validate name
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }

  // Validate email
  if (!data.email || typeof data.email !== 'string' || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email.trim())) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }
  }

  // Validate message
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length === 0) {
    errors.push({ field: 'message', message: 'Message is required' });
  } else if (data.message.trim().length < 10) {
    errors.push({ field: 'message', message: 'Message must be at least 10 characters' });
  }

  // Phone is optional, but if provided, should be a string
  if (data.phone && typeof data.phone !== 'string') {
    errors.push({ field: 'phone', message: 'Invalid phone format' });
  }

  // Service interest is optional
  if (data.serviceInterest && typeof data.serviceInterest !== 'string') {
    errors.push({ field: 'serviceInterest', message: 'Invalid service interest format' });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  // Increment count
  record.count++;
  return { allowed: true };
}

export async function sendContactEmail(data: ContactFormData): Promise<void> {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@solvianove.com',
    to: process.env.CONTACT_EMAIL || '210102001@mhs.udb.ac.id',
    subject: `New Contact Form Submission from ${data.name}`,
    text: `
Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone || 'Not provided'}
Service Interest: ${data.serviceInterest || 'Not specified'}

Message:
${data.message}
    `,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
      <p><strong>Service Interest:</strong> ${data.serviceInterest || 'Not specified'}</p>
      <h3>Message:</h3>
      <p>${data.message.replace(/\n/g, '<br>')}</p>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  
  // In development mode, log the email
  if (!process.env.SMTP_HOST) {
    console.log('📧 Email would be sent:');
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    console.log('Content:', mailOptions.text);
  } else {
    console.log('Email sent:', info.messageId);
  }
}

export async function handleContactSubmission(
  data: any,
  ip: string
): Promise<ContactResponse> {
  // Check rate limit
  const rateLimitCheck = checkRateLimit(ip);
  if (!rateLimitCheck.allowed) {
    throw new Error(`Rate limit exceeded. Please try again in ${rateLimitCheck.retryAfter} seconds.`);
  }

  // Validate form data
  const validation = validateContactForm(data);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
  }

  // Sanitize data
  const sanitizedData: ContactFormData = {
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    phone: data.phone?.trim() || undefined,
    message: data.message.trim(),
    serviceInterest: data.serviceInterest?.trim() || undefined,
  };

  // Send email
  await sendContactEmail(sanitizedData);

  return {
    success: true,
    message: 'Your message has been sent successfully. We will get back to you soon!',
  };
}
