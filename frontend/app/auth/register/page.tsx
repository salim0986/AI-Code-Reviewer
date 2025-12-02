"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await api.post('/auth/register', {
        email,
        password,
      });

      setIsSuccess(true);
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.response?.data?.message || 'Failed to register');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-soft-blue/30 shadow-2xl shadow-soft-blue/10">
          <CardHeader className="text-center">
            <CardTitle className="font-heading text-3xl font-bold tracking-tight text-medium-blue">
              Registration Successful!
            </CardTitle>
            <CardDescription className="text-base text-black/70">
              We've sent a verification email to <strong>{email}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Please check your inbox and click the link to verify your account. You won't be able to login until you verify your email.
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button asChild className="w-full bg-medium-blue hover:bg-medium-blue/90 text-white">
              <Link href="/auth/login">
                Go to Login
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-soft-blue/30 shadow-2xl shadow-soft-blue/10">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-heading text-3xl font-bold tracking-tight text-medium-blue">
            Create an Account
          </CardTitle>
          <CardDescription className="text-base text-black/70">
            Join us to start reviewing code with AI
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
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
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
              <Label htmlFor="confirmPassword">Confirm Password</Label>
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
            <Button 
              type="submit" 
              className="w-full bg-medium-blue hover:bg-medium-blue/90 text-white" 
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-medium-blue hover:text-soft-blue hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
