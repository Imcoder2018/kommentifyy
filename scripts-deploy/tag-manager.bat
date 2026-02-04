@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Tag Manager
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    echo Please run init-repo.bat first
    pause
    exit /b 1
)

echo Current tags (latest 10):
echo.
git tag -l --sort=-version:refname -n1 2>nul | powershell -Command "$input | Select-Object -First 10"
echo.

echo Select action:
echo.
echo [1] Create lightweight tag
echo [2] Create annotated tag (recommended)
echo [3] Create signed tag (requires GPG)
echo [4] Delete local tag
echo [5] Delete remote tag
echo [6] Push tag to remote
echo [7] Push all tags to remote
echo [8] Show tag details
echo [9] List tags matching pattern
echo [10] Create release tag (with version)
echo [11] Checkout tag
echo [12] Cancel
echo.
set /p "CHOICE=Enter choice (1-12): "

if "%CHOICE%"=="1" (
    set /p "TAG_NAME=Enter tag name: "
    if "!TAG_NAME!"=="" (
        echo ERROR: Tag name cannot be empty
        pause
        exit /b 1
    )
    
    git tag !TAG_NAME!
    if errorlevel 1 (
        echo ERROR: Failed to create tag
        echo Tag might already exist.
        pause
        exit /b 1
    ) else (
        echo Tag '!TAG_NAME!' created successfully!
    )

) else if "%CHOICE%"=="2" (
    set /p "TAG_NAME=Enter tag name: "
    if "!TAG_NAME!"=="" (
        echo ERROR: Tag name cannot be empty
        pause
        exit /b 1
    )
    
    set /p "TAG_MSG=Enter tag message: "
    if "!TAG_MSG!"=="" set "TAG_MSG=Tag !TAG_NAME!"
    
    git tag -a !TAG_NAME! -m "!TAG_MSG!"
    if errorlevel 1 (
        echo ERROR: Failed to create tag
        pause
        exit /b 1
    ) else (
        echo Annotated tag '!TAG_NAME!' created successfully!
    )

) else if "%CHOICE%"=="3" (
    set /p "TAG_NAME=Enter tag name: "
    if "!TAG_NAME!"=="" (
        echo ERROR: Tag name cannot be empty
        pause
        exit /b 1
    )
    
    set /p "TAG_MSG=Enter tag message: "
    if "!TAG_MSG!"=="" set "TAG_MSG=Tag !TAG_NAME!"
    
    git tag -s !TAG_NAME! -m "!TAG_MSG!"
    if errorlevel 1 (
        echo ERROR: Failed to create signed tag
        echo Make sure you have GPG configured
        pause
        exit /b 1
    ) else (
        echo Signed tag '!TAG_NAME!' created successfully!
    )

) else if "%CHOICE%"=="4" (
    set /p "TAG_NAME=Enter tag name to delete: "
    if "!TAG_NAME!"=="" (
        echo ERROR: Tag name cannot be empty
        pause
        exit /b 1
    )
    
    set /p "CONFIRM=Delete local tag '!TAG_NAME!'? (Y/N): "
    if /i "!CONFIRM!"=="Y" (
        git tag -d !TAG_NAME!
        if errorlevel 1 (
            echo ERROR: Failed to delete tag
            echo Tag might not exist.
        ) else (
            echo Tag '!TAG_NAME!' deleted locally!
        )
    ) else (
        echo Operation cancelled.
    )

) else if "%CHOICE%"=="5" (
    set /p "TAG_NAME=Enter tag name to delete from remote: "
    if "!TAG_NAME!"=="" (
        echo ERROR: Tag name cannot be empty
        pause
        exit /b 1
    )
    
    set /p "CONFIRM=Delete REMOTE tag '!TAG_NAME!'? (Y/N): "
    if /i "!CONFIRM!"=="Y" (
        git push origin --delete !TAG_NAME!
        if errorlevel 1 (
            echo ERROR: Failed to delete remote tag
        ) else (
            echo Tag '!TAG_NAME!' deleted from remote!
        )
    ) else (
        echo Operation cancelled.
    )

) else if "%CHOICE%"=="6" (
    set /p "TAG_NAME=Enter tag name to push: "
    if "!TAG_NAME!"=="" (
        echo ERROR: Tag name cannot be empty
        pause
        exit /b 1
    )
    
    git push origin !TAG_NAME!
    if errorlevel 1 (
        echo ERROR: Failed to push tag
    ) else (
        echo Tag '!TAG_NAME!' pushed to remote!
    )

) else if "%CHOICE%"=="7" (
    set /p "CONFIRM=Push ALL tags to remote? (Y/N): "
    if /i "!CONFIRM!"=="Y" (
        git push origin --tags
        if errorlevel 1 (
            echo ERROR: Failed to push tags
        ) else (
            echo All tags pushed to remote!
        )
    ) else (
        echo Operation cancelled.
    )

) else if "%CHOICE%"=="8" (
    set /p "TAG_NAME=Enter tag name to view: "
    if "!TAG_NAME!"=="" (
        echo ERROR: Tag name cannot be empty
        pause
        exit /b 1
    )
    
    echo.
    echo Tag details for '!TAG_NAME!':
    echo ========================================
    git show !TAG_NAME!

) else if "%CHOICE%"=="9" (
    set /p "PATTERN=Enter pattern (e.g., v1.*): "
    echo.
    echo Tags matching '!PATTERN!':
    echo ========================================
    git tag -l "!PATTERN!"

) else if "%CHOICE%"=="10" (
    echo.
    echo Current version tags:
    git tag -l "v*" --sort=-version:refname 2>nul | powershell -Command "$input | Select-Object -First 5"
    echo.
    
    set /p "VERSION=Enter version (e.g., 1.0.0): "
    if "!VERSION!"=="" (
        echo ERROR: Version cannot be empty
        pause
        exit /b 1
    )
    
    set "TAG_NAME=v!VERSION!"
    set /p "TAG_MSG=Enter release notes: "
    if "!TAG_MSG!"=="" set "TAG_MSG=Release version !VERSION!"
    
    git tag -a !TAG_NAME! -m "!TAG_MSG!"
    if errorlevel 1 (
        echo ERROR: Failed to create release tag
        pause
        exit /b 1
    ) else (
        echo Release tag '!TAG_NAME!' created successfully!
        
        set /p "PUSH_TAG=Push tag to remote? (Y/N): "
        if /i "!PUSH_TAG!"=="Y" (
            git push origin !TAG_NAME!
            echo Tag pushed to remote!
        )
    )

) else if "%CHOICE%"=="11" (
    set /p "TAG_NAME=Enter tag to checkout: "
    if "!TAG_NAME!"=="" (
        echo ERROR: Tag name cannot be empty
        pause
        exit /b 1
    )
    
    echo.
    echo WARNING: This will put you in detached HEAD state
    set /p "CONFIRM=Continue? (Y/N): "
    if /i "!CONFIRM!"=="Y" (
        git checkout !TAG_NAME!
        if errorlevel 1 (
            echo ERROR: Failed to checkout tag
        ) else (
            echo Now at tag '!TAG_NAME!'
            echo To create a branch from here: git checkout -b branch-name
        )
    ) else (
        echo Operation cancelled.
    )

) else if "%CHOICE%"=="12" (
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
