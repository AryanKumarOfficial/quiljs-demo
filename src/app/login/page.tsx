'use client';

import { FormEvent, useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Check for redirects from registration page or other sources
  useEffect(() => {
    const registered = searchParams.get('registered');
    if (registered === 'true') {
      toast.success('Registration successful! Please log in with your new account.');
    }
    
    const unauthorized = searchParams.get('unauthorized');
    if (unauthorized === 'true') {
      toast.error('Please log in to access this page');
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setLoading(true);
      
      const loadingToast = toast.loading('Signing you in...');
      
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });
      
      toast.dismiss(loadingToast);
      
      if (result?.error) {
        toast.error('Invalid email or password');
        return;
      }
      
      toast.success('Login successful!');
      
      // Redirect to home page after successful login
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Login error:', err);
      toast.error('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // Keeping the function for future use but not exposing it in UI
  const handleOAuthSignIn = async (provider: string) => {
    try {
      setLoading(true);
      const loadingToast = toast.loading(`Signing in with ${provider}...`);
      await signIn(provider, { callbackUrl: '/' });
      toast.dismiss(loadingToast);
    } catch (err) {
      console.error(`${provider} login error:`, err);
      toast.error(`An error occurred during ${provider} login`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="max-w-md w-full space-y-8 p-6 bg-white rounded-lg shadow-md">
        <div>
          <h1 className="text-center text-3xl font-bold text-gray-900">Login</h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to access your responses
          </p>
        </div>
        
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email address"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
            >
              {loading ? 'Logging in...' : 'Sign in with Email'}
            </button>
          </div>
        </form>
        
        <div className="text-sm text-center mt-4">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}