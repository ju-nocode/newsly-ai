# 🔒 Security Policy

## Reporting Security Issues

If you discover a security vulnerability in Newsly AI, please report it by emailing **ju.richard.33@gmail.com**.

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Security Measures Implemented

### Authentication & Authorization
- ✅ Supabase Auth with JWT tokens
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Session expiration handling
- ✅ Secure password hashing (bcrypt via Supabase)
- ✅ Role-based access control (user/admin)

### Data Protection
- ✅ Input validation on all API endpoints
- ✅ XSS protection with `escapeHtml()` function
- ✅ HTTPS-only in production (enforced by Vercel)
- ✅ Secure headers configured
- ✅ Environment variables for sensitive data

### API Security
- ✅ Server-side API key storage
- ✅ CORS configured properly
- ✅ Request size limits
- ✅ Token size validation (16KB limit)
- ✅ Rate limiting on client side

### File Upload Security
- ✅ Image compression (max 200KB → ~50KB)
- ✅ File type validation (images only)
- ✅ Size limits enforced
- ✅ Base64 encoding for secure storage

## Best Practices

### For Users
- Use strong passwords (min 8 characters)
- Keep your session secure
- Log out on shared devices
- Report suspicious activity

### For Developers
- Never commit API keys or secrets
- Always use environment variables
- Validate all user inputs
- Sanitize data before display
- Keep dependencies updated

## Updates

This security policy is reviewed and updated regularly. Last update: 2025-01-11
