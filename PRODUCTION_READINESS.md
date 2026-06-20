# Production Readiness Guide

## Overview
This guide ensures your LocalKart app meets all production requirements before Play Store deployment.

---

## Phase 1: Code Quality Assurance ✓

### TypeScript & Compilation
```bash
cd frontend
npm run typecheck
```
- ✓ No type errors
- ✓ All imports valid
- ✓ All exports used

### Linting
```bash
npm run lint
```
- ✓ No ESLint warnings
- ✓ No console.log in production code
- ✓ No unused variables

### Testing
```bash
npm run test
```
- ✓ All tests passing
- ✓ Good code coverage (> 60%)

---

## Phase 2: Environment Configuration ✓

### Create Production Environment Files
```bash
cp .env.production.example .env.production
cp .env.development.example .env.local
```

### Production Secrets
In GitHub Settings → Secrets, add:
```
VITE_SUPABASE_URL          = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY     = your-anon-key
KEYSTORE_PASSWORD          = your-keystore-password
KEYSTORE_ALIAS             = localkart-key
KEYSTORE_ALIAS_PASSWORD    = your-key-password
ANDROID_KEYSTORE_B64       = base64-encoded-keystore
PLAY_STORE_SERVICE_ACCOUNT = google-play-service-account.json
```

### Backend Secrets
- [ ] Supabase URL set to production
- [ ] Supabase service role key stored securely
- [ ] Firebase credentials configured (if using)
- [ ] WhatsApp Business API credentials configured

---

## Phase 3: Build Optimization ✓

### Frontend Build
```bash
cd frontend
npm run build
```

Check build output:
- [ ] Total size < 5MB (uncompressed)
- [ ] Main bundle < 500KB
- [ ] No source maps in production
- [ ] No debug code included

### Android Build
```bash
npm run build:android
```

Check output:
- [ ] AAB generated successfully
- [ ] Size < 100MB
- [ ] Signed with release keystore
- [ ] Version codes incremented

---

## Phase 4: Device Testing ✓

### Minimum Test Matrix
| Device | Android | Screen | Test |
|--------|---------|--------|------|
| Real   | 5.0     | 4.5"   | Physical |
| Real   | 8.0     | 5.5"   | Physical |
| Real   | 12.0    | 6.1"   | Physical |
| Emulator | 14.0  | 6.7"   | AVD |

### Critical Flows to Test
1. **Startup**: App opens without crash
2. **Location**: Permission request and handling
3. **Search**: Find shops, filter results
4. **Navigation**: All menu items accessible
5. **WhatsApp**: Order links work correctly
6. **Offline**: App gracefully handles no network
7. **Session**: Login persists after restart
8. **Permissions**: Only required permissions requested

### Performance Checks
- [ ] Startup time < 3 seconds
- [ ] Page loads < 2 seconds
- [ ] Search responds < 500ms
- [ ] Smooth scrolling (60fps)
- [ ] No visible memory leaks

---

## Phase 5: Security Review ✓

### Code Security
```bash
npm audit
npm run security-audit
```
- [ ] No high-severity vulnerabilities
- [ ] No hardcoded secrets
- [ ] No exposed API keys
- [ ] No unencrypted sensitive data

### Network Security
- [ ] All API calls use HTTPS
- [ ] Certificates valid
- [ ] No HTTP fallback
- [ ] API keys not in requests (use headers)

### Data Security
- [ ] User data encrypted in transit
- [ ] Auth tokens stored securely
- [ ] WhatsApp numbers not persisted
- [ ] User session cleared on logout
- [ ] Admin data protected by RLS

### Permission Security
- [ ] Location only used when visible
- [ ] Phone number only collected for orders
- [ ] Camera permissions justified (if used)
- [ ] Storage permissions minimal

---

## Phase 6: Analytics & Monitoring ✓

### Firebase Setup
```javascript
// In src/services/analytics.ts
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getPerformance } from 'firebase/performance'
import { getDatabase } from 'firebase/database'

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: 'localkart.firebaseapp.com',
  projectId: 'localkart',
  // ... rest of config
}

const app = initializeApp(config)
getAnalytics(app)
getPerformance(app)
```

### Critical Events to Track
- [ ] app_opened
- [ ] shop_viewed
- [ ] search_performed
- [ ] whatsapp_order_initiated
- [ ] crash_encountered
- [ ] api_error

### Monitoring Dashboards
- [ ] Crash-free users ratio
- [ ] Performance metrics (FCP, LCP, CLS)
- [ ] User engagement metrics
- [ ] Error rates by endpoint

---

## Phase 7: Play Store Configuration ✓

### App Metadata
- [ ] App name: "LocalKart"
- [ ] Package: com.localkart.app
- [ ] Version: 1.0.0
- [ ] Category: Shopping
- [ ] Content rating: 3+ (Everyone)

### Compliance
- [ ] Privacy Policy written (must include):
  - Location data usage
  - Phone number handling
  - WhatsApp integration
  - Analytics tools
  - Data retention periods
  - User rights (delete, export)

- [ ] Terms of Service written (must include):
  - Acceptable use policy
  - Liability disclaimers
  - Third-party attribution (Supabase, Capacitor)
  - Platform fees (if any)

