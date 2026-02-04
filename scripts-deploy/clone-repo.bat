@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Clone Repository
echo ========================================
echo.

REM Check network connectivity first
echo Checking network connectivity...
ping -n 1 github.com >nul 2>&1
if errorlevel 1 (
    echo WARNING: Network connectivity issues detected.
    echo Please check your internet connection.
    set /p "CONTINUE=Try anyway? (Y/N): "
    if /i not "!CONTINUE!"=="Y" (
        pause
        exit /b 1
    )
)
echo Network: OK
echo.

echo Enter repository URL to clone:
echo (Supports HTTPS and SSH URLs)
echo.
echo Examples:
echo   https://github.com/username/repo.git
echo   git@github.com:username/repo.git
echo.
set /p "REPO_URL=Repository URL: "

if "%REPO_URL%"=="" (
    echo ERROR: Repository URL cannot be empty
    pause
    exit /b 1
)

REM Validate URL format
echo %REPO_URL% | findstr /i "github.com gitlab.com bitbucket.org" >nul
if errorlevel 1 (
    echo %REPO_URL% | findstr /r "^https:// ^git@" >nul
    if errorlevel 1 (
        echo WARNING: URL format may not be valid
        set /p "CONTINUE=Continue anyway? (Y/N): "
        if /i not "!CONTINUE!"=="Y" (
            pause
            exit /b 1
        )
    )
)

echo.
set /p "TARGET_DIR=Enter target directory name (press Enter for auto): "

echo.
echo Clone options:
echo [1] Clone normally (full history)
echo [2] Clone with specific branch
echo [3] Shallow clone (latest commit only - faster)
echo [4] Shallow clone with depth
echo [5] Clone with submodules
echo [6] Mirror clone (for backup)
echo [7] Sparse checkout (specific folders only)
echo [8] Cancel
echo.
set /p "CLONE_TYPE=Enter choice (1-8): "

REM Check disk space (basic check)
echo.
echo Checking available disk space...
for /f "tokens=3" %%a in ('dir /-c "%CD%" ^| findstr "bytes free"') do set "FREE_SPACE=%%a"
echo Available space: %FREE_SPACE% bytes
echo.

if "%CLONE_TYPE%"=="1" (
    echo.
    echo Cloning repository...
    if "%TARGET_DIR%"=="" (
        git clone %REPO_URL%
    ) else (
        git clone %REPO_URL% "%TARGET_DIR%"
    )
    
) else if "%CLONE_TYPE%"=="2" (
    set /p "BRANCH_NAME=Enter branch name: "
    if "!BRANCH_NAME!"=="" (
        echo ERROR: Branch name cannot be empty
        pause
        exit /b 1
    )
    echo.
    echo Cloning repository (branch: !BRANCH_NAME!)...
    if "%TARGET_DIR%"=="" (
        git clone -b !BRANCH_NAME! %REPO_URL%
    ) else (
        git clone -b !BRANCH_NAME! %REPO_URL% "%TARGET_DIR%"
    )
    
) else if "%CLONE_TYPE%"=="3" (
    echo.
    echo Performing shallow clone (latest commit only)...
    if "%TARGET_DIR%"=="" (
        git clone --depth 1 %REPO_URL%
    ) else (
        git clone --depth 1 %REPO_URL% "%TARGET_DIR%"
    )
    
) else if "%CLONE_TYPE%"=="4" (
    set /p "DEPTH=Enter depth (number of commits): "
    if "!DEPTH!"=="" set "DEPTH=10"
    echo.
    echo Performing shallow clone (depth: !DEPTH!)...
    if "%TARGET_DIR%"=="" (
        git clone --depth !DEPTH! %REPO_URL%
    ) else (
        git clone --depth !DEPTH! %REPO_URL% "%TARGET_DIR%"
    )
    
) else if "%CLONE_TYPE%"=="5" (
    echo.
    echo Cloning repository with submodules...
    if "%TARGET_DIR%"=="" (
        git clone --recurse-submodules %REPO_URL%
    ) else (
        git clone --recurse-submodules %REPO_URL% "%TARGET_DIR%"
    )
    
) else if "%CLONE_TYPE%"=="6" (
    echo.
    echo Creating mirror clone (for backup)...
    if "%TARGET_DIR%"=="" (
        for %%F in ("%REPO_URL%") do set "REPO_NAME=%%~nF"
        set "TARGET_DIR=!REPO_NAME!.git"
    )
    git clone --mirror %REPO_URL% "%TARGET_DIR%"
    echo.
    echo Mirror created at: %TARGET_DIR%
    echo Note: This is a bare repository for backup purposes.
    pause
    exit /b 0
    
) else if "%CLONE_TYPE%"=="7" (
    echo.
    echo Sparse checkout allows cloning specific folders only.
    echo.
    
    if "%TARGET_DIR%"=="" (
        for %%F in ("%REPO_URL%") do set "REPO_NAME=%%~nF"
        set "REPO_NAME=!REPO_NAME:.git=!"
        set "TARGET_DIR=!REPO_NAME!"
    )
    
    echo Setting up sparse checkout...
    git clone --filter=blob:none --no-checkout %REPO_URL% "%TARGET_DIR%"
    cd "%TARGET_DIR%"
    git sparse-checkout init --cone
    
    echo.
    echo Enter folders to include (one per line, empty line to finish):
    :sparse_loop
    set /p "SPARSE_PATH=Folder: "
    if not "!SPARSE_PATH!"=="" (
        git sparse-checkout add "!SPARSE_PATH!"
        goto :sparse_loop
    )
    
    git checkout
    cd ..
    echo.
    echo Sparse checkout complete!
    pause
    exit /b 0
    
) else if "%CLONE_TYPE%"=="8" (
    echo Operation cancelled.
    pause
    exit /b 0
    
) else (
    echo Invalid choice.
    pause
    exit /b 1
)

if errorlevel 1 (
    echo.
    echo ERROR: Clone failed
    echo Please check:
    echo 1. Repository URL is correct
    echo 2. You have access to the repository
    echo 3. Internet connection is working
    echo 4. Git credentials are configured
    pause
    exit /b 1
)

echo.
echo ========================================
echo Repository cloned successfully!
echo ========================================
echo.

REM Get the cloned directory name
if "%TARGET_DIR%"=="" (
    for %%F in ("%REPO_URL%") do set "REPO_NAME=%%~nF"
    set "REPO_NAME=!REPO_NAME:.git=!"
) else (
    set "REPO_NAME=%TARGET_DIR%"
)

echo Cloned to: !REPO_NAME!
echo.

REM Log the operation
for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set "DATETIME=%%a"
set "LOG_DIR=%~dp0logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
echo [%DATETIME%] Clone: %REPO_URL% to !REPO_NAME! >> "%LOG_DIR%\operations.log"

set /p "OPEN_DIR=Open cloned directory? (Y/N): "
if /i "%OPEN_DIR%"=="Y" (
    if exist "!REPO_NAME!" (
        cd "!REPO_NAME!"
        echo.
        echo Repository information:
        echo.
        git remote -v
        echo.
        git branch -a
        echo.
        start .
    )
)

REM Ask about post-clone setup
echo.
set /p "INSTALL_DEPS=Run dependency installation if available? (Y/N): "
if /i "%INSTALL_DEPS%"=="Y" (
    cd "!REPO_NAME!"
    
    if exist "package.json" (
        echo Running npm install...
        npm install
    )
    
    if exist "requirements.txt" (
        echo Running pip install...
        pip install -r requirements.txt
    )
    
    if exist "Gemfile" (
        echo Running bundle install...
        bundle install
    )
    
    cd ..
)

pause
