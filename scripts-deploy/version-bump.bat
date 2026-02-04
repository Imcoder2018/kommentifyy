@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Semantic Version Manager
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

REM Try to get current version from tags
for /f "delims=" %%v in ('git describe --tags --abbrev=0 2^>nul') do set "CURRENT_TAG=%%v"

if "%CURRENT_TAG%"=="" (
    set "CURRENT_VERSION=0.0.0"
    echo No version tags found. Starting from v0.0.0
) else (
    set "CURRENT_VERSION=%CURRENT_TAG:v=%"
    echo Current version: %CURRENT_TAG%
)

echo.

REM Parse version components
for /f "tokens=1,2,3 delims=." %%a in ("%CURRENT_VERSION%") do (
    set "MAJOR=%%a"
    set "MINOR=%%b"
    set "PATCH=%%c"
)

REM Handle missing components
if "%MAJOR%"=="" set "MAJOR=0"
if "%MINOR%"=="" set "MINOR=0"
if "%PATCH%"=="" set "PATCH=0"

REM Calculate new versions
set /a "NEW_PATCH=%PATCH%+1"
set /a "NEW_MINOR=%MINOR%+1"
set /a "NEW_MAJOR=%MAJOR%+1"

echo Select version bump type:
echo.
echo [1] Patch  (%MAJOR%.%MINOR%.%PATCH% -^> %MAJOR%.%MINOR%.%NEW_PATCH%)
echo     Bug fixes, small changes
echo.
echo [2] Minor  (%MAJOR%.%MINOR%.%PATCH% -^> %MAJOR%.%NEW_MINOR%.0)
echo     New features, backwards compatible
echo.
echo [3] Major  (%MAJOR%.%MINOR%.%PATCH% -^> %NEW_MAJOR%.0.0)
echo     Breaking changes
echo.
echo [4] Custom version
echo.
echo [5] Pre-release version (alpha/beta/rc)
echo.
echo [6] View version history
echo.
echo [7] Cancel
echo.
set /p "CHOICE=Enter choice (1-7): "

if "%CHOICE%"=="1" (
    set "NEW_VERSION=%MAJOR%.%MINOR%.%NEW_PATCH%"
) else if "%CHOICE%"=="2" (
    set "NEW_VERSION=%MAJOR%.%NEW_MINOR%.0"
) else if "%CHOICE%"=="3" (
    set "NEW_VERSION=%NEW_MAJOR%.0.0"
) else if "%CHOICE%"=="4" (
    set /p "NEW_VERSION=Enter custom version (x.y.z): "
    if "!NEW_VERSION!"=="" (
        echo ERROR: Version cannot be empty
        pause
        exit /b 1
    )
) else if "%CHOICE%"=="5" (
    echo.
    echo Pre-release type:
    echo [a] Alpha (e.g., 1.0.0-alpha.1)
    echo [b] Beta  (e.g., 1.0.0-beta.1)
    echo [c] RC    (e.g., 1.0.0-rc.1)
    set /p "PRE_TYPE=Enter choice (a/b/c): "
    
    set /p "PRE_NUM=Enter pre-release number: "
    if "!PRE_NUM!"=="" set "PRE_NUM=1"
    
    if /i "!PRE_TYPE!"=="a" (
        set "NEW_VERSION=%MAJOR%.%MINOR%.%NEW_PATCH%-alpha.!PRE_NUM!"
    ) else if /i "!PRE_TYPE!"=="b" (
        set "NEW_VERSION=%MAJOR%.%MINOR%.%NEW_PATCH%-beta.!PRE_NUM!"
    ) else if /i "!PRE_TYPE!"=="c" (
        set "NEW_VERSION=%MAJOR%.%MINOR%.%NEW_PATCH%-rc.!PRE_NUM!"
    ) else (
        echo Invalid pre-release type
        pause
        exit /b 1
    )
) else if "%CHOICE%"=="6" (
    echo.
    echo Version History:
    echo ========================================
    git tag -l "v*" --sort=-version:refname
    echo.
    pause
    exit /b 0
) else if "%CHOICE%"=="7" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
    pause
    exit /b 1
)

echo.
echo New version will be: v%NEW_VERSION%
echo.

REM Check if package.json exists and offer to update
if exist "package.json" (
    echo Found package.json
    set /p "UPDATE_PKG=Update version in package.json? (Y/N): "
    if /i "!UPDATE_PKG!"=="Y" (
        echo Updating package.json...
        REM Use PowerShell to update package.json
        powershell -Command "(Get-Content package.json) -replace '\"version\": \"[^\"]*\"', '\"version\": \"%NEW_VERSION%\"' | Set-Content package.json"
        echo package.json updated!
        git add package.json
    )
)

REM Check for other version files
if exist "version.txt" (
    echo Found version.txt
    set /p "UPDATE_VER=Update version.txt? (Y/N): "
    if /i "!UPDATE_VER!"=="Y" (
        echo %NEW_VERSION%> version.txt
        git add version.txt
        echo version.txt updated!
    )
)

if exist "VERSION" (
    echo Found VERSION file
    set /p "UPDATE_VER=Update VERSION file? (Y/N): "
    if /i "!UPDATE_VER!"=="Y" (
        echo %NEW_VERSION%> VERSION
        git add VERSION
        echo VERSION updated!
    )
)

echo.
set /p "RELEASE_NOTES=Enter release notes (or press Enter for default): "
if "%RELEASE_NOTES%"=="" set "RELEASE_NOTES=Release version %NEW_VERSION%"

echo.
echo Creating version commit and tag...

REM Commit version changes if any
git diff --cached --quiet
if errorlevel 1 (
    git commit -m "Bump version to %NEW_VERSION%"
)

REM Create annotated tag
git tag -a "v%NEW_VERSION%" -m "%RELEASE_NOTES%"

if errorlevel 1 (
    echo ERROR: Failed to create tag
    pause
    exit /b 1
)

echo.
echo ========================================
echo Version bumped to v%NEW_VERSION%
echo ========================================
echo.

set /p "PUSH_NOW=Push version tag to remote? (Y/N): "
if /i "%PUSH_NOW%"=="Y" (
    git push origin "v%NEW_VERSION%"
    git push
    echo.
    echo Version pushed to remote!
)

echo.
echo Summary:
echo   Previous version: v%CURRENT_VERSION%
echo   New version:      v%NEW_VERSION%
echo   Release notes:    %RELEASE_NOTES%
echo.
pause
