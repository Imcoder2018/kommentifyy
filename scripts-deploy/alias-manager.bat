@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Alias Manager
echo ========================================
echo.

echo Current aliases:
echo ========================================
git config --global --get-regexp alias 2>nul
if errorlevel 1 echo No aliases configured.
echo ========================================
echo.

echo Select action:
echo.
echo [1] Add new alias
echo [2] Remove alias
echo [3] List all aliases
echo [4] Install recommended aliases
echo [5] Export aliases to file
echo [6] Import aliases from file
echo [7] Edit alias
echo [8] Test alias
echo [9] Cancel
echo.
set /p "CHOICE=Enter choice (1-9): "

if "%CHOICE%"=="1" (
    echo.
    echo Example aliases:
    echo   co = checkout
    echo   br = branch
    echo   st = status
    echo   lg = log --oneline --graph
    echo.
    
    set /p "ALIAS_NAME=Enter alias name: "
    if "!ALIAS_NAME!"=="" (
        echo ERROR: Alias name required
        pause
        exit /b 1
    )
    
    set /p "ALIAS_CMD=Enter command (without 'git'): "
    if "!ALIAS_CMD!"=="" (
        echo ERROR: Command required
        pause
        exit /b 1
    )
    
    git config --global alias.!ALIAS_NAME! "!ALIAS_CMD!"
    
    if errorlevel 1 (
        echo ERROR: Failed to create alias
    ) else (
        echo Alias created: git !ALIAS_NAME! = git !ALIAS_CMD!
    )

) else if "%CHOICE%"=="2" (
    echo.
    echo Current aliases:
    git config --global --get-regexp alias 2>nul
    echo.
    
    set /p "ALIAS_NAME=Enter alias name to remove: "
    if "!ALIAS_NAME!"=="" (
        echo ERROR: Alias name required
        pause
        exit /b 1
    )
    
    git config --global --unset alias.!ALIAS_NAME!
    
    if errorlevel 1 (
        echo ERROR: Failed to remove alias (may not exist)
    ) else (
        echo Alias removed: !ALIAS_NAME!
    )

) else if "%CHOICE%"=="3" (
    echo.
    echo All Git Aliases:
    echo ========================================
    git config --global --get-regexp alias 2>nul | sort
    echo ========================================
    echo.
    echo Usage: git ^<alias^>
    echo Example: git st (instead of git status)

) else if "%CHOICE%"=="4" (
    echo.
    echo Installing recommended aliases...
    echo.
    
    REM Basic shortcuts
    git config --global alias.co "checkout"
    echo   co = checkout
    
    git config --global alias.br "branch"
    echo   br = branch
    
    git config --global alias.ci "commit"
    echo   ci = commit
    
    git config --global alias.st "status"
    echo   st = status
    
    git config --global alias.df "diff"
    echo   df = diff
    
    git config --global alias.dfs "diff --staged"
    echo   dfs = diff --staged
    
    REM Log aliases
    git config --global alias.lg "log --oneline --graph --decorate"
    echo   lg = log --oneline --graph --decorate
    
    git config --global alias.lga "log --oneline --graph --decorate --all"
    echo   lga = log --oneline --graph --decorate --all
    
    git config --global alias.last "log -1 HEAD --stat"
    echo   last = log -1 HEAD --stat
    
    git config --global alias.history "log --pretty=format:'%%h %%ad | %%s%%d [%%an]' --date=short"
    echo   history = log --pretty=format
    
    REM Undo aliases
    git config --global alias.unstage "reset HEAD --"
    echo   unstage = reset HEAD --
    
    git config --global alias.undo "reset --soft HEAD~1"
    echo   undo = reset --soft HEAD~1
    
    git config --global alias.amend "commit --amend --no-edit"
    echo   amend = commit --amend --no-edit
    
    REM Branch aliases
    git config --global alias.branches "branch -a"
    echo   branches = branch -a
    
    git config --global alias.remotes "remote -v"
    echo   remotes = remote -v
    
    git config --global alias.tags "tag -l"
    echo   tags = tag -l
    
    REM Stash aliases
    git config --global alias.stashes "stash list"
    echo   stashes = stash list
    
    git config --global alias.save "stash push -m"
    echo   save = stash push -m
    
    REM Cleanup aliases
    git config --global alias.cleanup "!git branch --merged | grep -v '\\*\\|main\\|master' | xargs -n 1 git branch -d"
    echo   cleanup = delete merged branches
    
    REM Quick aliases
    git config --global alias.aa "add --all"
    echo   aa = add --all
    
    git config --global alias.cm "commit -m"
    echo   cm = commit -m
    
    git config --global alias.cam "commit -am"
    echo   cam = commit -am
    
    git config --global alias.p "push"
    echo   p = push
    
    git config --global alias.pl "pull"
    echo   pl = pull
    
    echo.
    echo All recommended aliases installed!
    echo.
    echo Usage examples:
    echo   git st           (status)
    echo   git co branch    (checkout branch)
    echo   git lg           (pretty log)
    echo   git cm "message" (commit -m)
    echo   git aa           (add all)

) else if "%CHOICE%"=="5" (
    echo.
    set /p "EXPORT_FILE=Enter filename (default: git_aliases.txt): "
    if "!EXPORT_FILE!"=="" set "EXPORT_FILE=git_aliases.txt"
    
    (
        echo # Git Aliases Export
        echo # Generated: %DATE% %TIME%
        echo # Import with: git config --global alias.NAME "COMMAND"
        echo.
        git config --global --get-regexp alias
    ) > "!EXPORT_FILE!"
    
    echo Aliases exported to: !EXPORT_FILE!

) else if "%CHOICE%"=="6" (
    echo.
    set /p "IMPORT_FILE=Enter filename to import: "
    if not exist "!IMPORT_FILE!" (
        echo ERROR: File not found
        pause
        exit /b 1
    )
    
    echo Importing aliases...
    for /f "tokens=1,* delims= " %%a in ('type "!IMPORT_FILE!" ^| findstr "^alias"') do (
        set "ALIAS_FULL=%%a"
        set "ALIAS_NAME=!ALIAS_FULL:alias.=!"
        set "ALIAS_CMD=%%b"
        git config --global alias.!ALIAS_NAME! "!ALIAS_CMD!"
        echo   !ALIAS_NAME! = !ALIAS_CMD!
    )
    echo.
    echo Import complete!

) else if "%CHOICE%"=="7" (
    echo.
    echo Current aliases:
    git config --global --get-regexp alias 2>nul
    echo.
    
    set /p "ALIAS_NAME=Enter alias name to edit: "
    if "!ALIAS_NAME!"=="" (
        echo ERROR: Alias name required
        pause
        exit /b 1
    )
    
    for /f "delims=" %%c in ('git config --global alias.!ALIAS_NAME! 2^>nul') do set "CURRENT_CMD=%%c"
    
    if "!CURRENT_CMD!"=="" (
        echo Alias not found.
        pause
        exit /b 1
    )
    
    echo Current command: !CURRENT_CMD!
    set /p "NEW_CMD=Enter new command: "
    
    if not "!NEW_CMD!"=="" (
        git config --global alias.!ALIAS_NAME! "!NEW_CMD!"
        echo Alias updated!
    )

) else if "%CHOICE%"=="8" (
    echo.
    git config --global --get-regexp alias 2>nul
    echo.
    
    set /p "ALIAS_NAME=Enter alias to test: "
    if "!ALIAS_NAME!"=="" (
        echo ERROR: Alias name required
        pause
        exit /b 1
    )
    
    echo.
    echo Running: git !ALIAS_NAME!
    echo ========================================
    cd /d "%~dp0.."
    git !ALIAS_NAME!
    echo ========================================

) else if "%CHOICE%"=="9" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
pause
