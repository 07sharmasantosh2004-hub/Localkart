# 🔐 GitHub Secrets & Variables Setup Guide

**Repository:** https://github.com/07sharmasantosh2004-hub/Localkart  
**Status:** ⚠️ NOT YET CONFIGURED - Follow this guide to add secrets

---

## 📋 All Required GitHub Secrets

You need to add **5 secrets** to GitHub Actions for CI/CD deployment to work.

### Location to Add Secrets
```
GitHub → Settings → Secrets and variables → Actions → New repository secret
```

---

## 🔑 Secrets You Must Add

### 1️⃣ KEYSTORE_PASSWORD
**What it is:** Password for your Android keystore file  
**How to get it:** Password you created when generating the keystore  
**Example value:** `MySecure@Keystore#Pass2024`

```
Name:  KEYSTORE_PASSWORD
Value: [YOUR_KEYSTORE_PASSWORD]
Type:  Secret
```

**How to create if you don't have one:**
```bash
cd frontend/android
keytool -genkey -v -keystore release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias localkart-key
# Remember the password!
```

---

### 2️⃣ KEYSTORE_ALIAS
**What it is:** The alias name for your signing key  
**How to get it:** Fixed value (we already set this)  
**Value:** `localkart-key`

```
Name:  KEYSTORE_ALIAS
Value: localkart-key
Type:  Secret
```

---

### 3️⃣ KEYSTORE_ALIAS_PASSWORD
**What it is:** Password for the specific key (usually same as keystore password)  
**How to get it:** Password you created for the key  
**Example value:** `MySecure@Keystore#Pass2024`

```
Name:  KEYSTORE_ALIAS_PASSWORD
Value: [YOUR_KEY_PASSWORD]
Type:  Secret
```

---

### 4️⃣ ANDROID_KEYSTORE_B64
**What it is:** Your keystore file encoded in Base64  
**How to get it:** Encode your `release.keystore` file

**On Mac/Linux:**
```bash
# Navigate to where release.keystore is located
base64 release.keystore | tr -d '\n' | pbcopy
# Then paste into GitHub secret
```

**On Windows (PowerShell):**
```powershell
# Navigate to where release.keystore is located
$keystore = [Convert]::ToBase64String([IO.File]::ReadAllBytes((Get-Item "release.keystore").FullName))
$keystore | Set-Clipboard
# Then paste into GitHub secret
```

**On Windows (Command Prompt):**
```cmd
certutil -encodehex release.keystore release.keystore.b64
# Copy content of release.keystore.b64
```

```
Name:  ANDROID_KEYSTORE_B64
Value: MIIJrAIBAzCCCXgGCSqGSIb3DQEHBaCC...
       (very long base64 string - paste entire content)
Type:  Secret
```

---

### 5️⃣ PLAY_STORE_SERVICE_ACCOUNT
**What it is:** JSON key for Google Play Store API  
**How to get it:** Create in Google Cloud Console

**Steps to create:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select or create a project
3. Enable "Google Play Android Developer API"
4. Go to "Service Accounts"
5. Create a new service account named "localkart-github"
6. Grant role: "Editor"
7. Create JSON key
8. Download the file

**Content format (example):**
```json
{
  "type": "service_account",
  "project_id": "localkart-12345",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgI...\n-----END PRIVATE KEY-----\n",
  "client_email": "localkart-github@localkart-12345.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/..."
}
```

```
Name:  PLAY_STORE_SERVICE_ACCOUNT
Value: [ENTIRE JSON FILE CONTENT]
Type:  Secret
```

---

## 📝 Environment Variables (Optional)

If you want to add environment variables (different from secrets), go to:
```
GitHub → Settings → Secrets and variables → Variables
```

### Optional Variables to Add

#### APP_VERSION
```
Name:  APP_VERSION
Value: 1.0.0
Type:  Variable
```

#### ANDROID_PACKAGE_NAME
```
Name:  ANDROID_PACKAGE_NAME
Value: com.localkart.app
Type:  Variable
```

#### PLAY_STORE_TRACK
```
Name:  PLAY_STORE_TRACK
Value: internal
Type:  Variable
```

---

## ✅ Complete Checklist

Add these secrets one by one:

### Secrets (REQUIRED - 5 total)
- [ ] **KEYSTORE_PASSWORD** - Your keystore password
- [ ] **KEYSTORE_ALIAS** - `localkart-key`
- [ ] **KEYSTORE_ALIAS_PASSWORD** - Your key password
- [ ] **ANDROID_KEYSTORE_B64** - Base64 encoded keystore
- [ ] **PLAY_STORE_SERVICE_ACCOUNT** - Google Play JSON

