@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Archive Creator
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    echo Please run init-repo.bat first
    pause
    exit /b 1
)

for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"
echo Current branch: %CURRENT_BRANCH%
echo.

echo Select archive type:
echo.
echo [1] Archive current HEAD (zip)
echo [2] Archive current HEAD (tar)
echo [3] Archive specific branch
echo [4] Archive specific tag
echo [5] Archive specific commit
echo [6] Archive with prefix directory
echo [7] Archive specific directory only
echo [8] Archive for release (with version)
echo [9] Cancel
echo.
set /p "CHOICE=Enter choice (1-9): "

REM Get timestamp using PowerShell
for /f "delims=" %%d in ('powershell -Command "Get-Date -Format \"yyyyMMdd\""') do set "TIMESTAMP=%%d"

REM Get repository name
for /f "delims=" %%i in ('git rev-parse --show-toplevel 2^>nul') do set "REPO_PATH=%%i"
for %%i in ("!REPO_PATH!") do set "REPO_NAME=%%~ni"

if "%CHOICE%"=="1" (
    set "ARCHIVE_NAME=%REPO_NAME%_%TIMESTAMP%.zip"
    set /p "CUSTOM_NAME=Enter filename (Enter for !ARCHIVE_NAME!): "
    if not "!CUSTOM_NAME!"=="" set "ARCHIVE_NAME=!CUSTOM_NAME!"
    
    echo.
    echo Creating archive: !ARCHIVE_NAME!
    git archive --format=zip -o "!ARCHIVE_NAME!" HEAD
    
    if errorlevel 1 (
        echo ERROR: Archive creation failed
        pause
        exit /b 1
    ) else (
        echo.
        echo Archive created: !ARCHIVE_NAME!
        for %%A in ("!ARCHIVE_NAME!") do echo Size: %%~zA bytes
    )

) else if "%CHOICE%"=="2" (
    set "ARCHIVE_NAME=%REPO_NAME%_%TIMESTAMP%.tar"
    set /p "CUSTOM_NAME=Enter filename (Enter for !ARCHIVE_NAME!): "
    if not "!CUSTOM_NAME!"=="" set "ARCHIVE_NAME=!CUSTOM_NAME!"
    
    echo.
    echo Creating archive: !ARCHIVE_NAME!
    git archive --format=tar -o "!ARCHIVE_NAME!" HEAD
    
    if errorlevel 1 (
        echo ERROR: Archive creation failed
        pause
        exit /b 1
    ) else (
        echo Archive created: !ARCHIVE_NAME!
    )

) else if "%CHOICE%"=="3" (
    echo.
    echo Available branches:
    git branch -a
    echo.
    
    set /p "BRANCH_NAME=Enter branch name: "
    if "!BRANCH_NAME!"=="" (
        echo ERROR: Branch name required
        pause
        exit /b 1
    )
    
    set "ARCHIVE_NAME=%REPO_NAME%_!BRANCH_NAME!_%TIMESTAMP%.zip"
    echo.
    echo Creating archive: !ARCHIVE_NAME!
    git archive --format=zip -o "!ARCHIVE_NAME!" !BRANCH_NAME!
    
    if errorlevel 1 (
        echo ERROR: Archive creation failed
        pause
        exit /b 1
    ) else (
        echo Archive created: !ARCHIVE_NAME!
    )

) else if "%CHOICE%"=="4" (
    echo.
    echo Available tags (latest 20):
    git tag -l --sort=-version:refname -n1 | powershell -Command "$input | Select-Object -First 20"
    echo.
    
    set /p "TAG_NAME=Enter tag name: "
    if "!TAG_NAME!"=="" (
        echo ERROR: Tag name required
        pause
        exit /b 1
    )
    
    set "ARCHIVE_NAME=%REPO_NAME%_!TAG_NAME!.zip"
    echo.
    echo Creating archive: !ARCHIVE_NAME!
    git archive --format=zip -o "!ARCHIVE_NAME!" !TAG_NAME!
    
    if errorlevel 1 (
        echo ERROR: Archive creation failed
        pause
        exit /b 1
    ) else (
        echo Archive created: !ARCHIVE_NAME!
    )

) else if "%CHOICE%"=="5" (
    echo.
    echo Recent commits (last 20):
    git log --oneline -20
    echo.
    
    set /p "COMMIT_HASH=Enter commit hash: "
    if "!COMMIT_HASH!"=="" (
        echo ERROR: Commit hash required
        pause
        exit /b 1
    )
    
    set "SHORT_HASH=!COMMIT_HASH:~0,7!"
    set "ARCHIVE_NAME=%REPO_NAME%_!SHORT_HASH!_%TIMESTAMP%.zip"
    echo.
    echo Creating archive: !ARCHIVE_NAME!
    git archive --format=zip -o "!ARCHIVE_NAME!" !COMMIT_HASH!
    
    if errorlevel 1 (
        echo ERROR: Archive creation failed
        pause
        exit /b 1
    ) else (
        echo Archive created: !ARCHIVE_NAME!
    )

) else if "%CHOICE%"=="6" (
    echo.
    set /p "PREFIX=Enter prefix directory (e.g., myproject/): "
    if "!PREFIX!"=="" (
        echo ERROR: Prefix required
        pause
        exit /b 1
    )
    
    REM Ensure prefix ends with /
    if not "!PREFIX:~-1!"=="/" set "PREFIX=!PREFIX!/"
    
    set "ARCHIVE_NAME=%REPO_NAME%_%TIMESTAMP%.zip"
    echo.
    echo Creating archive: !ARCHIVE_NAME!
    git archive --format=zip --prefix="!PREFIX!" -o "!ARCHIVE_NAME!" HEAD
    
    if errorlevel 1 (
        echo ERROR: Archive creation failed
        pause
        exit /b 1
    ) else (
        echo Archive created: !ARCHIVE_NAME!
        echo Files will be in: !PREFIX!
    )

) else if "%CHOICE%"=="7" (
    echo.
    echo Current directory structure:
    dir /ad /b 2>nul
    echo.
    
    set /p "SUBDIR=Enter directory to archive: "
    if "!SUBDIR!"=="" (
        echo ERROR: Directory required
        pause
        exit /b 1
    )
    
    set "ARCHIVE_NAME=!SUBDIR!_%TIMESTAMP%.zip"
    echo.
    echo Creating archive: !ARCHIVE_NAME!
    git archive --format=zip -o "!ARCHIVE_NAME!" HEAD:!SUBDIR!
    
    if errorlevel 1 (
        echo ERROR: Archive creation failed
        echo Make sure the directory exists in the repository
        pause
        exit /b 1
    ) else (
        echo Archive created: !ARCHIVE_NAME!
    )

) else if "%CHOICE%"=="8" (
    echo.
    echo Latest tags:
    git tag -l "v*" --sort=-version:refname | powershell -Command "$input | Select-Object -First 5"
    echo.
    
    set /p "VERSION=Enter version for release (e.g., 1.0.0): "
    if "!VERSION!"=="" (
        echo ERROR: Version required
        pause
        exit /b 1
    )
    
    set "ARCHIVE_NAME=%REPO_NAME%-v!VERSION!.zip"
    echo.
    echo Creating release archive: !ARCHIVE_NAME!
    git archive --format=zip --prefix="%REPO_NAME%-!VERSION!/" -o "!ARCHIVE_NAME!" HEAD
    
    if errorlevel 1 (
        echo ERROR: Archive creation failed
        pause
        exit /b 1
    ) else (
        echo.
        echo Release archive created: !ARCHIVE_NAME!
        
        REM Create SHA256 checksum
        echo Creating checksum...
        certutil -hashfile "!ARCHIVE_NAME!" SHA256 > "!ARCHIVE_NAME!.sha256" 2>nul
        if not errorlevel 1 (
            echo Checksum file: !ARCHIVE_NAME!.sha256
        )
    )

) else if "%CHOICE%"=="9" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
    pause
    exit /b 1
)

echo.
pause
