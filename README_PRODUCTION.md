# LocalKart - Production Ready Guide

## 🚀 Quick Start for Production Deployment

This document guides you through deploying LocalKart to Google Play Store.

---

## 📋 Prerequisites

- [ ] Android development environment setup
- [ ] Google Play Developer Account ($25 one-time fee)
- [ ] Keystore for signing Android apps
- [ ] GitHub repository with secrets configured
- [ ] Supabase production project
- [ ] WhatsApp Business Account

---

## 🔧 Setup Steps

### 1. Environment Configuration

**Create production environment files:**
```bash
cp .env.production.example .env.production
cp .env.development.example .env.local
```

**Update values in `.env.production`:**
- Supabase production URL
- Supabase anon key (production)
- App domain (https://localkart.app)

### 2. Android Keystore Setup

**Generate release keystore:**
```bash
cd frontend/android
keytool -genkey -v -keystore release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias localkart-key
```

**Important:** Save the passwords securely!

**Encode keystore for GitHub:**
```bash
base64 -i release.keystore | tr -d '\n' | pbcopy
```

### 3. GitHub Secrets Configuration

Add these secrets to your GitHub repository (Settings → Secrets):

```
KEYSTORE_PASSWORD             = [your-keystore-password]
KEYSTORE_ALIAS                = localkart-key
KEYSTORE_ALIAS_PASSWORD       = [your-alias-password]
ANDROID_KEYSTORE_B64          = [base64-encoded-keystore]
PLAY_STORE_SERVICE_ACCOUNT    = [service-account.json]
```

### 4. Build & Deploy

**Option A: GitHub Actions (Recommended)**
1. Push to main branch
2. Go to GitHub Actions
3. Run "Build Android App" workflow
4. Enter track: `internal`
5. Enter version: `1.0.0`

**Option B: Manual Build**
```bash
cd frontend
npm install
npm run build:android
```

---

## 📱 Play Store Submission

### Before Submission
- [ ] Complete `PLAY_STORE_CHECKLIST.md`
- [ ] All tests passing
- [ ] No crashes in testing
- [ ] Screenshots prepared (2-8 per device)
- [ ] Feature graphic created (1024x500)
- [ ] Privacy policy published
- [ ] Content rating completed

### Submission Process
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app: "LocalKart"
3. Fill in store listing
4. Upload APK/AAB from GitHub Actions
5. Submit for review (1-7 days approval time)

---

## 📊 Key Files for Production

### Configuration
- `frontend/capacitor.config.ts` - Capacitor config
- `frontend/vite.config.ts` - Build optimization
- `.env.production` - Production secrets
- `.github/workflows/` - CI/CD pipelines

### Documentation
- `PRODUCTION_READINESS.md` - Full checklist
- `PLAY_STORE_DEPLOYMENT.md` - Detailed deployment guide
- `PLAY_STORE_CHECKLIST.md` - Pre-launch verification

### Build Scripts
- `frontend/scripts/build-android.sh` - Android build script
- `frontend/package.json` - Build commands

---

## 🔍 Testing Checklist

Before any release:

**Functionality** (Manual Testing)
- [ ] App launches without crashes
- [ ] All nav items work
- [ ] Search functionality works
- [ ] WhatsApp ordering works
- [ ] Admin features restricted
- [ ] Location permission works

**Performance**
- [ ] App starts < 3 seconds
- [ ] Pages load < 2 seconds
- [ ] Search results < 500ms
- [ ] No memory leaks

**Device Compatibility**
- [ ] Android 5.0 (API 21) minimum
- [ ] Android 14 (API 34) latest
- [ ] Small phone (4.5")
- [ ] Large phone (6.1"+)
- [ ] Tablet (if supported)

**Network**
- [ ] Works on WiFi
- [ ] Works on 4G
- [ ] Graceful degradation on slow network (3G)
- [ ] Offline fallback

---

## 📈 Post-Launch Monitoring

### Daily (First Week)
- Monitor crash reports
- Check user ratings
- Review negative feedback
- Verify key metrics

### Weekly
- Analyze user retention
- Review feature usage
- Plan next update

### Monthly
- Performance review
- Feature prioritization
- Competitive analysis

---

## 🔄 Update Process

**For bug fixes (patch releases):**
```bash
# 1. Fix the issue
# 2. Update version in frontend/package.json: 1.0.0 → 1.0.1
# 3. Commit and tag
git commit -am "fix: issue description"
git tag -a v1.0.1 -m "Fix: issue description"
git push origin main --tags

# 4. Build and deploy via GitHub Actions
# 5. Monitor crash reports
```

**For new features (minor releases):**
```bash
# 1. Implement feature
# 2. Update version: 1.0.0 → 1.1.0
# 3. Test thoroughly
# 4. Commit and deploy
```

---

## 🚨 Emergency Procedures

### Critical Bug Fix
```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-issue

# 2. Fix the issue
# 3. Update version to v1.0.1
# 4. Commit
git commit -am "hotfix: critical issue"

# 5. Push and merge to main
git push origin hotfix/critical-issue
# Create PR, merge immediately

# 6. Build and deploy
npm run build:android

# 7. Monitor closely
```

### Rollback Procedure
If deployed version has critical issues:

**Option 1: Pause Rollout (Recommended)**
```
Google Play Console → Manage Release → Pause Rollout
```

**Option 2: Rollback & Revert**
```bash
# Revert to previous stable tag
git checkout v1.0.0
npm run build:android
# Deploy as new release
```

---

## 📞 Support & Issues

### User Support
- Email: support@localkart.app
- Response time: < 24 hours

### Development Issues
- GitHub Issues: Development tracking
- GitHub Discussions: Architecture questions

### Security Issues
- Email: security@localkart.app
- Do not open public issues for security bugs

---

## 📚 Useful Links

- [Google Play Console](https://play.google.com/console)
- [Android Developers](https://developer.android.com/)
- [Capacitor Docs](https://capacitorjs.com/)
- [Supabase Docs](https://supabase.com/docs)
- [React Router](https://reactrouter.com/)

---

## 🎯 Production Metrics to Track

### User Engagement
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Session length (target: > 2 min)
- User retention (Day 1, 7, 30)

### Business Metrics
- Order completion rate (target: > 80%)
- WhatsApp order success rate
- Average order value
- User satisfaction rating

### Technical Metrics
- Crash-free users (target: > 99%)
- App startup time (target: < 3s)
- Page load time (target: < 2s)
- API response time (target: < 500ms)

---

## ✅ Production Sign-Off Checklist

Before marking app as "production ready":

- [ ] All code reviewed and merged
- [ ] All tests passing
- [ ] No high-severity security issues
- [ ] Performance targets met
- [ ] Analytics configured
- [ ] Monitoring alerts set up
- [ ] Rollback procedure documented
- [ ] Support team briefed
- [ ] Privacy policy reviewed by legal
- [ ] Terms of service reviewed by legal

**Signed off by:**
- Dev Lead: _________________ Date: _______
- QA Lead: _________________ Date: _______
- Product Manager: __________ Date: _______
- Legal: ___________________ Date: _______

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-XX | Initial release |
| 1.0.1 | | Bug fixes |
| 1.1.0 | | Cart feature |

---

**Last Updated:** 2024-01-20  
**Status:** ✅ PRODUCTION READY
