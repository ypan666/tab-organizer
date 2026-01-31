#!/bin/bash

# Tab Organizer - GitHub Quick Deployment Script
# Usage: ./deploy.sh your-github-username

set -e  # Exit on error

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}    Tab Organizer - GitHub Deployment Script${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Check parameters
if [ -z "$1" ]; then
    echo -e "${RED}❌ Error: Please provide your GitHub username${NC}"
    echo "Usage: ./deploy.sh your-github-username"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="tab-organizer"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "   GitHub Username: $GITHUB_USERNAME"
echo "   Repository Name: $REPO_NAME"
echo ""

# Check if Git is initialized
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Error: Git repository not initialized${NC}"
    echo "Please run: git init"
    exit 1
fi

# Check if there are commits
if ! git rev-parse HEAD >/dev/null 2>&1; then
    echo -e "${RED}❌ Error: No commit history${NC}"
    echo "Please create first commit"
    exit 1
fi

# Check remote repository
if git remote | grep -q "origin"; then
    echo -e "${YELLOW}⚠️  Existing remote repository detected${NC}"
    CURRENT_REMOTE=$(git remote get-url origin)
    echo "   Current remote: $CURRENT_REMOTE"
    echo ""
    read -p "Update remote repository URL? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git remote remove origin
        git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
        echo -e "${GREEN}✅ Remote repository updated${NC}"
    fi
else
    # Add remote repository
    echo -e "${BLUE}🔗 Adding remote repository...${NC}"
    git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
    echo -e "${GREEN}✅ Remote repository added${NC}"
fi

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⚠️  Important Notice:${NC}"
echo ""
echo "Before pushing, please ensure you've created the repository on GitHub:"
echo "1. Visit: https://github.com/new"
echo "2. Repository name: $REPO_NAME"
echo "3. Set as Public"
echo "4. Don't check 'Initialize with README'"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -p "Have you created the GitHub repository? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏸  Canceling push, please create GitHub repository first${NC}"
    exit 0
fi

# Push to GitHub
echo ""
echo -e "${BLUE}🚀 Pushing to GitHub...${NC}"
git branch -M main
if git push -u origin main; then
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}   🎉 Success! Project pushed to GitHub!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${BLUE}🔗 Your project URL:${NC}"
    echo "   https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo -e "${BLUE}📝 Next steps:${NC}"
    echo "   1. Check SCREENSHOTS_GUIDE.md to create demo screenshots"
    echo "   2. Add Topics on GitHub: chrome-extension, productivity"
    echo "   3. Create your first Release (v2.0.0)"
    echo "   4. Share your project!"
    echo ""
else
    echo ""
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}   ❌ Push failed${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${YELLOW}Possible causes:${NC}"
    echo "   1. Repository doesn't exist - Please create on GitHub first"
    echo "   2. No permission - Check username and access rights"
    echo "   3. Network issue - Check network connection"
    echo ""
    echo -e "${YELLOW}💡 Manual push command:${NC}"
    echo "   git push -u origin main"
    echo ""
    exit 1
fi
