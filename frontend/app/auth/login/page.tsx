"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
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

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      const { accessToken, refreshToken, user } = response.data;
      login(accessToken, refreshToken, user);
    } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-soft-blue/30 shadow-2xl shadow-soft-blue/10">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="font-heading text-3xl font-bold tracking-tight text-medium-blue">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base text-black/70">
            Sign in to your account to continue
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-medium-blue hover:text-soft-blue hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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
              Sign in
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="font-medium text-medium-blue hover:text-soft-blue hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
