# Security Policy — LEAGUE

## Overview

LEAGUE is a football auction management application built with
Expo, React Native, TypeScript, and Supabase.

This project is an educational MVP. Its current authentication
and backend authorization mechanisms have known limitations.

This document describes those limitations and recommends
security improvements for developers adapting the project.

## Supported Versions

Security observations currently apply to the recovered MVP
source code and its associated deployment.

Other versions and forks may behave differently.

## Known Security Limitations

### 1. Client-Side Administrator Authentication

The administrator authentication mechanism currently relies
on a password embedded in client-side application code.

Client-side code is accessible to users and must not be
treated as a secure place to store authentication secrets.

**Recommended remediation:**
- Replace the hardcoded password with server-verified authentication.
- Use authenticated administrator accounts.
- Enforce administrative permissions on the backend.
- Avoid relying exclusively on client-side checks.

### 2. Manager PIN Management

Managers use individual PINs, and administrators can reset them.

Client-side PIN checks and reset controls do not independently
provide secure authorization.

**Recommended remediation:**
- Verify manager identity on the backend.
- Restrict PIN-reset operations to authenticated administrators.
- Protect credentials against unauthorized access.
- Apply appropriate rate limits to authentication attempts.

### 3. Shared Auction State Authorization

The current MVP configuration permits anonymous clients to
read and write shared auction state through Supabase.

This can allow unauthorized clients to modify auction data.

**Recommended remediation:**
- Review Supabase Row Level Security (RLS) policies.
- Require appropriate authentication for sensitive operations.
- Restrict writes according to authenticated user roles.
- Validate auction transitions and sensitive changes on the backend.
- Do not rely on the visibility of UI controls to enforce permissions.

### 4. Player Image Storage

Player images are stored using Supabase Storage.

Review bucket visibility and upload policies to ensure that
permissions match the intended application behavior.

Public image access may be appropriate for player cards, but
upload and modification permissions should be restricted.

### 5. Environment Variables and Credentials

The application uses Expo environment variables for its
Supabase configuration.

Variables prefixed with `EXPO_PUBLIC_` are included in the
client-side application and must not contain privileged secrets.

Never commit:
- Supabase service-role keys
- Database passwords
- Private API credentials
- Production authentication secrets
- Other sensitive environment variables

The `.env` file should remain excluded from Git.

The `.env.example` file should contain placeholders only.

## Responsible Security Testing

Testing should be performed only on systems you own or have
explicit permission to assess.

For local testing:
- Use a development Supabase project.
- Use test teams, players, and auction records.
- Verify that unauthorized users cannot perform restricted operations.
- Confirm that authentication and authorization are enforced
  by the backend rather than merely by the interface.

Do not use real auction data when testing security weaknesses.

## Reporting a Vulnerability

If you discover a security issue in this project:

1. Record the affected component and version.
2. Describe the security impact.
3. Provide minimal reproduction steps using test data.
4. Suggest a practical remediation.
5. Avoid publishing real credentials or sensitive user information.

Please report security issues privately to the project maintainer
before publicly disclosing exploitable details.

## Production Readiness

Before using LEAGUE for a public or high-stakes auction,
implement and test server-side authentication, authorization,
database access controls, input validation, and secure credential
management.

Documented limitations should not be interpreted as resolved
vulnerabilities.
