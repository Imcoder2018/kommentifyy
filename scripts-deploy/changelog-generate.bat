@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Changelog Generator
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    echo Please run init-repo.bat first
    pause
    exit /b 1
)

echo Select changelog type:
echo.
echo [1] Generate from all commits
echo [2] Generate since last tag
echo [3] Generate between two tags
echo [4] Generate for specific date range
echo [5] Generate conventional changelog
echo [6] Append to existing CHANGELOG.md
echo [7] View current CHANGELOG.md
echo [8] Cancel
echo.
set /p "CHOICE=Enter choice (1-8): "

if "%CHOICE%"=="1" (
    echo.
    echo Generating full changelog...
    echo.
    
    (
        echo # Changelog
        echo.
        echo ## All Commits
        echo.
        for /f "delims=" %%c in ('git log --pretty^=format^:"- %%s (%%h) - %%an, %%ad" --date^=short') do (
            echo %%c
        )
    ) > CHANGELOG_NEW.md
    
    echo Changelog generated: CHANGELOG_NEW.md

) else if "%CHOICE%"=="2" (
    for /f "delims=" %%t in ('git describe --tags --abbrev=0 2^>nul') do set "LAST_TAG=%%t"
    
    if "!LAST_TAG!"=="" (
        echo No tags found. Using all commits.
        set "LAST_TAG="
    ) else (
        echo Last tag: !LAST_TAG!
    )
    
    echo.
    echo Generating changelog since !LAST_TAG!...
    echo.
    
    (
        echo # Changelog
        echo.
        echo ## Changes since !LAST_TAG!
        echo.
        if "!LAST_TAG!"=="" (
            for /f "delims=" %%c in ('git log --pretty^=format^:"- %%s (%%h)"') do echo %%c
        ) else (
            for /f "delims=" %%c in ('git log !LAST_TAG!..HEAD --pretty^=format^:"- %%s (%%h)"') do echo %%c
        )
    ) > CHANGELOG_NEW.md
    
    echo Changelog generated: CHANGELOG_NEW.md

) else if "%CHOICE%"=="3" (
    echo.
    echo Available tags:
    git tag -l --sort=-version:refname
    echo.
    
    set /p "FROM_TAG=Enter FROM tag: "
    set /p "TO_TAG=Enter TO tag (or HEAD): "
    
    if "!FROM_TAG!"=="" (
        echo ERROR: FROM tag required
        pause
        exit /b 1
    )
    if "!TO_TAG!"=="" set "TO_TAG=HEAD"
    
    echo.
    echo Generating changelog from !FROM_TAG! to !TO_TAG!...
    
    (
        echo # Changelog
        echo.
        echo ## Changes from !FROM_TAG! to !TO_TAG!
        echo.
        for /f "delims=" %%c in ('git log !FROM_TAG!..!TO_TAG! --pretty^=format^:"- %%s (%%h)"') do echo %%c
    ) > CHANGELOG_NEW.md
    
    echo Changelog generated: CHANGELOG_NEW.md

) else if "%CHOICE%"=="4" (
    echo.
    echo Enter dates in YYYY-MM-DD format
    set /p "FROM_DATE=From date: "
    set /p "TO_DATE=To date (or leave empty for now): "
    
    if "!FROM_DATE!"=="" (
        echo ERROR: From date required
        pause
        exit /b 1
    )
    
    echo.
    echo Generating changelog...
    
    (
        echo # Changelog
        echo.
        echo ## Changes from !FROM_DATE! to !TO_DATE!
        echo.
        if "!TO_DATE!"=="" (
            for /f "delims=" %%c in ('git log --since^="!FROM_DATE!" --pretty^=format^:"- %%s (%%h) - %%ad" --date^=short') do echo %%c
        ) else (
            for /f "delims=" %%c in ('git log --since^="!FROM_DATE!" --until^="!TO_DATE!" --pretty^=format^:"- %%s (%%h) - %%ad" --date^=short') do echo %%c
        )
    ) > CHANGELOG_NEW.md
    
    echo Changelog generated: CHANGELOG_NEW.md

) else if "%CHOICE%"=="5" (
    echo.
    echo Generating conventional changelog...
    echo (Groups commits by type: feat, fix, docs, etc.)
    echo.
    
    (
        echo # Changelog
        echo.
        echo ## Features
        echo.
        for /f "delims=" %%c in ('git log --grep^="^feat" --pretty^=format^:"- %%s (%%h)" 2^>nul') do echo %%c
        echo.
        echo ## Bug Fixes
        echo.
        for /f "delims=" %%c in ('git log --grep^="^fix" --pretty^=format^:"- %%s (%%h)" 2^>nul') do echo %%c
        echo.
        echo ## Documentation
        echo.
        for /f "delims=" %%c in ('git log --grep^="^docs" --pretty^=format^:"- %%s (%%h)" 2^>nul') do echo %%c
        echo.
        echo ## Other Changes
        echo.
        for /f "delims=" %%c in ('git log --pretty^=format^:"- %%s (%%h)" -20 2^>nul') do echo %%c
    ) > CHANGELOG_NEW.md
    
    echo Conventional changelog generated: CHANGELOG_NEW.md

) else if "%CHOICE%"=="6" (
    if not exist "CHANGELOG.md" (
        echo No existing CHANGELOG.md found. Creating new one.
    )
    
    for /f "delims=" %%t in ('git describe --tags --abbrev=0 2^>nul') do set "LAST_TAG=%%t"
    
    echo.
    echo Getting new version...
    set /p "NEW_VERSION=Enter version for this release: "
    
    for /f "delims=" %%d in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd\""') do set "TODAY=%%d"
    
    echo.
    echo Generating entries...
    
    (
        echo ## [!NEW_VERSION!] - %TODAY%
        echo.
        if not "!LAST_TAG!"=="" (
            for /f "delims=" %%c in ('git log !LAST_TAG!..HEAD --pretty^=format^:"- %%s"') do echo %%c
        ) else (
            for /f "delims=" %%c in ('git log --pretty^=format^:"- %%s" -20') do echo %%c
        )
        echo.
        echo.
        if exist "CHANGELOG.md" type CHANGELOG.md
    ) > CHANGELOG_TEMP.md
    
    move /Y CHANGELOG_TEMP.md CHANGELOG.md >nul
    echo.
    echo CHANGELOG.md updated!

) else if "%CHOICE%"=="7" (
    if exist "CHANGELOG.md" (
        echo.
        echo Contents of CHANGELOG.md:
        echo ========================================
        type CHANGELOG.md
        echo ========================================
    ) else (
        echo No CHANGELOG.md found in this repository.
    )
    pause
    exit /b 0

) else if "%CHOICE%"=="8" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
    pause
    exit /b 1
)

echo.
if exist "CHANGELOG_NEW.md" (
    echo Preview of generated changelog (first 30 lines):
    echo ========================================
    powershell -Command "Get-Content CHANGELOG_NEW.md | Select-Object -First 30"
    echo ========================================
    echo.
    set /p "RENAME=Rename to CHANGELOG.md? (Y/N): "
    if /i "!RENAME!"=="Y" (
        if exist "CHANGELOG.md" (
            set /p "OVERWRITE=CHANGELOG.md exists. Overwrite? (Y/N): "
            if /i "!OVERWRITE!"=="Y" (
                move /Y CHANGELOG_NEW.md CHANGELOG.md >nul
                echo Renamed to CHANGELOG.md
            )
        ) else (
            move /Y CHANGELOG_NEW.md CHANGELOG.md >nul
            echo Renamed to CHANGELOG.md
        )
    )
)

echo.
pause
