@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Deployment Rollback Utility
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

echo Recent deployment tags:
echo ========================================
echo Production tags:
git tag -l "prod-*" --sort=-version:refname 2>nul | powershell -Command "$input | Select-Object -First 10"
echo.
echo Release tags:
git tag -l "v*" --sort=-version:refname 2>nul | powershell -Command "$input | Select-Object -First 5"
echo ========================================
echo.

echo Select rollback type:
echo.
echo [1] Rollback to previous deployment tag
echo [2] Rollback to specific tag
echo [3] Rollback to specific commit
echo [4] Create rollback branch
echo [5] Revert last deployment commit
echo [6] Emergency hotfix deployment
echo [7] View deployment history
echo [8] Compare current with previous deployment
echo [9] Cancel
echo.
set /p "CHOICE=Enter choice (1-9): "

if "%CHOICE%"=="1" (
    echo.
    echo Finding previous deployment tag...
    
    for /f "skip=1 tokens=*" %%t in ('git tag -l "prod-*" --sort=-version:refname 2^>nul') do (
        set "PREV_TAG=%%t"
        goto :found_prev_tag
    )
    :found_prev_tag
    
    if "!PREV_TAG!"=="" (
        echo ERROR: No previous deployment tag found
        pause
        exit /b 1
    )
    
    echo Previous deployment: !PREV_TAG!
    echo.
    
    echo Changes that will be reverted:
    git log !PREV_TAG!..HEAD --oneline
    echo.
    
    set /p "CONFIRM=Rollback to !PREV_TAG!? (YES to confirm): "
    if /i "!CONFIRM!"=="YES" (
        echo.
        echo Creating backup of current state...
        for /f "delims=" %%d in ('powershell -Command "Get-Date -Format \"yyyyMMdd-HHmm\""') do set "TIMESTAMP=%%d"
        set "BACKUP_TAG=pre-rollback-!TIMESTAMP!"
        git tag "!BACKUP_TAG!" -m "Backup before rollback"
        echo Backup created: !BACKUP_TAG!
        
        echo.
        echo Rolling back to !PREV_TAG!...
        git reset --hard !PREV_TAG!
        
        if errorlevel 1 (
            echo ERROR: Rollback failed
        ) else (
            echo.
            echo Rollback successful!
            echo.
            set /p "PUSH_NOW=Force push to remote? (YES to confirm): "
            if /i "!PUSH_NOW!"=="YES" (
                git push --force origin %CURRENT_BRANCH%
                echo Remote updated!
            )
        )
    ) else (
        echo Rollback cancelled.
    )

) else if "%CHOICE%"=="2" (
    echo.
    echo Available tags:
    git tag -l --sort=-version:refname | powershell -Command "$input | Select-Object -First 20"
    echo.
    
    set /p "TARGET_TAG=Enter tag to rollback to: "
    if "!TARGET_TAG!"=="" (
        echo ERROR: Tag name required
        pause
        exit /b 1
    )
    
    git rev-parse "!TARGET_TAG!" >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Tag not found
        pause
        exit /b 1
    )
    
    echo.
    echo Changes that will be reverted:
    git log !TARGET_TAG!..HEAD --oneline
    echo.
    
    set /p "CONFIRM=Rollback to !TARGET_TAG!? (YES to confirm): "
    if /i "!CONFIRM!"=="YES" (
        echo.
        echo Creating backup...
        for /f "delims=" %%d in ('powershell -Command "Get-Date -Format \"yyyyMMdd-HHmm\""') do set "TIMESTAMP=%%d"
        set "BACKUP_TAG=pre-rollback-!TIMESTAMP!"
        git tag "!BACKUP_TAG!" -m "Backup before rollback to !TARGET_TAG!"
        
        git reset --hard !TARGET_TAG!
        echo Rollback complete!
    )

) else if "%CHOICE%"=="3" (
    echo.
    echo Recent commits:
    git log --oneline -20
    echo.
    
    set /p "TARGET_COMMIT=Enter commit hash to rollback to: "
    if "!TARGET_COMMIT!"=="" (
        echo ERROR: Commit hash required
        pause
        exit /b 1
    )
    
    git rev-parse "!TARGET_COMMIT!" >nul 2>&1
    if errorlevel 1 (
        echo ERROR: Commit not found
        pause
        exit /b 1
    )
    
    echo.
    set /p "CONFIRM=Rollback to !TARGET_COMMIT!? (YES to confirm): "
    if /i "!CONFIRM!"=="YES" (
        for /f "delims=" %%d in ('powershell -Command "Get-Date -Format \"yyyyMMdd\""') do set "DATE=%%d"
        git tag "pre-rollback-!DATE!" -m "Backup before commit rollback"
        
        git reset --hard !TARGET_COMMIT!
        echo Rollback complete!
    )

) else if "%CHOICE%"=="4" (
    echo.
    echo Creating rollback branch...
    echo.
    
    git tag -l "prod-*" --sort=-version:refname | powershell -Command "$input | Select-Object -First 5"
    echo.
    
    set /p "TARGET_TAG=Enter tag to create branch from: "
    set /p "BRANCH_NAME=Enter new branch name (default: rollback-branch): "
    if "!BRANCH_NAME!"=="" set "BRANCH_NAME=rollback-branch"
    
    git checkout -b !BRANCH_NAME! !TARGET_TAG!
    
    if errorlevel 1 (
        echo ERROR: Failed to create rollback branch
    ) else (
        echo.
        echo Rollback branch created: !BRANCH_NAME!
        echo You can now test this version before deploying.
    )

) else if "%CHOICE%"=="5" (
    echo.
    echo Last commit:
    git log -1 --oneline
    echo.
    
    set /p "CONFIRM=Create revert commit for last deployment? (Y/N): "
    if /i "!CONFIRM!"=="Y" (
        git revert HEAD --no-edit
        
        if errorlevel 1 (
            echo ERROR: Revert failed (possibly conflicts)
            echo Use: git revert --abort to cancel
        ) else (
            echo.
            echo Revert commit created!
            set /p "PUSH_NOW=Push revert to remote? (Y/N): "
            if /i "!PUSH_NOW!"=="Y" (
                git push
                echo Revert pushed!
            )
        )
    )

) else if "%CHOICE%"=="6" (
    echo.
    echo ========================================
    echo    EMERGENCY HOTFIX DEPLOYMENT
    echo ========================================
    echo.
    
    echo This will:
    echo 1. Create hotfix branch from last production tag
    echo 2. Allow you to make emergency fixes
    echo 3. Deploy directly to production
    echo.
    
    for /f "delims=" %%t in ('git tag -l "prod-*" --sort=-version:refname 2^>nul') do (
        set "LAST_PROD=%%t"
        goto :found_prod
    )
    :found_prod
    
    if "!LAST_PROD!"=="" (
        echo No production tags found. Using current HEAD.
        set "LAST_PROD=HEAD"
    ) else (
        echo Last production: !LAST_PROD!
    )
    
    set /p "CONFIRM=Create hotfix branch from !LAST_PROD!? (Y/N): "
    if /i "!CONFIRM!"=="Y" (
        for /f "delims=" %%d in ('powershell -Command "Get-Date -Format \"yyyyMMdd-HHmm\""') do set "TIMESTAMP=%%d"
        set "HOTFIX_BRANCH=hotfix/!TIMESTAMP!"
        
        git checkout -b !HOTFIX_BRANCH! !LAST_PROD!
        
        echo.
        echo Hotfix branch created: !HOTFIX_BRANCH!
        echo.
        echo Make your fixes, then:
        echo 1. Commit with: git commit -m "[HOTFIX] description"
        echo 2. Push with: git push -u origin !HOTFIX_BRANCH!
        echo 3. Merge to production when ready
    )

) else if "%CHOICE%"=="7" (
    echo.
    echo Deployment History:
    echo ========================================
    echo.
    echo Production Tags:
    git tag -l "prod-*" --sort=-version:refname | powershell -Command "$input | Select-Object -First 10"
    echo.
    echo Release Tags:
    git tag -l "v*" --sort=-version:refname | powershell -Command "$input | Select-Object -First 10"
    echo.
    echo Recent Production Commits:
    git log --oneline --grep="PROD" -10

) else if "%CHOICE%"=="8" (
    echo.
    for /f "delims=" %%t in ('git tag -l "prod-*" --sort=-version:refname 2^>nul') do (
        set "CURRENT_PROD=%%t"
        goto :got_current
    )
    :got_current
    
    for /f "skip=1 tokens=*" %%t in ('git tag -l "prod-*" --sort=-version:refname 2^>nul') do (
        set "PREV_PROD=%%t"
        goto :got_prev
    )
    :got_prev
    
    if "!PREV_PROD!"=="" (
        echo Not enough deployment tags to compare.
        pause
        exit /b 1
    )
    
    echo Comparing !PREV_PROD! with !CURRENT_PROD!
    echo ========================================
    echo.
    echo Commits added:
    git log !PREV_PROD!..!CURRENT_PROD! --oneline
    echo.
    echo Files changed:
    git diff --stat !PREV_PROD!..!CURRENT_PROD!

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
