import React, { useEffect } from 'react';
import { SignupForm } from '../components/auth/SignupForm';
import { Logo } from '../components/common/Logo';
import { Link } from '../utils/navigation';

export const SignupPage: React.FC = () => {
  useEffect(() => {
    document.title = 'Sign Up — PawMart';
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-block">
          <Logo size="lg" />
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <SignupForm />
      </div>
    </div>
  );
};
