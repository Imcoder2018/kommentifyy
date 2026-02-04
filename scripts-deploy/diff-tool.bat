@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Diff Tool
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

echo Select diff type:
echo.
echo === Working Directory ===
echo [1] Show unstaged changes
echo [2] Show staged changes
echo [3] Show all changes (staged + unstaged)
echo.
echo === Between Commits/Branches ===
echo [4] Diff between two commits
echo [5] Diff between two branches
echo [6] Diff current branch with another
echo [7] Diff with remote branch
echo.
echo === File Specific ===
echo [8] Diff specific file
echo [9] Diff file between commits
echo [10] Word diff (inline changes)
echo.
echo === Statistics ===
echo [11] Show diff statistics only
echo [12] Show changed files only
echo [13] Show diff summary
echo.
echo === Tools ===
echo [14] Configure external diff tool
echo [15] Launch external diff tool
echo [16] Cancel
echo.
set /p "CHOICE=Enter choice (1-16): "

if "%CHOICE%"=="1" (
    echo.
    echo Unstaged changes:
    echo ========================================
    git diff
    echo ========================================

) else if "%CHOICE%"=="2" (
    echo.
    echo Staged changes:
    echo ========================================
    git diff --staged
    echo ========================================

) else if "%CHOICE%"=="3" (
    echo.
    echo All changes:
    echo ========================================
    git diff HEAD
    echo ========================================

) else if "%CHOICE%"=="4" (
    echo.
    echo Recent commits:
    git log --oneline -15
    echo.
    
    set /p "COMMIT1=Enter first commit hash: "
    set /p "COMMIT2=Enter second commit hash: "
    
    if "!COMMIT1!"=="" (
        echo ERROR: First commit required
        pause
        exit /b 1
    )
    if "!COMMIT2!"=="" (
        echo ERROR: Second commit required
        pause
        exit /b 1
    )
    
    echo.
    echo Diff between !COMMIT1! and !COMMIT2!:
    echo ========================================
    git diff !COMMIT1! !COMMIT2!
    echo ========================================

) else if "%CHOICE%"=="5" (
    echo.
    echo Available branches:
    git branch -a
    echo.
    
    set /p "BRANCH1=Enter first branch: "
    set /p "BRANCH2=Enter second branch: "
    
    if "!BRANCH1!"=="" (
        echo ERROR: First branch required
        pause
        exit /b 1
    )
    if "!BRANCH2!"=="" (
        echo ERROR: Second branch required
        pause
        exit /b 1
    )
    
    echo.
    echo Diff between !BRANCH1! and !BRANCH2!:
    echo ========================================
    git diff !BRANCH1!..!BRANCH2!
    echo ========================================

) else if "%CHOICE%"=="6" (
    for /f "delims=" %%b in ('git branch --show-current 2^>nul') do set "CURRENT=%%b"
    echo.
    echo Current branch: !CURRENT!
    echo.
    echo Available branches:
    git branch
    echo.
    
    set /p "OTHER_BRANCH=Enter branch to compare with: "
    if "!OTHER_BRANCH!"=="" (
        echo ERROR: Branch required
        pause
        exit /b 1
    )
    
    echo.
    echo Changes in !CURRENT! compared to !OTHER_BRANCH!:
    echo ========================================
    git diff !OTHER_BRANCH!..!CURRENT!
    echo ========================================

) else if "%CHOICE%"=="7" (
    for /f "delims=" %%b in ('git branch --show-current 2^>nul') do set "CURRENT=%%b"
    echo.
    echo Fetching remote changes...
    git fetch origin
    
    echo.
    echo Diff with origin/!CURRENT!:
    echo ========================================
    git diff origin/!CURRENT!
    echo ========================================

) else if "%CHOICE%"=="8" (
    echo.
    set /p "FILE_PATH=Enter file path: "
    if "!FILE_PATH!"=="" (
        echo ERROR: File path required
        pause
        exit /b 1
    )
    
    echo.
    echo Diff for !FILE_PATH!:
    echo ========================================
    git diff -- "!FILE_PATH!"
    echo ========================================

) else if "%CHOICE%"=="9" (
    echo.
    echo Recent commits:
    git log --oneline -15
    echo.
    
    set /p "COMMIT1=Enter first commit: "
    set /p "COMMIT2=Enter second commit (Enter for HEAD): "
    if "!COMMIT2!"=="" set "COMMIT2=HEAD"
    
    set /p "FILE_PATH=Enter file path: "
    
    echo.
    echo Diff of !FILE_PATH! between !COMMIT1! and !COMMIT2!:
    echo ========================================
    git diff !COMMIT1! !COMMIT2! -- "!FILE_PATH!"
    echo ========================================

) else if "%CHOICE%"=="10" (
    echo.
    echo Word-level diff (shows inline changes):
    echo ========================================
    git diff --word-diff
    echo ========================================

) else if "%CHOICE%"=="11" (
    echo.
    echo Diff Statistics:
    echo ========================================
    git diff --stat
    echo.
    echo Staged:
    git diff --staged --stat
    echo ========================================

) else if "%CHOICE%"=="12" (
    echo.
    echo Changed files:
    echo ========================================
    echo.
    echo Unstaged:
    git diff --name-only
    echo.
    echo Staged:
    git diff --staged --name-only
    echo ========================================

) else if "%CHOICE%"=="13" (
    echo.
    echo Diff Summary:
    echo ========================================
    git diff --summary
    echo ========================================

) else if "%CHOICE%"=="14" (
    echo.
    echo Configure external diff tool
    echo.
    echo Common diff tools:
    echo [1] VS Code
    echo [2] Beyond Compare
    echo [3] KDiff3
    echo [4] WinMerge
    echo [5] Meld
    echo [6] Custom
    echo.
    set /p "TOOL_CHOICE=Select tool (1-6): "
    
    if "!TOOL_CHOICE!"=="1" (
        git config --global diff.tool vscode
        git config --global difftool.vscode.cmd "code --wait --diff $LOCAL $REMOTE"
        echo VS Code configured as diff tool!
    ) else if "!TOOL_CHOICE!"=="2" (
        git config --global diff.tool bc
        echo Beyond Compare configured!
    ) else if "!TOOL_CHOICE!"=="3" (
        git config --global diff.tool kdiff3
        echo KDiff3 configured!
    ) else if "!TOOL_CHOICE!"=="4" (
        git config --global diff.tool winmerge
        git config --global difftool.winmerge.cmd "'C:/Program Files/WinMerge/WinMergeU.exe' -e -u $LOCAL $REMOTE"
        echo WinMerge configured!
    ) else if "!TOOL_CHOICE!"=="5" (
        git config --global diff.tool meld
        echo Meld configured!
    ) else if "!TOOL_CHOICE!"=="6" (
        set /p "TOOL_NAME=Enter tool name: "
        set /p "TOOL_CMD=Enter tool command: "
        git config --global diff.tool !TOOL_NAME!
        git config --global difftool.!TOOL_NAME!.cmd "!TOOL_CMD!"
        echo Custom tool configured!
    )
    
    git config --global difftool.prompt false
    echo Diff tool prompt disabled.

) else if "%CHOICE%"=="15" (
    echo.
    echo Launching external diff tool...
    git difftool

) else if "%CHOICE%"=="16" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
pause
