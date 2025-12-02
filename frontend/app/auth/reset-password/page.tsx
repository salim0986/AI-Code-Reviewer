"use client";

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from '../../../lib/api';
import { Loader2 } from 'lucide-react';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: password,
      });
      setMessage('Password reset successfully. Redirecting to login...');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md border-soft-blue/30 shadow-2xl shadow-soft-blue/10">
        <CardHeader className="text-center">
          <CardTitle className="font-heading text-3xl font-bold tracking-tight text-destructive">
            Invalid Link
          </CardTitle>
          <CardDescription className="text-base text-black/70">
            The password reset link is invalid or has expired.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link
            href="/auth/forgot-password"
            className="font-medium text-medium-blue hover:text-soft-blue hover:underline"
          >
            Request a new link
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md border-soft-blue/30 shadow-2xl shadow-soft-blue/10">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="font-heading text-3xl font-bold tracking-tight text-medium-blue">
          Set New Password
        </CardTitle>
        <CardDescription className="text-base text-black/70">
          Please enter your new password below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-soft-blue/50 focus-visible:ring-medium-blue"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border-soft-blue/50 focus-visible:ring-medium-blue"
            />
          </div>
          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {message && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
              {message}
            </div>
          )}
          <Button 
            type="submit" 
            className="w-full bg-medium-blue hover:bg-medium-blue/90 text-white" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12 sm:px-6 lg:px-8">
      <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin text-medium-blue" />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
