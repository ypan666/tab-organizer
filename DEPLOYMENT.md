# 🚀 GitHub Deployment Guide

Complete GitHub deployment process, from initialization to pushing.

## 📋 Prerequisites

### 1. Install Git (if not already installed)
```bash
# Check if installed
git --version

# macOS install (if needed)
xcode-select --install
```

### 2. Configure Git (first time use)
```bash
# Set username
git config --global user.name "Your Name"

# Set email
git config --global user.email "your.email@example.com"
```

### 3. Create GitHub Account
If you don't have an account yet, visit https://github.com to register

---

## 🎯 Deployment Steps

### Step 1: Initialize Git Repository

Run in project directory:

```bash
cd /Users/alina/Desktop/tab_organizer

# Initialize Git repository
git init

# Check status
git status
```

### Step 2: Add Files to Staging

```bash
# Add all files
git add .

# Or selectively add
git add manifest.json background.js popup.html popup.js confirm.html confirm.js styles.css
git add icon16.png icon48.png icon128.png
git add README.md LICENSE CONTRIBUTING.md .gitignore
git add .github/

# View files to be committed
git status
```

### Step 3: Create First Commit

```bash
git commit -m "Initial commit: Tab Organizer v2.0

- Implement real-time tab monitoring
- Implement smart archiving to tab groups
- Add periodic reminders (every 10 minutes)
- Add beautiful user interface
- Add customizable settings
- Complete documentation and guides"
```

### Step 4: Create Repository on GitHub

1. Visit https://github.com/new
2. Fill in information:
   - **Repository name**: `tab-organizer`
   - **Description**: `Smart tab management - automatically archive inactive tabs to keep your browser clean`
   - **Public**: Choose public
   - **Do not** check "Initialize this repository with a README"
3. Click "Create repository"

### Step 5: Connect to Remote Repository

Copy the repository URL shown on GitHub, then run:

```bash
# Add remote repository (replace with your URL)
git remote add origin https://github.com/your-username/tab-organizer.git

# Verify remote repository
git remote -v
```

### Step 6: Push to GitHub

```bash
# Push to main branch
git branch -M main
git push -u origin main
```

---

## 🎨 Prepare Screenshots (Important!)

Before or after pushing, you need to add screenshots:

### Quick Screenshot Workflow

1. **Create screenshots folder**
   ```bash
   mkdir -p screenshots
   ```

2. **Follow SCREENSHOTS_GUIDE.md to create screenshots**
   - popup.png
   - confirm.png
   - archived.png
   - workflow.gif (optional)

3. **Add screenshots to repository**
   ```bash
   git add screenshots/
   git commit -m "docs: Add project demo screenshots"
   git push
   ```

### Temporary Solution (if no screenshots yet)

Edit README.md, change image section to:

```markdown
## 📸 Demo

> 📸 Demo screenshots coming soon...

### Feature Preview
- ✨ Purple gradient Popup interface
- 📊 Real-time tab statistics
- 🗂 Clear archive confirmation page
- 📁 Smart tab group management
```

Then commit update:
```bash
git add README.md
git commit -m "docs: Remove screenshots temporarily, to be added"
git push
```

---

## 📝 Update Project Information

### Modify README.md

Replace these placeholders with your actual information:

```markdown
# Replace these:
your-username → Your GitHub username
Your Name → Your real name or nickname
your.email@example.com → Your email
```

Use these commands for batch replacement (macOS):

```bash
# Replace GitHub username
sed -i '' 's/your-username/actual-username/g' README.md CONTRIBUTING.md

# Replace email
sed -i '' 's/your.email@example.com/your.real@email.com/g' README.md CONTRIBUTING.md

# Commit changes
git add README.md CONTRIBUTING.md
git commit -m "docs: Update author information"
git push
```

---

## 🌟 GitHub Repository Settings

### 1. Add Topics (Tags)

On GitHub repository page:
1. Click "Add topics" on the right
2. Add: `chrome-extension`, `tab-manager`, `productivity`, `browser-extension`, `javascript`

### 2. Set Repository Description

In "About" section:
- **Description**: `Smart tab management - automatically archive inactive tabs to keep your browser clean`
- **Website**: Leave empty or add your personal website
- **Topics**: As above

### 3. Enable Issues and Discussions

In Settings > General:
- ✅ Issues
- ✅ Discussions (optional)

---

## 📊 Enhance Project

### Add Shields Badges

Badges in README.md automatically show project info:

```markdown
![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![Chrome](https://img.shields.io/badge/Chrome-Extension-green.svg)
![License](https://img.shields.io/badge/license-MIT-orange.svg)
![Stars](https://img.shields.io/github/stars/your-username/tab-organizer)
```

### Create Release

Publish first version:

1. Click "Releases" on GitHub repository page
2. Click "Create a new release"
3. Fill in information:
   - **Tag**: `v2.0.0`
   - **Title**: `v2.0.0 - Initial Release`
   - **Description**: Copy feature list from README
4. Optionally add packaged zip file
5. Click "Publish release"

---

## 🎬 Subsequent Update Workflow

When you modify code:

```bash
# 1. View changes
git status
git diff

# 2. Add changes
git add .

# 3. Commit
git commit -m "feat: Add new feature description"

# 4. Push
git push
```

### Commit Message Guidelines

```
feat: New feature
fix: Bug fix
docs: Documentation update
style: Code formatting
refactor: Refactoring
test: Tests
chore: Build or auxiliary tools
```

---

## 🐛 Common Issues

### Issue 1: Push Rejected

```bash
# If remote has updates, pull first
git pull origin main --rebase
git push
```

### Issue 2: Forgot to Add File

```bash
# Amend last commit
git add forgotten-file
git commit --amend --no-edit
git push -f  # Note: Only use when no one else has pulled
```

### Issue 3: Committed Wrong File

```bash
# Remove from Git but keep local file
git rm --cached filename
git commit -m "chore: Remove unnecessary file"
git push
```

---

## ✅ Deployment Checklist

Before deploying, ensure:

- [ ] All code files added
- [ ] README.md content complete
- [ ] LICENSE file exists
- [ ] .gitignore configured correctly
- [ ] Personal information updated (username, email)
- [ ] Screenshots prepared (or marked as pending)
- [ ] CONTRIBUTING.md exists
- [ ] Issue templates created
- [ ] Git repository initialized
- [ ] Pushed to GitHub
- [ ] GitHub repository description filled
- [ ] Topics added
- [ ] First Release created

---

## 🎉 Done!

Congratulations! Your project is now on GitHub!

### Next Steps

1. **Share Project**
   - Share on social media
   - Submit to Chrome Web Store
   - Add to relevant awesome-lists

2. **Continuous Improvement**
   - Collect user feedback
   - Fix bugs
   - Add new features

3. **Build Community**
   - Respond to Issues
   - Review Pull Requests
   - Update documentation

---

**Your project URL will be:**
`https://github.com/your-username/tab-organizer`

**Now go and deploy!** 🚀
