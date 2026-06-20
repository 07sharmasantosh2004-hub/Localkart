# 🔐 GitHub Setup for LocalKart

Complete guide for setting up GitHub Secrets and CI/CD for Play Store deployment.

---

## 📁 Files in This Directory

### **SECRETS_SETUP.md** ⭐ START HERE
Comprehensive guide with:
- ✅ Detailed explanation of each secret
- ✅ How to create/get each value
- ✅ Step-by-step instructions
- ✅ Troubleshooting tips
- ✅ Security best practices

**📖 Read this for:** Complete understanding and detailed setup

---

### **QUICK_SECRETS_CHECKLIST.txt** ⭐ QUICK REFERENCE
Quick reference checklist with:
- ✅ All 5 secrets you need to add
- ✅ Quick copy-paste format
- ✅ Where to add each secret
- ✅ Verification steps
- ✅ Troubleshooting

**✍️ Use this for:** Fast checklist while adding secrets

---

### **SECRETS_TEMPLATE.json** ⭐ REFERENCE
JSON template showing:
- ✅ Structure of all secrets
- ✅ What each secret contains
- ✅ How to get each value
- ✅ Complete checklist
- ✅ Security guidelines

**📋 Use this for:** Reference and planning

---

### **workflows/** Directory
GitHub Actions workflows:
- `validate.yml` - PR validation
- `build-android.yml` - Android build & Play Store deployment
- `lighthouse-ci.yml` - Performance monitoring

**🔧 Used by:** GitHub Actions CI/CD pipeline

---

## 🚀 Quick Start (5 Minutes)

### 1. **Read the Quick Checklist**
```
.github/QUICK_SECRETS_CHECKLIST.txt
```

### 2. **Prepare Your Secrets**
- [ ] Get keystore password
- [ ] Get key password
- [ ] Encode keystore to base64
- [ ] Get Play Store service account JSON

### 3. **Add Secrets to GitHub**
```
GitHub → Settings → Secrets and variables → Actions → New repository secret
```

For each secret:
- [ ] KEYSTORE_PASSWORD
- [ ] KEYSTORE_ALIAS (value: `localkart-key`)
- [ ] KEYSTORE_ALIAS_PASSWORD
- [ ] ANDROID_KEYSTORE_B64
- [ ] PLAY_STORE_SERVICE_ACCOUNT

### 4. **Verify**
```
GitHub → Settings → Secrets and variables → Actions
All 5 secrets should be visible
```

### 5. **Test**
```bash
git commit --allow-empty -m "test: trigger CI/CD"
git push origin main
# Go to Actions tab and watch the build run
```

---

## 🔑 The 5 Secrets You Need

| # | Name | What | Priority |
|---|------|------|----------|
| 1 | KEYSTORE_PASSWORD | Keystore password | 🔴 REQUIRED |
| 2 | KEYSTORE_ALIAS | Key alias (`localkart-key`) | 🔴 REQUIRED |
| 3 | KEYSTORE_ALIAS_PASSWORD | Key password | 🔴 REQUIRED |
| 4 | ANDROID_KEYSTORE_B64 | Base64 keystore file | 🔴 REQUIRED |
| 5 | PLAY_STORE_SERVICE_ACCOUNT | Google Play JSON | 🔴 REQUIRED |

---

## 📋 Which File to Use

### **Just getting started?**
👉 Read `QUICK_SECRETS_CHECKLIST.txt`

### **Want detailed explanations?**
👉 Read `SECRETS_SETUP.md`

### **Need reference material?**
👉 Use `SECRETS_TEMPLATE.json`

### **Troubleshooting a build?**
👉 Check `SECRETS_SETUP.md` → Troubleshooting section

### **Need to remember what you did?**
👉 Check GitHub → Settings → Secrets (see what's already added)

---

## ⚠️ Security Reminders

### ✅ DO:
- ✅ Use strong passwords (25+ chars)
- ✅ Store passwords in password manager
- ✅ Keep keystore file secure
- ✅ Never commit secrets to git
- ✅ Rotate credentials annually

### ❌ DON'T:
- ❌ Commit keystore to git
- ❌ Write secrets in commit messages
- ❌ Share secrets via chat/email
- ❌ Hardcode secrets anywhere
- ❌ Use weak passwords

---

## 🔗 Related Files

**In this repository:**
- `PRODUCTION_READINESS.md` - Production setup guide
- `PLAY_STORE_DEPLOYMENT.md` - How to deploy to Play Store
- `PLAY_STORE_CHECKLIST.md` - Pre-launch verification

**On GitHub:**
- Settings → Secrets and variables → Actions - Where to add secrets
- Actions → Workflows - Monitor build runs

---

## 📞 Need Help?

### For Secrets Setup:
👉 See `SECRETS_SETUP.md` (Troubleshooting section)

### For Build Issues:
👉 Go to Actions tab and check build logs

### For General Questions:
👉 See `PRODUCTION_READINESS.md`

---

## ✅ Complete Setup Checklist

- [ ] Read `QUICK_SECRETS_CHECKLIST.txt`
- [ ] Gather all required information
- [ ] Create release.keystore (if needed)
- [ ] Encode keystore to base64
- [ ] Create Google Play service account
- [ ] Go to GitHub Settings → Secrets
- [ ] Add KEYSTORE_PASSWORD
- [ ] Add KEYSTORE_ALIAS
- [ ] Add KEYSTORE_ALIAS_PASSWORD
- [ ] Add ANDROID_KEYSTORE_B64
- [ ] Add PLAY_STORE_SERVICE_ACCOUNT
- [ ] Verify all 5 secrets visible
- [ ] Push test commit
- [ ] Check Actions tab for build
- [ ] Deploy to Play Store 🚀

---

## 🎯 Next Steps

1. **Right now:** Read `QUICK_SECRETS_CHECKLIST.txt`
2. **Next:** Gather your secrets information
3. **Then:** Add secrets to GitHub
4. **Finally:** Test by pushing a commit

---

**Repository:** https://github.com/07sharmasantosh2004-hub/Localkart  
**Status:** Ready for secrets setup ✅  
**Updated:** 2024-01-20
