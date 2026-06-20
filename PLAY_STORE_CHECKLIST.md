# Google Play Store Pre-Launch Checklist

## Code Quality & Stability

### Build & Compilation
- [ ] No TypeScript compilation errors
- [ ] No ESLint warnings
- [ ] All imports resolved correctly
- [ ] No unused imports or variables
- [ ] All console.log/debug statements removed (except errors)
- [ ] Feature flags disabled for development features

### App Functionality (Manual Testing - 5+ minutes)
- [ ] App launches without crashes
- [ ] App doesn't crash when backgrounded
- [ ] App doesn't crash when resumed from background
- [ ] All navigation paths work
- [ ] Back button works on all pages
- [ ] Loading states display correctly
- [ ] Error states display with retry options
- [ ] Empty states display when no data

### Core Features
- [ ] **Home Page**
  - [ ] Loads without errors
  - [ ] All category tiles clickable
  - [ ] Recent shops/services display
  - [ ] Ads load (if enabled)

- [ ] **Kirana Section**
  - [ ] Shop list loads and displays
  - [ ] Search filters results correctly
  - [ ] Distance filter works (3km, 5km, 15km)
  - [ ] Delivery filter works
  - [ ] Loading skeleton displays
  - [ ] Empty state displays when no results
  - [ ] Shop cards are clickable
  - [ ] Shop detail page loads
  - [ ] WhatsApp button opens WhatsApp

- [ ] **Food Section**
  - [ ] Shop list loads
  - [ ] Search functionality works
  - [ ] Shop detail loads food items
  - [ ] Item cards display correctly
  - [ ] WhatsApp ordering works

- [ ] **Tiffin Services Section**
  - [ ] Provider list loads
  - [ ] Meal plans display
  - [ ] Provider detail loads correctly
  - [ ] WhatsApp integration works

- [ ] **Authentication**
  - [ ] Login page loads
  - [ ] Email login works
  - [ ] OAuth (Google, GitHub) works
  - [ ] Logout works
  - [ ] Session persists after app restart
  - [ ] Invalid credentials show error

- [ ] **Admin Features** (if user is admin)
  - [ ] Admin dashboard loads
  - [ ] Only admins can access admin panel
  - [ ] Non-admin redirect works
  - [ ] Business approvals work
  - [ ] Lead management works
  - [ ] Analytics display correctly

- [ ] **Profile Page**
  - [ ] User info displays correctly
  - [ ] User can edit profile
  - [ ] Logout works
  - [ ] Order history displays (if applicable)

### Network & Permissions
- [ ] App requests location permission on first use
- [ ] Location permission flow clear and works
- [ ] App works when location is denied (shows fallback)
- [ ] HTTPS only - no HTTP calls
- [ ] All API endpoints respond correctly
- [ ] Network timeout handling works (>5 seconds shows error)
- [ ] Offline fallback displays appropriately
- [ ] WhatsApp deep link works with format:
  ```
  https://wa.me/919XXXXXXXXX?text=Order%20for%20<business_name>
  ```

### Images & Media
- [ ] All images load correctly
- [ ] No broken image links
- [ ] Images scale properly on different screen sizes
- [ ] Placeholder images show during loading
- [ ] App icon displays correctly (192x192, 512x512)
- [ ] Splash screen displays correctly
- [ ] Feature graphics render properly

### Performance
- [ ] App starts in < 3 seconds
- [ ] Pages load in < 2 seconds
- [ ] Images load progressively
- [ ] Search results appear in < 500ms
- [ ] No visible lag during scrolling
- [ ] Animations are smooth (60 fps)
- [ ] No memory leaks (verified with DevTools)
- [ ] Battery usage is reasonable
- [ ] No excessive network requests

### Security & Privacy
- [ ] No hardcoded API keys in code
- [ ] No hardcoded user credentials
- [ ] No sensitive data in localStorage (except auth tokens)
- [ ] Auth tokens stored securely
- [ ] WhatsApp numbers not stored permanently
- [ ] User data encrypted in transit (HTTPS)
- [ ] No personal data in logs
- [ ] Permissions only requested when needed

### Data Handling
- [ ] User data cleared on logout
- [ ] Old sessions invalidated after timeout
- [ ] Database queries use parameterized statements
- [ ] RLS policies prevent unauthorized data access
- [ ] Admin data hidden from regular users
- [ ] Personal shop data hidden from competitors

---

## Play Store Listing

### Metadata
- [ ] App name: "LocalKart" (or similar)
- [ ] Short description (80 chars max) written
- [ ] Full description (4000 chars max) written
- [ ] Category selected: "Shopping"
- [ ] Content rating completed
- [ ] Target audience appropriate

### Screenshots & Graphics
- [ ] At least 2 screenshots per device type:
  - [ ] Phone (1080x1920 minimum)
  - [ ] Tablet (1280x1920 minimum) - if supported
- [ ] All screenshots show actual app UI (no mockups)
- [ ] Screenshots are in English (primary language)
- [ ] Feature graphic (1024x500px) created
- [ ] App icon (512x512px) uploaded
- [ ] App icon is clear and recognizable at 48x48px

### Promotional Assets
- [ ] App preview video (30-45 seconds) created - Optional but recommended
- [ ] Video shows key features
- [ ] Video includes:
  - [ ] Nearby shop discovery
  - [ ] Search functionality
  - [ ] WhatsApp ordering
  - [ ] Smooth transitions

