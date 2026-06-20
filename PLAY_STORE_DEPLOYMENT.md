# Google Play Store Deployment Guide

## Prerequisites

### 1. Google Play Developer Account
- Go to [Google Play Console](https://play.google.com/console)
- Create developer account ($25 one-time fee)
- Complete business profile

### 2. Android Keystore Setup

Generate a signing key:
```bash
cd frontend/android
keytool -genkey -v -keystore release.keystore -keyalg RSA -keysize 2048 -validity 10000 \
  -alias localkart-key \
  -keypass YOUR_ALIAS_PASSWORD \
  -storepass YOUR_KEYSTORE_PASSWORD
```

Store these securely in GitHub Secrets:
- `KEYSTORE_PASSWORD` - Your keystore password
- `KEYSTORE_ALIAS` - `localkart-key`
- `KEYSTORE_ALIAS_PASSWORD` - Your key password
- `ANDROID_KEYSTORE_B64` - Base64 encoded keystore:
  ```bash
  base64 -i release.keystore | tr -d '\n' | pbcopy
  ```

### 3. Play Store Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Play API
4. Create Service Account for Play Store
5. Create and download JSON key
6. Add to GitHub Secret: `PLAY_STORE_SERVICE_ACCOUNT`

---

## Release Process

### Step 1: Prepare Release

Update version numbers:
```bash
# Update frontend/package.json
# Update frontend/capacitor.config.ts
# Update android/app/build.gradle

git add .
git commit -m "chore: bump version to 1.0.0"
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin main --tags
```

### Step 2: Build & Test

```bash
cd frontend
npm ci
npm run build
npx cap sync android
```

### Step 3: Test on Device

1. Connect Android device in developer mode
2. Build APK for testing:
   ```bash
   cd frontend/android
   ./gradlew installRelease
   ```
3. Test all critical flows:
   - ✓ App launches without crashes
   - ✓ Location permission flow works
   - ✓ Shop search/filtering functions
   - ✓ WhatsApp ordering works
   - ✓ Admin login properly restricted
   - ✓ Offline fallback displays
   - ✓ Images load correctly
   - ✓ Navigation works properly

### Step 4: Deploy to Play Store

Option A: Manual via GitHub (Recommended)
1. Go to Actions tab in GitHub
2. Run "Build Android App" workflow
3. Enter track: `internal` (first time)
4. Enter version: `1.0.0`
5. Workflow builds and uploads to Play Store

Option B: Manual Build
```bash
cd frontend/android
./gradlew bundleRelease \
  -Pandroid.injected.signing.store.file=../release.keystore \
  -Pandroid.injected.signing.store.password=$KEYSTORE_PASSWORD \
  -Pandroid.injected.signing.key.alias=localkart-key \
  -Pandroid.injected.signing.key.password=$KEYSTORE_ALIAS_PASSWORD
```

Then upload AAB to Play Store Console.

### Step 5: Play Store Setup

In [Google Play Console](https://play.google.com/console):

1. **Store Listing**
   - Upload screenshots (min 2, max 8 per device type)
   - Upload feature graphic (1024x500px)
   - Write compelling description
   - Add content rating

2. **Ratings & Reviews**
   - Review policy pages
   - Add privacy policy URL
   - Add terms of service URL

3. **Content Rating**
   - Complete questionnaire
   - Target audience: 3+ (add mature content if needed)

4. **Data Safety**
   - Location data: Collected (for nearby searches)
   - Phone number: Collected (for WhatsApp orders)
   - Analytics: Google Analytics only
   - No sensitive personal data

5. **Release Management**
   - **Internal Testing**: Team QA (7 days)
   - **Beta**: Public beta users (minimum 7 days before production)
   - **Production**: Staged rollout (10% → 25% → 50% → 100%)

---

## Release Tracks Strategy

### Internal Testing Track (Week 1)
- Deploy to internal team
- Test on 5+ device models
- Verify all core flows
- Monitor crash reports
- Test on slow 3G network
- Validate Play Store requirements

### Beta Track (Week 2)
- Expand to beta testers (20-50 users)
- Gather feedback via in-app survey
- Monitor rating & reviews
- Check crash rates
- Verify analytics are working

### Production Track (Week 3+)
- **Staged rollout strategy:**
  1. Day 1: 10% of users
  2. Day 2: 25% of users (if no critical issues)
  3. Day 3: 50% of users
  4. Day 4+: 100% of users

- **Monitor metrics:**
  - Crash-free users > 99%
  - Session length > 2 minutes
  - Order completion rate > 80%
  - Rating > 4.0 stars

---

## Monitoring Post-Launch

### Key Metrics Dashboard
Track in Firebase Console:
- Daily active users (DAU)
- Monthly active users (MAU)
- Session length
- Crash-free users
- Feature completion (orders created)
- User retention (Day 1, Day 7, Day 30)

### Critical Alerts
Set up monitoring for:
- Crash rate > 1%
- Order failure rate > 5%
- API response time > 2s
- WhatsApp link failures

### Feedback Channels
- In-app ratings (prompt after successful order)
- Google Play reviews (monitor daily)
- Customer support email
- Analytics anomalies

---

## Rollback Procedure

If critical issue detected:

### Option 1: Pause Rollout (Recommended)
1. Go to Release Management in Play Console
2. Click "Pause rollout"
3. Users keep current version, no new installs get buggy version
4. Fix and redeploy

### Option 2: Cancel Release
1. Create patch release with fix
2. Update version number
3. Test thoroughly
4. Deploy as new release

### Option 3: Full Rollback
```bash
# Revert to previous tag
git checkout v1.0.0
npm run build
# Deploy fix release v1.0.1
```

---

## Version Numbering

Follow semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (login system change, major UI redesign)
- **MINOR**: New features (new shop type, new payment method)
- **PATCH**: Bug fixes (search optimization, crash fix)

Examples:
- v0.1.0 → v0.2.0 (add Food section)
- v0.2.0 → v1.0.0 (production ready)
- v1.0.0 → v1.0.1 (crash fix)
- v1.0.1 → v1.1.0 (add cart feature)

---

## Security Checklist

Before each release:
- [ ] No hardcoded API keys in code
- [ ] Firebase config is production config
- [ ] Supabase URL and key are production (not dev)
- [ ] WhatsApp business account is production
- [ ] Analytics tracking is enabled
- [ ] Crash reporting is enabled
- [ ] All dependencies updated
- [ ] Security audit passed
- [ ] Privacy policy reviewed by legal
- [ ] Terms of service reviewed by legal

---

## Post-Launch Support

### First Week
- Daily monitor of crash reports
- Response to negative reviews (thank 5-star, address complaints)
- Bug fix releases if needed

### First Month
- Weekly feature requests analysis
- Performance optimization based on analytics
- User feedback implementation prioritization
- Engagement improvement campaigns

### Ongoing
- Monthly feature releases
- Security updates as needed
- Performance monitoring
- User retention improvement
- Rating & review management

---

## Useful Links

- [Google Play Console](https://play.google.com/console)
- [Android Developers Guide](https://developer.android.com/)
- [Capacitor Documentation](https://capacitorjs.com/)
- [Play Store Policies](https://play.google.com/about/developer-content-policy/)
- [Android App Bundle Docs](https://developer.android.com/guide/app-bundle)
