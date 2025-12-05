import { useState, type ChangeEvent, type FormEvent } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useAuth, MOCK_USER, USE_MOCK_AUTH } from '../contexts/AuthContext';
import axios from '../lib/axios';

export const Route = createFileRoute('/')({
  component: LoginPage,
});

interface LoginForm {
  email: string;
  password: string;
  remember: boolean;
}

type FieldErrors = Record<string, string[] | string | undefined>;

function LoginPage() {
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginForm>({
    email: '',
    password: '',
    remember: false,
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear the error for this field if present
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // MOCK MODE - Skip backend API calls
      if (USE_MOCK_AUTH) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Check credentials against mock user
        if (formData.email === MOCK_USER.email && formData.password === 'password') {
          login(MOCK_USER);
          navigate({ to: "/dashboard" });
          return;
        } else {
          setErrors({ general: 'Invalid credentials. Use admin@example.com / password' });
          setIsSubmitting(false);
          return;
        }
      }

      // REAL MODE - Connect to backend API
      // Ensure CSRF cookie/session initialized when backend requires it
      await axios.get('/csrf-cookie');

      const response = await axios.post('/login', formData);

      // Normalized success check: server may return success flag or HTTP 200 with user
      const data = response?.data;
      if (data?.success === true || data?.user) {
        // Update auth context with user data
        login(data.user);
        // Navigate to dashboard on successful login
        navigate({ to: '/dashboard' });
        return;
      }

      // If server returned a structured error message
      if (data?.message) {
        setErrors({ general: data.message });
        return;
      }

      // Fallback generic error
      setErrors({ general: 'Login failed. Please try again.' });
    } catch (err: any) {
      const status = err?.response?.status;
      const respData = err?.response?.data;

      if (status === 422 && respData?.errors) {
        // Validation errors expected in { errors: { field: [msg] } } shape
        setErrors(respData.errors);
      } else if (respData?.message) {
        setErrors({ general: respData.message });
      } else if (status === 401) {
        setErrors({ general: 'Invalid credentials. Please check your email and password.' });
      } else {
        setErrors({ general: 'An unexpected error occurred. Please try again later.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldError = (field: string) => {
    const err = errors[field];
    if (!err) return null;
    if (Array.isArray(err)) return err[0];
    return String(err);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">CRM Nubia Cars</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Sign in to access your dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {errors.general && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{renderFieldError('general')}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              {errors.email && <p className="mt-2 text-sm text-red-600">{renderFieldError('email')}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600">{renderFieldError('password')}</p>}
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={formData.remember}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          {/* Default Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-xs text-blue-800 font-medium">
              {USE_MOCK_AUTH ? 'Mock Mode - Test Credentials:' : 'Default Credentials:'}
            </p>
            <p className="text-xs text-blue-700 mt-1">Email: admin@example.com</p>
            <p className="text-xs text-blue-700">Password: password</p>
            {USE_MOCK_AUTH && (
              <p className="text-xs text-blue-600 mt-2 font-medium">
                ⚠️ Running in mock mode - no backend required
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
