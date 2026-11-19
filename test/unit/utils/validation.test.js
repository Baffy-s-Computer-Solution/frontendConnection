// frontend/src/test/unit/utils/validation.test.js
// ============================================================
// Unit Tests: Validation Utilities
// ============================================================
import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isValidPhone,
  isValidUrl,
  isNotEmpty,
  hasMinLength,
  hasMaxLength,
  isValidUsername,
  sanitizeInput,
  validateForm,
} from '../../src/utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'a@b.co',
      ];
      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true);
      });
    });

    it('should return false for invalid emails', () => {
      const invalidEmails = [
        '',
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
        null,
        undefined,
      ];
      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false);
      });
    });
  });

  describe('isValidPassword', () => {
    it('should validate password strength', () => {
      expect(isValidPassword('Password123!')).toBe(true);
      expect(isValidPassword('short')).toBe(false);
      expect(isValidPassword('nouppercase1!')).toBe(false);
      expect(isValidPassword('NOLOWERCASE1!')).toBe(false);
      expect(isValidPassword('NoNumber!')).toBe(false);
      expect(isValidPassword('NoSpecial1')).toBe(false);
    });

    it('should accept custom rules', () => {
      expect(isValidPassword('simple', { minLength: 4 })).toBe(true);
      expect(
        isValidPassword('simple', {
          minLength: 4,
          requireUppercase: false,
          requireLowercase: false,
          requireNumber: false,
          requireSpecial: false,
        })
      ).toBe(true);
    });
  });

  describe('isValidPhone', () => {
    it('should validate phone numbers', () => {
      expect(isValidPhone('+1234567890')).toBe(true);
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('123-456-7890')).toBe(true);
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  describe('isNotEmpty', () => {
    it('should check for empty values', () => {
      expect(isNotEmpty('hello')).toBe(true);
      expect(isNotEmpty('   ')).toBe(false);
      expect(isNotEmpty('')).toBe(false);
      expect(isNotEmpty(null)).toBe(false);
      expect(isNotEmpty(undefined)).toBe(false);
      expect(isNotEmpty([])).toBe(false);
      expect(isNotEmpty([1])).toBe(true);
    });
  });

  describe('hasMinLength', () => {
    it('should check minimum length', () => {
      expect(hasMinLength('hello', 3)).toBe(true);
      expect(hasMinLength('hi', 3)).toBe(false);
      expect(hasMinLength('', 1)).toBe(false);
    });
  });

  describe('hasMaxLength', () => {
    it('should check maximum length', () => {
      expect(hasMaxLength('hi', 5)).toBe(true);
      expect(hasMaxLength('hello world', 5)).toBe(false);
    });
  });

  describe('isValidUsername', () => {
    it('should validate usernames', () => {
      expect(isValidUsername('john_doe')).toBe(true);
      expect(isValidUsername('john123')).toBe(true);
      expect(isValidUsername('ab')).toBe(false);
      expect(isValidUsername('user name')).toBe(false);
      expect(isValidUsername('user@name')).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe(
        'scriptalert("xss")/script'
      );
      expect(sanitizeInput('Hello <b>World</b>')).toBe('Hello bWorld/b');
    });

    it('should trim whitespace', () => {
      expect(sanitizeInput('  hello  ')).toBe('hello');
    });

    it('should handle non-strings', () => {
      expect(sanitizeInput(123)).toBe(123);
      expect(sanitizeInput(null)).toBe(null);
    });
  });

  describe('validateForm', () => {
    it('should validate entire form', () => {
      const values = {
        email: 'test@example.com',
        password: 'Password123!',
        name: 'John Doe',
      };
      const rules = {
        email: [{ validator: isValidEmail, message: 'Invalid email' }],
        password: [
          { validator: (v) => isValidPassword(v), message: 'Weak password' },
        ],
        name: [
          {
            validator: (v) => isNotEmpty(v) && hasMinLength(v, 2),
            message: 'Name too short',
          },
        ],
      };
      const result = validateForm(values, rules);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    it('should return errors for invalid form', () => {
      const values = { email: 'invalid', password: 'weak' };
      const rules = {
        email: [{ validator: isValidEmail, message: 'Invalid email' }],
        password: [
          { validator: (v) => isValidPassword(v), message: 'Weak password' },
        ],
      };
      const result = validateForm(values, rules);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Invalid email');
      expect(result.errors.password).toBe('Weak password');
    });
  });
});