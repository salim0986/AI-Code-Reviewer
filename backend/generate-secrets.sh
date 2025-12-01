#!/bin/bash

# Script to generate secure secrets for .env file

echo "🔐 Generating secure secrets for Sentinel AI Backend"
echo ""

echo "Add these to your .env file:"
echo "================================"
echo ""

echo "# JWT Secrets"
echo "JWT_ACCESS_SECRET=$(openssl rand -base64 32)"
echo "JWT_REFRESH_SECRET=$(openssl rand -base64 32)"
echo ""

echo "# CSRF & Cookie Secrets"
echo "CSRF_SECRET=$(openssl rand -base64 32)"
echo "COOKIE_SECRET=$(openssl rand -base64 32)"
echo ""

echo "================================"
echo "✅ Secrets generated successfully!"
echo ""
echo "Remember to:"
echo "1. Copy these values to your .env file"
echo "2. Never commit .env to version control"
echo "3. Use different secrets for production"
