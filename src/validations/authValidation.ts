import { z } from 'zod';

export const SignupValidation = z.object({
  body: z.object({
    username: z
      .string({ message: 'Username is required' })
      .trim()
      .min(3, 'Username must be at least 3 characters long')
      .max(30, 'Username cannot exceed 30 characters'),
    email: z
      .string({ message: 'Email is required' })
      .trim()
      .email('Please provide a valid email address'),
    password: z
      .string({ message: 'Password is required' })
      .min(8, 'Password must be at least 8 characters long'),
  }),
});

export const LoginValidation = z.object({
  body: z.object({
    email: z
      .string({ message: 'Email is required' })
      .trim()
      .email('Please provide a valid email address'),
    password: z
      .string({ message: 'Password is required' }),
  }),
});
