"use client";

import React, { useState } from 'react';
import Link from 'next/link';
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
import { Loader2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      await api.post('/auth/forgot-password', {
        email,
      });
      setMessage('If an account exists with this email, you will receive a password reset link shortly.');
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-soft-blue/30 shadow-2xl shadow-soft-blue/10">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-heading text-3xl font-bold tracking-tight text-medium-blue">
            Reset Password
          </CardTitle>
          <CardDescription className="text-base text-black/70">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              Send Reset Link
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href="/auth/login"
            className="flex items-center text-sm font-medium text-medium-blue hover:text-soft-blue hover:underline"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