### Store Listing
- [ ] App icon (512x512) uploaded
- [ ] Feature graphic (1024x500) created
- [ ] 2+ screenshots per device type
- [ ] Description compelling (80-4000 chars)
- [ ] Contact email provided

---

## Phase 8: Pre-Submission Checklist ✓

### Functional Testing
Run complete user flow:
```
Home → Search Kirana → View Shop → See Products → 
Order via WhatsApp → Success
```

- [ ] 0 crashes
- [ ] All buttons responsive
- [ ] Forms validate correctly
- [ ] Error messages clear
- [ ] Loading states show
- [ ] Empty states show

### Device Compatibility
- [ ] API 21 minimum (Android 5.0)
- [ ] All screen sizes supported
- [ ] Landscape mode (if enabled)
- [ ] Large text setting works
- [ ] High contrast mode works

### Performance Targets
- [ ] Startup: < 3 seconds
- [ ] First Paint: < 1.8 seconds
- [ ] Largest Paint: < 2.5 seconds
- [ ] Interaction Ready: < 5 seconds
- [ ] CLS: < 0.1 (no layout shifts)

### Security Checklist
- [ ] No API keys in code
- [ ] No console.log with secrets
- [ ] HTTPS only
- [ ] RLS policies verified
- [ ] Auth token refresh works
- [ ] Session timeout implemented

---

## Phase 9: Release Process ✓

### Versioning
```bash
# Update version in:
# - frontend/package.json: version field
# - frontend/capacitor.config.ts: version
# - android/app/build.gradle: versionCode (increment), versionName

git tag -a v1.0.0 -m "Release 1.0.0"
git push origin main --tags
```

### Build Release
```bash
cd frontend
npm run build:android
```

### Upload to Play Store
1. Go to Play Console
2. Create new app release
3. Upload AAB file
4. Fill in release notes
5. Submit to Internal Testing track

### Testing in Play Store
1. **Internal Testing** (7 days)
   - Team tests thoroughly
   - Verify all features
   - Check crash reports
   - Monitor performance

2. **Closed Beta** (7 days minimum)
   - 20-50 beta testers
   - Gather feedback
   - Fix critical issues
   - Monitor analytics

3. **Production Rollout** (Staged)
   - 10% of users (day 1)
   - 25% of users (day 2)
   - 50% of users (day 3)
   - 100% of users (day 4+)

---

## Phase 10: Post-Launch Monitoring ✓

### First 24 Hours
- [ ] Monitor crash reports hourly
- [ ] Check user ratings
- [ ] Review negative feedback
- [ ] Verify analytics working
- [ ] Test key features still work

### First Week
- [ ] Daily crash report review
- [ ] User retention tracking
- [ ] Performance monitoring
- [ ] Respond to user reviews
- [ ] Document issues found

### First Month
- [ ] Weekly analytics review
- [ ] Feature usage analysis
- [ ] Bug fix releases as needed
- [ ] User feedback prioritization
- [ ] Performance optimization

---

## Rollback Procedure

If critical issue found:

### Option 1: Pause Rollout (Recommended)
```
Play Console → Manage Release → Pause Rollout
(Stops new installs, existing users keep current version)
```

### Option 2: Cancel & Redeploy
```bash
# Fix issue
# Commit to main
git add .
git commit -m "Fix: critical issue"

# Increment version
# Build and deploy
npm run build:android
# Upload to Play Store as new release
```

---

## Monitoring Dashboard Setup

### Firebase Console
```
Project Settings → Service Accounts → Generate Keys
- Crash Reporting: Monitor > Crashes
- Performance: Monitor > Performance
- Analytics: Analytics > Dashboard
```

### Key Metrics to Watch
1. **Stability**
   - Crash-free users: Target > 99%
   - ANR (Application Not Responding): Target 0

2. **Performance**
   - Start time: Target < 2s
   - Warm start: Target < 1s
   - Frame drops: Target 0

3. **Engagement**
   - Session length: Target > 2 minutes
   - Daily active users: Trending up
   - User retention (Day 1, 7, 30)

4. **Business**
   - Order completion rate: Target > 80%
   - User ratings: Target > 4.0
   - Review sentiment: Positive

---

## Continuous Improvement

### Weekly
- [ ] Review crash reports
- [ ] Check user ratings
- [ ] Analyze usage patterns
- [ ] Plan next week's fixes

### Monthly
- [ ] Performance review
- [ ] Feature request analysis
- [ ] User feedback synthesis
- [ ] Plan next release

### Quarterly
- [ ] User retention analysis
- [ ] Competitive analysis
- [ ] Feature roadmap update
- [ ] Technical debt assessment

---

## Support & Communication

### User Support
- Support email: support@localkart.app
- Response time: < 24 hours
- Issue categorization: Bug / Feature / General

### Communication Channels
- GitHub Issues: Development tracking
- Play Store Reviews: User feedback
- Email: Customer support
- Analytics: Quantitative insights

---

## Sign-Off

Before production launch:

- [ ] Dev Lead: Code quality approved
- [ ] QA Lead: All tests passed
- [ ] Security: Security review cleared
- [ ] Product: Feature set complete
- [ ] Legal: Privacy/Terms approved

**Date Ready:** _______________
**Launched:** _______________
**Status:** ✓ PRODUCTION READY
