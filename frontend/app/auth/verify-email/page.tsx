"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from '../../../lib/api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      // Avoid calling setStatus directly in render, use effect
      const timer = setTimeout(() => {
        setStatus('error');
        setMessage('Invalid or missing verification token.');
      }, 0);
      return () => clearTimeout(timer);
    }

    const verifyEmail = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
        setMessage('Your email has been successfully verified!');
      } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        setStatus('error');
        setMessage(err.response?.data?.message || 'Failed to verify email. The token may be invalid or expired.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <Card className="w-full max-w-md border-soft-blue/30 shadow-2xl shadow-soft-blue/10">
      <CardHeader className="text-center">
        <CardTitle className="font-heading text-3xl font-bold tracking-tight text-medium-blue">
          Email Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-4 py-6">
        {status === 'loading' && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-medium-blue" />
            <p className="text-base text-black/70">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500" />
            <p className="text-center text-base text-black/70">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 text-destructive" />
            <p className="text-center text-base text-destructive">{message}</p>
          </>
        )}
      </CardContent>
      <CardFooter className="justify-center">
        {status !== 'loading' && (
          <Button asChild className="bg-medium-blue hover:bg-medium-blue/90 text-white">
            <Link href="/auth/login">
              Continue to Login
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-medium-blue" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
