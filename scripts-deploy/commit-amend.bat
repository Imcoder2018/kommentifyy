@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Commit Amend Utility
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

echo Last commit:
echo ========================================
git log -1 --pretty=format:"Hash: %%H%%nAuthor: %%an <%%ae>%%nDate: %%ad%%nMessage: %%s%%n" --date=local
echo.
echo ========================================
echo.

echo Select amend action:
echo.
echo [1] Change commit message only
echo [2] Add more files to last commit (keep message)
echo [3] Add files AND change message
echo [4] Change author of last commit
echo [5] Change date of last commit
echo [6] Remove file from last commit
echo [7] Split last commit into multiple
echo [8] View what would be amended
echo [9] Cancel
echo.
set /p "CHOICE=Enter choice (1-9): "

if "%CHOICE%"=="1" (
    echo.
    echo Current message:
    git log -1 --format="%%s"
    echo.
    
    set /p "NEW_MSG=Enter new commit message: "
    if "!NEW_MSG!"=="" (
        echo ERROR: Message cannot be empty
        pause
        exit /b 1
    )
    
    git commit --amend -m "!NEW_MSG!"
    
    if errorlevel 1 (
        echo ERROR: Failed to amend commit
    ) else (
        echo.
        echo Commit message updated!
        echo.
        echo New commit:
        git log -1 --oneline
    )

) else if "%CHOICE%"=="2" (
    echo.
    echo Current changes:
    git status --short
    echo.
    
    echo Files to add (or 'all' for all changes):
    set /p "FILES=Files: "
    
    if /i "!FILES!"=="all" (
        git add .
    ) else (
        git add !FILES!
    )
    
    git commit --amend --no-edit
    
    if errorlevel 1 (
        echo ERROR: Failed to amend commit
    ) else (
        echo.
        echo Files added to last commit!
    )

) else if "%CHOICE%"=="3" (
    echo.
    echo Current changes:
    git status --short
    echo.
    
    echo Files to add (or 'all' for all changes):
    set /p "FILES=Files: "
    
    if /i "!FILES!"=="all" (
        git add .
    ) else (
        git add !FILES!
    )
    
    set /p "NEW_MSG=Enter new commit message: "
    if "!NEW_MSG!"=="" (
        echo ERROR: Message cannot be empty
        pause
        exit /b 1
    )
    
    git commit --amend -m "!NEW_MSG!"
    
    if errorlevel 1 (
        echo ERROR: Failed to amend commit
    ) else (
        echo.
        echo Commit amended with new files and message!
    )

) else if "%CHOICE%"=="4" (
    echo.
    echo Current author:
    git log -1 --format="%%an <%%ae>"
    echo.
    
    set /p "NEW_NAME=Enter new author name: "
    set /p "NEW_EMAIL=Enter new author email: "
    
    if "!NEW_NAME!"=="" (
        echo ERROR: Name cannot be empty
        pause
        exit /b 1
    )
    if "!NEW_EMAIL!"=="" (
        echo ERROR: Email cannot be empty
        pause
        exit /b 1
    )
    
    git commit --amend --author="!NEW_NAME! <!NEW_EMAIL!>" --no-edit
    
    if errorlevel 1 (
        echo ERROR: Failed to change author
    ) else (
        echo.
        echo Author changed successfully!
    )

) else if "%CHOICE%"=="5" (
    echo.
    echo Current date:
    git log -1 --format="%%ad" --date=local
    echo.
    
    echo Enter new date format: "Mon Jan 1 12:00 2024"
    set /p "NEW_DATE=New date: "
    
    if "!NEW_DATE!"=="" (
        echo ERROR: Date cannot be empty
        pause
        exit /b 1
    )
    
    set GIT_COMMITTER_DATE=!NEW_DATE!
    git commit --amend --date="!NEW_DATE!" --no-edit
    
    if errorlevel 1 (
        echo ERROR: Failed to change date
    ) else (
        echo.
        echo Date changed successfully!
    )

) else if "%CHOICE%"=="6" (
    echo.
    echo Files in last commit:
    git diff-tree --no-commit-id --name-only -r HEAD
    echo.
    
    set /p "REMOVE_FILE=Enter file to remove from commit: "
    if "!REMOVE_FILE!"=="" (
        echo ERROR: Filename cannot be empty
        pause
        exit /b 1
    )
    
    git reset HEAD^ -- "!REMOVE_FILE!"
    git commit --amend --no-edit
    
    if errorlevel 1 (
        echo ERROR: Failed to remove file from commit
    ) else (
        echo.
        echo File removed from commit!
        echo The file is now unstaged in your working directory.
    )

) else if "%CHOICE%"=="7" (
    echo.
    echo This will reset the last commit and let you make multiple commits.
    echo.
    set /p "CONFIRM=Continue? (Y/N): "
    if /i "!CONFIRM!"=="Y" (
        git reset HEAD^
        echo.
        echo Last commit has been reset.
        echo All changes are now unstaged.
        echo.
        echo Current status:
        git status --short
        echo.
        echo You can now stage and commit files separately.
    )

) else if "%CHOICE%"=="8" (
    echo.
    echo Last commit details:
    echo ========================================
    git show --stat HEAD
    echo.
    echo Staged changes that would be added:
    echo ========================================
    git diff --cached --stat

) else if "%CHOICE%"=="9" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
echo ========================================
echo WARNING: If you have already pushed this commit,
echo you will need to force push: git push --force
echo This can cause issues for collaborators!
echo ========================================
echo.
pause
