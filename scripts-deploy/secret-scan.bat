@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Secret Scanner
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

echo This tool scans for potential secrets in your code.
echo.

echo Select scan type:
echo.
echo [1] Scan staged files only
echo [2] Scan all tracked files
echo [3] Scan specific file
echo [4] Scan entire commit history
echo [5] Configure secret patterns
echo [6] View .gitignore for sensitive files
echo [7] Add patterns to .gitignore
echo [8] Cancel
echo.
set /p "CHOICE=Enter choice (1-8): "

REM Common secret patterns
set "PATTERNS=password|api_key|apikey|secret|token|private_key|aws_access|aws_secret|ssh_key|auth_token|bearer|credentials"

if "%CHOICE%"=="1" (
    echo.
    echo Scanning staged files for secrets...
    echo ========================================
    echo.
    
    set "FOUND=0"
    for /f "delims=" %%f in ('git diff --cached --name-only') do (
        echo Scanning: %%f
        findstr /i /n /r "%PATTERNS%" "%%f" 2>nul
        if not errorlevel 1 (
            echo   [!] POTENTIAL SECRET FOUND in %%f
            set "FOUND=1"
        )
    )
    
    echo.
    if "!FOUND!"=="1" (
        echo ========================================
        echo [WARNING] Potential secrets detected!
        echo Please review the files above before committing.
        echo ========================================
    ) else (
        echo [OK] No obvious secrets detected in staged files.
    )

) else if "%CHOICE%"=="2" (
    echo.
    echo Scanning all tracked files...
    echo ========================================
    echo.
    
    set "FOUND=0"
    for /f "delims=" %%f in ('git ls-files') do (
        findstr /i /n /r "%PATTERNS%" "%%f" 2>nul >nul
        if not errorlevel 1 (
            echo [!] %%f
            findstr /i /n /r "%PATTERNS%" "%%f" 2>nul
            echo.
            set "FOUND=1"
        )
    )
    
    echo.
    if "!FOUND!"=="1" (
        echo ========================================
        echo [WARNING] Potential secrets detected!
        echo ========================================
    ) else (
        echo [OK] No obvious secrets detected.
    )

) else if "%CHOICE%"=="3" (
    echo.
    set /p "FILE_PATH=Enter file path to scan: "
    if not exist "!FILE_PATH!" (
        echo ERROR: File not found
        pause
        exit /b 1
    )
    
    echo.
    echo Scanning !FILE_PATH!...
    echo ========================================
    echo.
    
    findstr /i /n /r "%PATTERNS%" "!FILE_PATH!" 2>nul
    if errorlevel 1 (
        echo [OK] No obvious secrets detected in this file.
    ) else (
        echo.
        echo [WARNING] Potential secrets found above!
    )

) else if "%CHOICE%"=="4" (
    echo.
    echo Scanning commit history for secrets...
    echo This may take a while for large repositories.
    echo ========================================
    echo.
    
    echo Checking for high-entropy strings and patterns...
    
    REM Check for common secret file names in history
    echo.
    echo Files that might contain secrets:
    git log --all --full-history --name-only -- "*.pem" "*.key" "*.env" "*secret*" "*password*" "*credential*" 2>nul | findstr /v "^$" | findstr /v "^commit" | findstr /v "^Author" | findstr /v "^Date" | sort | uniq
    
    echo.
    echo Commits containing potential secret patterns:
    git log --all --oneline -S "password" -S "api_key" -S "secret" 2>nul | head -20
    
    echo.
    echo [INFO] For thorough history scanning, consider using tools like:
    echo   - truffleHog
    echo   - git-secrets
    echo   - gitleaks

) else if "%CHOICE%"=="5" (
    echo.
    echo Current patterns being scanned:
    echo %PATTERNS%
    echo.
    echo Enter additional patterns (comma-separated):
    set /p "NEW_PATTERNS=Patterns: "
    
    if not "!NEW_PATTERNS!"=="" (
        set "PATTERNS=%PATTERNS%|!NEW_PATTERNS:,=|!"
        echo.
        echo Updated patterns: !PATTERNS!
    )

) else if "%CHOICE%"=="6" (
    echo.
    if exist ".gitignore" (
        echo Current .gitignore:
        echo ========================================
        type .gitignore
        echo ========================================
    ) else (
        echo No .gitignore file found.
    )

) else if "%CHOICE%"=="7" (
    echo.
    echo Adding recommended security patterns to .gitignore...
    echo.
    
    (
        echo.
        echo # Security - Added by secret-scan
        echo *.pem
        echo *.key
        echo *.p12
        echo *.pfx
        echo .env
        echo .env.*
        echo !.env.example
        echo *.secrets
        echo secrets.json
        echo credentials.json
        echo config.local.*
        echo *.keystore
        echo *.jks
        echo id_rsa*
        echo *.gpg
    ) >> .gitignore
    
    echo Patterns added to .gitignore!
    echo.
    echo Remember to also add these to your global gitignore:
    echo   git config --global core.excludesfile ~/.gitignore_global

) else if "%CHOICE%"=="8" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
echo ========================================
echo Security Tips:
echo ========================================
echo 1. Use environment variables for secrets
echo 2. Use a secrets manager (AWS Secrets Manager, HashiCorp Vault)
echo 3. Add sensitive files to .gitignore BEFORE creating them
echo 4. Use git-crypt for encrypting sensitive files
echo 5. Rotate any exposed secrets immediately
echo ========================================
echo.
pause
