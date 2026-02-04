@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    GitHub Repository Initializer
echo ========================================
echo.

REM Get parent folder name as default repo name
for %%I in ("%~dp0..") do set "PROJECT_NAME=%%~nxI"
echo Detected project name: %PROJECT_NAME%
echo.

REM Ask for repository name
set "REPO_NAME="
set /p "REPO_NAME=Enter repository name (press Enter for '%PROJECT_NAME%'): "
if "!REPO_NAME!"=="" set "REPO_NAME=%PROJECT_NAME%"

echo.
echo Select repository visibility:
echo [1] Public  - Anyone can see this repository
echo [2] Private - Only you can see this repository
set /p "VISIBILITY_CHOICE=Enter choice (1 or 2): "

if "!VISIBILITY_CHOICE!"=="1" (
    set "VISIBILITY=public"
) else if "!VISIBILITY_CHOICE!"=="2" (
    set "VISIBILITY=private"
) else (
    echo Invalid choice. Defaulting to private.
    set "VISIBILITY=private"
)

echo.
echo Creating !VISIBILITY! repository: !REPO_NAME!
echo.

REM Navigate to project root (parent of scripts-deploy)
cd /d "%~dp0.."

REM Check if git is initialized
if not exist ".git" (
    echo Initializing Git repository...
    git init
    if errorlevel 1 (
        echo ERROR: Failed to initialize Git repository
        pause
        exit /b 1
    )
    echo Git repository initialized successfully!
    echo.
)

REM Create .gitignore if it doesn't exist
if not exist ".gitignore" (
    echo Select project type for .gitignore:
    echo [1] Node.js / JavaScript
    echo [2] Python
    echo [3] General (basic patterns)
    echo [4] Skip (no .gitignore)
    echo.
    set /p "GITIGNORE_TYPE=Enter choice (1-4): "
    
    if "!GITIGNORE_TYPE!"=="1" (
        (
            echo # Dependencies
            echo node_modules/
            echo.
            echo # Build
            echo dist/
            echo build/
            echo.
            echo # Environment
            echo .env
            echo .env.local
            echo .env.*.local
            echo.
            echo # Logs
            echo *.log
            echo npm-debug.log*
            echo.
            echo # IDE
            echo .idea/
            echo .vscode/
            echo *.swp
            echo.
            echo # OS
            echo .DS_Store
            echo Thumbs.db
        ) > .gitignore
        echo .gitignore created for Node.js!
    ) else if "!GITIGNORE_TYPE!"=="2" (
        (
            echo # Python
            echo __pycache__/
            echo *.py[cod]
            echo venv/
            echo .venv/
            echo env/
            echo.
            echo # Environment
            echo .env
            echo.
            echo # IDE
            echo .idea/
            echo .vscode/
            echo *.swp
            echo.
            echo # OS
            echo .DS_Store
            echo Thumbs.db
        ) > .gitignore
        echo .gitignore created for Python!
    ) else if "!GITIGNORE_TYPE!"=="3" (
        (
            echo # Environment
            echo .env
            echo .env.local
            echo.
            echo # Logs
            echo *.log
            echo.
            echo # IDE
            echo .idea/
            echo .vscode/
            echo.
            echo # OS
            echo .DS_Store
            echo Thumbs.db
        ) > .gitignore
        echo .gitignore created!
    ) else (
        echo Skipping .gitignore creation.
    )
    echo.
)

REM Ask about README
if not exist "README.md" (
    set /p "CREATE_README=Create README.md? (Y/N): "
    if /i "!CREATE_README!"=="Y" (
        (
            echo # !REPO_NAME!
            echo.
            echo ## Description
            echo.
            echo Add your project description here.
        ) > README.md
        echo README.md created!
        echo.
    )
)

REM Check if GitHub CLI is installed using where command
set "GH_INSTALLED=0"
where gh >nul 2>&1 && set "GH_INSTALLED=1"

if "!GH_INSTALLED!"=="0" (
    echo.
    echo ========================================
    echo GitHub CLI is NOT installed
    echo ========================================
    echo.
    echo OPTION 1: Create repository manually
    echo   1. Go to: https://github.com/new
    echo   2. Create a !VISIBILITY! repository named: !REPO_NAME!
    echo   3. Copy the repository URL
    echo   4. Paste it below
    echo.
    echo OPTION 2: Install GitHub CLI
    echo   Download from: https://cli.github.com/
    echo.
    echo ========================================
    echo.
    start "" "https://github.com/new"
    echo Opening GitHub in browser...
    echo.
    set "MANUAL_URL="
    set /p "MANUAL_URL=Enter GitHub repository URL (or press Enter to skip): "
    
    if "!MANUAL_URL!"=="" (
        echo.
        echo Repository initialization incomplete.
        pause
        exit /b 0
    )
    
    echo.
    echo Adding remote origin...
    git remote remove origin 2>nul
    git remote add origin "!MANUAL_URL!"
    echo Remote origin set to: !MANUAL_URL!
    echo.
    
    git add .
    git commit -m "Initial commit" 2>nul
    git branch -M main
    git push -u origin main
    
    if errorlevel 1 (
        echo.
        echo Push failed. Try running: git push -u origin main
    ) else (
        echo.
        echo Repository initialized and pushed successfully!
    )
    
    pause
    exit /b 0
)

REM GitHub CLI IS installed - use it
echo GitHub CLI detected!
echo.

REM Check auth status
echo Checking GitHub authentication...
gh auth status >nul 2>&1
if errorlevel 1 (
    echo.
    echo You are not logged in. Starting login...
    gh auth login
    if errorlevel 1 (
        echo ERROR: Authentication failed
        pause
        exit /b 1
    )
)

echo Authenticated successfully!
echo.

REM Stage all files first
echo Staging files...
git add .

REM Create initial commit
echo Creating initial commit...
git commit -m "Initial commit" 2>nul

REM Create repository using GitHub CLI
echo.
echo Creating repository on GitHub...
gh repo create "!REPO_NAME!" --!VISIBILITY! --source=. --remote=origin --push

if errorlevel 1 (
    echo.
    echo ========================================
    echo Repository creation failed.
    echo.
    echo This might mean:
    echo 1. Repository already exists
    echo 2. Network issue
    echo 3. Name is invalid
    echo ========================================
    echo.
    set /p "MANUAL_URL=Enter existing repo URL (or Enter to cancel): "
    if "!MANUAL_URL!"=="" (
        pause
        exit /b 1
    )
    
    git remote remove origin 2>nul
    git remote add origin "!MANUAL_URL!"
    git branch -M main
    git push -u origin main
)

echo.
echo ========================================
echo Repository setup complete!
echo ========================================
echo.

for /f "delims=" %%i in ('git remote get-url origin 2^>nul') do (
    echo Repository URL: %%i
    echo.
    echo Opening in browser...
    start "" "%%i"
)

echo.
pause
exit /b 0
