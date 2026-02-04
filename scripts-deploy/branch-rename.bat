@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Branch Rename Utility
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"
echo Current branch: %CURRENT_BRANCH%
echo.

echo Available branches:
git branch
echo.

echo Select action:
echo.
echo [1] Rename current branch
echo [2] Rename specific branch
echo [3] Rename and update remote
echo [4] Cancel
echo.
set /p "CHOICE=Enter choice (1-4): "

if "%CHOICE%"=="1" (
    echo.
    echo Current branch: %CURRENT_BRANCH%
    set /p "NEW_NAME=Enter new name: "
    
    if "!NEW_NAME!"=="" (
        echo ERROR: New name required
        pause
        exit /b 1
    )
    
    git branch -m "!NEW_NAME!"
    
    if errorlevel 1 (
        echo ERROR: Failed to rename branch
    ) else (
        echo Branch renamed to: !NEW_NAME!
        
        echo.
        set /p "UPDATE_REMOTE=Update remote tracking? (Y/N): "
        if /i "!UPDATE_REMOTE!"=="Y" (
            echo.
            echo Pushing new branch name to remote...
            git push origin -u "!NEW_NAME!"
            
            echo.
            echo Deleting old branch from remote...
            git push origin --delete "%CURRENT_BRANCH%" 2>nul
            
            echo Remote updated!
        )
    )

) else if "%CHOICE%"=="2" (
    echo.
    echo Available branches:
    git branch
    echo.
    
    set /p "OLD_NAME=Enter branch to rename: "
    set /p "NEW_NAME=Enter new name: "
    
    if "!OLD_NAME!"=="" (
        echo ERROR: Old name required
        pause
        exit /b 1
    )
    if "!NEW_NAME!"=="" (
        echo ERROR: New name required
        pause
        exit /b 1
    )
    
    if "!OLD_NAME!"=="%CURRENT_BRANCH%" (
        git branch -m "!NEW_NAME!"
    ) else (
        git branch -m "!OLD_NAME!" "!NEW_NAME!"
    )
    
    if errorlevel 1 (
        echo ERROR: Failed to rename branch
    ) else (
        echo Branch renamed from !OLD_NAME! to !NEW_NAME!
    )

) else if "%CHOICE%"=="3" (
    echo.
    echo This will rename a branch both locally and on remote.
    echo.
    
    echo Available branches:
    git branch
    echo.
    
    set /p "OLD_NAME=Enter branch to rename (Enter for current): "
    if "!OLD_NAME!"=="" set "OLD_NAME=%CURRENT_BRANCH%"
    
    set /p "NEW_NAME=Enter new name: "
    if "!NEW_NAME!"=="" (
        echo ERROR: New name required
        pause
        exit /b 1
    )
    
    echo.
    echo This will:
    echo 1. Rename local branch !OLD_NAME! to !NEW_NAME!
    echo 2. Push !NEW_NAME! to remote
    echo 3. Delete !OLD_NAME! from remote
    echo.
    
    set /p "CONFIRM=Continue? (Y/N): "
    if /i "!CONFIRM!"=="Y" (
        echo.
        echo Step 1: Renaming local branch...
        if "!OLD_NAME!"=="%CURRENT_BRANCH%" (
            git branch -m "!NEW_NAME!"
        ) else (
            git branch -m "!OLD_NAME!" "!NEW_NAME!"
        )
        
        if errorlevel 1 (
            echo ERROR: Failed to rename local branch
            pause
            exit /b 1
        )
        echo Local branch renamed!
        
        echo.
        echo Step 2: Pushing new branch to remote...
        git push origin "!NEW_NAME!" -u
        
        if errorlevel 1 (
            echo ERROR: Failed to push new branch
        ) else (
            echo New branch pushed!
        )
        
        echo.
        echo Step 3: Deleting old branch from remote...
        git push origin --delete "!OLD_NAME!" 2>nul
        
        if errorlevel 1 (
            echo WARNING: Could not delete old branch from remote
            echo It may not exist on remote, or you may lack permissions.
        ) else (
            echo Old branch deleted from remote!
        )
        
        echo.
        echo Branch rename complete!
        echo New branch: !NEW_NAME!
    )

) else if "%CHOICE%"=="4" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
echo Current branches:
git branch
echo.
pause