### Variables (OPTIONAL - 3 total)
- [ ] **APP_VERSION** - `1.0.0`
- [ ] **ANDROID_PACKAGE_NAME** - `com.localkart.app`
- [ ] **PLAY_STORE_TRACK** - `internal`

---

## 🔒 Security Best Practices

### ✅ DO:
- ✅ Use strong passwords (25+ characters, mixed case, symbols)
- ✅ Store passwords in password manager
- ✅ Keep keystore file secure locally
- ✅ Rotate secrets periodically
- ✅ Use separate service accounts per environment
- ✅ Audit secret access logs
- ✅ Delete old secrets when no longer needed

### ❌ DON'T:
- ❌ Commit keystore files to git
- ❌ Commit .env files to git
- ❌ Share secrets with team via chat/email
- ❌ Use same passwords for multiple services
- ❌ Write secrets in commit messages
- ❌ Use weak passwords (avoid "123456", "password", etc.)
- ❌ Hardcode secrets anywhere

---

## 🔐 After Adding Secrets

### Verify Secrets Were Added
```
GitHub → Settings → Secrets and variables → Actions
```

You should see:
```
✓ KEYSTORE_PASSWORD (updated X seconds ago)
✓ KEYSTORE_ALIAS (updated X seconds ago)
✓ KEYSTORE_ALIAS_PASSWORD (updated X seconds ago)
✓ ANDROID_KEYSTORE_B64 (updated X seconds ago)
✓ PLAY_STORE_SERVICE_ACCOUNT (updated X seconds ago)
```

### Test CI/CD Pipeline
```bash
# Push a test commit
git commit --allow-empty -m "test: trigger CI/CD pipeline"
git push origin main

# Go to GitHub Actions tab
# Watch the workflows run
```

---

## 🔗 Where These Secrets Are Used

### `.github/workflows/build-android.yml`
```yaml
env:
  KEYSTORE_PATH: ${{ github.workspace }}/android.keystore
  KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
  KEYSTORE_ALIAS: ${{ secrets.KEYSTORE_ALIAS }}
  KEYSTORE_ALIAS_PASSWORD: ${{ secrets.KEYSTORE_ALIAS_PASSWORD }}
  ANDROID_KEYSTORE_B64: ${{ secrets.ANDROID_KEYSTORE_B64 }}
  PLAY_STORE_SERVICE_ACCOUNT: ${{ secrets.PLAY_STORE_SERVICE_ACCOUNT }}
```

---

## 📞 Troubleshooting

### Build fails with "Keystore not found"
- [ ] Check ANDROID_KEYSTORE_B64 is correct base64 string
- [ ] Verify keystore file is properly encoded
- [ ] Try regenerating base64 encoding

### Build fails with "Invalid keystore password"
- [ ] Verify KEYSTORE_PASSWORD is correct
- [ ] Check for extra spaces in password
- [ ] Ensure special characters are properly encoded

### Build fails with "Play Store authentication error"
- [ ] Check PLAY_STORE_SERVICE_ACCOUNT is valid JSON
- [ ] Verify service account has Play Store API access
- [ ] Check service account hasn't been deleted

### Secrets show as "Updated X ago" but build still fails
- [ ] Clear GitHub Actions cache: Settings → Actions → Clear all caches
- [ ] Re-run the workflow: Actions → workflow → Re-run all jobs

---

## 🚀 Next Steps After Setup

1. **Add all 5 secrets** following this guide
2. **Verify secrets** are showing in GitHub
3. **Test CI/CD** by pushing a commit
4. **Check Actions tab** for build logs
5. **Monitor builds** as you push changes
6. **Deploy to Play Store** when ready

---

## 📚 Reference Links

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Android Keystore Documentation](https://developer.android.com/studio/publish/app-signing)
- [Google Play Console](https://play.google.com/console)
- [Google Cloud Service Accounts](https://cloud.google.com/iam/docs/service-accounts)

---

## 📝 Notes

- **Do NOT commit this file with actual secret values**
- This file documents WHAT to add, not actual values
- Keep actual passwords in password manager
- Update this file when adding new secrets in future

---

**Status:** Ready to configure  
**Last Updated:** 2024-01-20  
**Repository:** https://github.com/07sharmasantosh2004-hub/Localkart
