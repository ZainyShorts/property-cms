'use client' 
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFoundPage: React.FC = () => {
  const navigate = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger animations after component mounts
    setIsLoaded(true);
  }, []);

  const goHome = () => {
    navigate.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-gray-50 dark:bg-gray-900">
      <header className="w-full p-4 flex justify-end">
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className={`text-center max-w-3xl mx-auto ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="relative">
            <h1 className="text-9xl font-extrabold text-primary-600 dark:text-primary-400 animate-float">
              404
            </h1>
            <div className="absolute -top-14 -right-14">
              <div className="w-24 h-24 rounded-full bg-primary-100 dark:bg-primary-900 opacity-60 animate-pulse-slow"></div>
            </div>
            <div className="absolute -bottom-10 -left-10">
              <div className="w-16 h-16 rounded-full bg-secondary-100 dark:bg-secondary-900 opacity-60 animate-pulse-slow"></div>
            </div>
          </div>

          <h2 className={`mt-8 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl ${isLoaded ? 'animate-fade-in-up delay-100' : 'opacity-0'}`}>
            Page not found
          </h2>
          
          <p className={`mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto ${isLoaded ? 'animate-fade-in-up delay-200' : 'opacity-0'}`}>
            Oops! It seems like the page you're looking for has vanished into the digital abyss.
          </p>
          
          <div className={`mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 ${isLoaded ? 'animate-fade-in-up delay-300' : 'opacity-0'}`}>
            <Button onClick={goHome} variant="primary" size="lg" className="group">
              <Home className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
              Return Home
            </Button>
            <Button onClick={() => window.history.back()} variant="outline" size="lg" className="group">
              <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
              Go Back
            </Button>
          </div>
        </div>
      </main>

      <footer className="w-full p-4 text-center text-gray-600 dark:text-gray-400 text-sm">
        <p className={`${isLoaded ? 'animate-fade-in-up delay-400' : 'opacity-0'}`}>
          &copy; {new Date().getFullYear()} AFS. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default NotFoundPage;