### Policies
- [ ] Privacy Policy written and hosted
- [ ] Privacy Policy covers:
  - [ ] Location data collection
  - [ ] Phone number collection
  - [ ] WhatsApp integration
  - [ ] Analytics (if enabled)
  - [ ] No third-party sharing
  - [ ] User rights (deletion, export)
- [ ] Terms of Service written
- [ ] Contact email added (support@localkart.app)
- [ ] Data Safety section completed:
  - [ ] Data types collected listed
  - [ ] Data retention policy clear
  - [ ] No sensitive data stored

---

## Device Compatibility

### Minimum Requirements
- [ ] Min API Level: 21 (Android 5.0)
- [ ] Target API Level: 34 (Android 14) - Current
- [ ] App tested on:
  - [ ] Phone (4.5")
  - [ ] Phone (5.5")
  - [ ] Tablet (7")
  - [ ] Tablet (10") - if supported
  - [ ] Low-end device (Moto G or similar)
  - [ ] High-end device (Pixel or similar)

### Screen Sizes
- [ ] Tested on: 360x640 (small phone)
- [ ] Tested on: 412x915 (regular phone)
- [ ] Tested on: 600x800 (tablet)
- [ ] Layouts responsive and readable on all sizes
- [ ] Touch targets are >= 48dp
- [ ] No horizontal scrolling on portrait mode

### Network Conditions
- [ ] Tested on WiFi
- [ ] Tested on 4G LTE
- [ ] Tested on slow 3G (throttle to 0.5 Mbps)
- [ ] App works without crashes on slow network
- [ ] Loading states display on slow network
- [ ] Timeout handling works properly

---

## Analytics & Monitoring

### Firebase Setup
- [ ] Firebase initialized
- [ ] Crash Reporting enabled
- [ ] Analytics enabled
- [ ] Custom events tracked:
  - [ ] App opened
  - [ ] Shop viewed
  - [ ] WhatsApp order initiated
  - [ ] Search performed
  - [ ] Filters applied

### Monitoring
- [ ] Crash report dashboard setup
- [ ] Performance monitoring enabled
- [ ] Error alerts configured
- [ ] User segmentation setup

---

## Version & Metadata

### Version Info
- [ ] Version name set (e.g., 1.0.0)
- [ ] Version code incremented (1)
- [ ] Package name: com.localkart.app
- [ ] Min SDK version: 21
- [ ] Target SDK version: 34
- [ ] Compilte SDK version: 34

### Build Info
- [ ] Build signed with release keystore
- [ ] Keystore not committed to git
- [ ] Keystore password in GitHub Secrets
- [ ] App Bundle (.aab) generated
- [ ] APK works (if tested locally)

---

## Beta Testing

### Before Play Store Internal Testing
- [ ] Build tested on:
  - [ ] Android 5.0 (API 21) - Minimum
  - [ ] Android 6.0 (API 23)
  - [ ] Android 8.0 (API 26) - Required for Play Store
  - [ ] Android 12.0 (API 31) - Recommended
  - [ ] Android 14.0 (API 34) - Latest

- [ ] All features tested manually:
  - [ ] No crashes
  - [ ] No ANR (Application Not Responding)
  - [ ] Smooth animations
  - [ ] Fast load times

### Beta User Feedback
- [ ] In-app feedback mechanism ready (if using)
- [ ] Support email monitored
- [ ] Crash reports reviewed daily
- [ ] User feedback prioritized

---

## Pre-Submission Final Checks

1. **Code Review**
   - [ ] All code reviewed (PR merged to main)
   - [ ] No TODO comments left
   - [ ] No commented-out code
   - [ ] No debug logging

2. **Compliance**
   - [ ] App complies with Play Store policies
   - [ ] No prohibited content
   - [ ] Age ratings appropriate
   - [ ] Required permissions justified

3. **Functionality**
   - [ ] All promised features working
   - [ ] Core flows (shop → order → WhatsApp) working
   - [ ] Error handling graceful
   - [ ] Empty states clear

4. **Performance**
   - [ ] App startup < 3 seconds
   - [ ] Page load < 2 seconds
   - [ ] No jank or stuttering
   - [ ] Battery usage reasonable

5. **Security**
   - [ ] HTTPS only
   - [ ] No API keys exposed
   - [ ] User data encrypted
   - [ ] Permissions minimal and justified

6. **Device Support**
   - [ ] Supported on Android 5.0+
   - [ ] UI works on all screen sizes
   - [ ] Landscape mode works (if supported)
   - [ ] Notch/cutout handling good

---

## Sign-Off

- [ ] Product Manager approved feature set
- [ ] QA lead approved test results
- [ ] Security team approved security checklist
- [ ] Legal approved privacy & terms
- [ ] Dev lead approved code quality

**Date:** _______________
**Signed by:** _______________
**Ready for Play Store:** YES / NO

---

## Post-Launch Monitoring

First 7 days:
- [ ] Monitor crash rates daily
- [ ] Check user ratings
- [ ] Review user feedback
- [ ] Monitor API error rates
- [ ] Check performance metrics
- [ ] Be ready to hotfix critical issues

First 30 days:
- [ ] Weekly feature request review
- [ ] Monthly performance optimization
- [ ] User retention analysis
- [ ] Feature usage analysis
