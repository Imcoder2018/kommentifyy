@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Hooks Manager
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

set "HOOKS_DIR=.git\hooks"

echo Current hooks in repository:
echo ========================================
if exist "%HOOKS_DIR%" (
    dir /b "%HOOKS_DIR%" 2>nul | findstr /v ".sample"
    if errorlevel 1 echo No active hooks installed.
) else (
    echo Hooks directory not found.
)
echo.

echo Select action:
echo.
echo [1] Install pre-commit hook
echo [2] Install pre-push hook
echo [3] Install commit-msg hook
echo [4] Install post-merge hook
echo [5] Install prepare-commit-msg hook
echo [6] View hook content
echo [7] Edit hook
echo [8] Disable hook (rename)
echo [9] Enable hook (rename back)
echo [10] Remove hook
echo [11] Install all recommended hooks
echo [12] Bypass hooks for next commit
echo [13] Cancel
echo.
set /p "CHOICE=Enter choice (1-13): "

if "%CHOICE%"=="1" (
    echo.
    echo Pre-commit hook options:
    echo [a] Lint check (runs npm run lint if available)
    echo [b] Prevent large files
    echo [c] Check for debug statements
    echo [d] Run tests
    echo [e] Custom command
    echo.
    set /p "HOOK_TYPE=Select hook type (a-e): "
    
    if /i "!HOOK_TYPE!"=="a" (
        (
            echo #!/bin/sh
            echo # Pre-commit hook: Lint check
            echo if [ -f package.json ]; then
            echo     if grep -q "\"lint\"" package.json; then
            echo         echo "Running lint..."
            echo         npm run lint
            echo         if [ $? -ne 0 ]; then
            echo             echo "Lint failed. Please fix errors before committing."
            echo             exit 1
            echo         fi
            echo     fi
            echo fi
        ) > "%HOOKS_DIR%\pre-commit"
    ) else if /i "!HOOK_TYPE!"=="b" (
        (
            echo #!/bin/sh
            echo # Pre-commit hook: Prevent large files
            echo MAX_SIZE=5242880  # 5MB
            echo for file in $(git diff --cached --name-only); do
            echo     if [ -f "$file" ]; then
            echo         size=$(wc -c ^< "$file")
            echo         if [ $size -gt $MAX_SIZE ]; then
            echo             echo "ERROR: $file is larger than 5MB"
            echo             exit 1
            echo         fi
            echo     fi
            echo done
        ) > "%HOOKS_DIR%\pre-commit"
    ) else if /i "!HOOK_TYPE!"=="c" (
        (
            echo #!/bin/sh
            echo # Pre-commit hook: Check for debug statements
            echo if git diff --cached --name-only ^| xargs grep -l "console.log\|debugger\|TODO\|FIXME" 2^>/dev/null; then
            echo     echo "WARNING: Found debug statements or TODOs in staged files"
            echo     read -p "Continue anyway? (y/n) " -n 1 -r
            echo     echo
            echo     if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo         exit 1
            echo     fi
            echo fi
        ) > "%HOOKS_DIR%\pre-commit"
    ) else if /i "!HOOK_TYPE!"=="d" (
        (
            echo #!/bin/sh
            echo # Pre-commit hook: Run tests
            echo if [ -f package.json ]; then
            echo     if grep -q "\"test\"" package.json; then
            echo         echo "Running tests..."
            echo         npm test
            echo         if [ $? -ne 0 ]; then
            echo             echo "Tests failed. Please fix before committing."
            echo             exit 1
            echo         fi
            echo     fi
            echo fi
        ) > "%HOOKS_DIR%\pre-commit"
    ) else if /i "!HOOK_TYPE!"=="e" (
        set /p "CUSTOM_CMD=Enter custom command: "
        (
            echo #!/bin/sh
            echo # Pre-commit hook: Custom command
            echo !CUSTOM_CMD!
            echo if [ $? -ne 0 ]; then
            echo     echo "Pre-commit check failed"
            echo     exit 1
            echo fi
        ) > "%HOOKS_DIR%\pre-commit"
    )
    
    echo Pre-commit hook installed!

) else if "%CHOICE%"=="2" (
    echo.
    echo Pre-push hook options:
    echo [a] Run tests before push
    echo [b] Prevent push to main/master
    echo [c] Check branch name convention
    echo [d] Custom command
    echo.
    set /p "HOOK_TYPE=Select hook type (a-d): "
    
    if /i "!HOOK_TYPE!"=="a" (
        (
            echo #!/bin/sh
            echo # Pre-push hook: Run tests
            echo echo "Running tests before push..."
            echo npm test
            echo if [ $? -ne 0 ]; then
            echo     echo "Tests failed. Push aborted."
            echo     exit 1
            echo fi
        ) > "%HOOKS_DIR%\pre-push"
    ) else if /i "!HOOK_TYPE!"=="b" (
        (
            echo #!/bin/sh
            echo # Pre-push hook: Prevent push to protected branches
            echo current_branch=$(git symbolic-ref HEAD ^| sed -e 's,.*/\(.*\),\1,'^)
            echo if [ "$current_branch" = "main" ] ^|^| [ "$current_branch" = "master" ]; then
            echo     echo "ERROR: Cannot push directly to $current_branch"
            echo     echo "Please create a feature branch and submit a pull request."
            echo     exit 1
            echo fi
        ) > "%HOOKS_DIR%\pre-push"
    ) else if /i "!HOOK_TYPE!"=="c" (
        (
            echo #!/bin/sh
            echo # Pre-push hook: Check branch naming
            echo current_branch=$(git symbolic-ref HEAD ^| sed -e 's,.*/\(.*\),\1,'^)
            echo if ! echo "$current_branch" ^| grep -qE "^(feature^|bugfix^|hotfix^|release)/"; then
            echo     if [ "$current_branch" != "main" ] ^&^& [ "$current_branch" != "master" ] ^&^& [ "$current_branch" != "develop" ]; then
            echo         echo "ERROR: Branch name must start with feature/, bugfix/, hotfix/, or release/"
            echo         exit 1
            echo     fi
            echo fi
        ) > "%HOOKS_DIR%\pre-push"
    ) else if /i "!HOOK_TYPE!"=="d" (
        set /p "CUSTOM_CMD=Enter custom command: "
        (
            echo #!/bin/sh
            echo # Pre-push hook: Custom command
            echo !CUSTOM_CMD!
        ) > "%HOOKS_DIR%\pre-push"
    )
    
    echo Pre-push hook installed!

) else if "%CHOICE%"=="3" (
    echo.
    echo Commit-msg hook options:
    echo [a] Enforce conventional commits
    echo [b] Require ticket number (JIRA-123)
    echo [c] Minimum message length
    echo [d] Custom pattern
    echo.
    set /p "HOOK_TYPE=Select hook type (a-d): "
    
    if /i "!HOOK_TYPE!"=="a" (
        (
            echo #!/bin/sh
            echo # Commit-msg hook: Conventional commits
            echo commit_msg=$(cat $1^)
            echo if ! echo "$commit_msg" ^| grep -qE "^(feat^|fix^|docs^|style^|refactor^|test^|chore)(\(.+\))?: .+"; then
            echo     echo "ERROR: Commit message must follow conventional commits format"
            echo     echo "Example: feat(auth): add login functionality"
            echo     echo "Types: feat, fix, docs, style, refactor, test, chore"
            echo     exit 1
            echo fi
        ) > "%HOOKS_DIR%\commit-msg"
    ) else if /i "!HOOK_TYPE!"=="b" (
        (
            echo #!/bin/sh
            echo # Commit-msg hook: Require ticket number
            echo commit_msg=$(cat $1^)
            echo if ! echo "$commit_msg" ^| grep -qE "[A-Z]+-[0-9]+"; then
            echo     echo "ERROR: Commit message must include ticket number (e.g., JIRA-123)"
            echo     exit 1
            echo fi
        ) > "%HOOKS_DIR%\commit-msg"
    ) else if /i "!HOOK_TYPE!"=="c" (
        (
            echo #!/bin/sh
            echo # Commit-msg hook: Minimum length
            echo commit_msg=$(cat $1^)
            echo msg_length=${#commit_msg}
            echo if [ $msg_length -lt 10 ]; then
            echo     echo "ERROR: Commit message must be at least 10 characters"
            echo     exit 1
            echo fi
        ) > "%HOOKS_DIR%\commit-msg"
    ) else if /i "!HOOK_TYPE!"=="d" (
        set /p "PATTERN=Enter regex pattern: "
        (
            echo #!/bin/sh
            echo # Commit-msg hook: Custom pattern
            echo commit_msg=$(cat $1^)
            echo if ! echo "$commit_msg" ^| grep -qE "!PATTERN!"; then
            echo     echo "ERROR: Commit message must match pattern: !PATTERN!"
            echo     exit 1
            echo fi
        ) > "%HOOKS_DIR%\commit-msg"
    )
    
    echo Commit-msg hook installed!

) else if "%CHOICE%"=="4" (
    (
        echo #!/bin/sh
        echo # Post-merge hook
        echo echo "Post-merge: Checking for dependency changes..."
        echo if git diff HEAD@{1} --name-only ^| grep -q "package.json"; then
        echo     echo "package.json changed. Running npm install..."
        echo     npm install
        echo fi
        echo if git diff HEAD@{1} --name-only ^| grep -q "requirements.txt"; then
        echo     echo "requirements.txt changed. Running pip install..."
        echo     pip install -r requirements.txt
        echo fi
    ) > "%HOOKS_DIR%\post-merge"
    echo Post-merge hook installed!

) else if "%CHOICE%"=="5" (
    (
        echo #!/bin/sh
        echo # Prepare-commit-msg hook
        echo # Add branch name to commit message
        echo branch_name=$(git symbolic-ref --short HEAD^)
        echo if [ -n "$branch_name" ]; then
        echo     echo "[$branch_name] $(cat $1^)" ^> $1
        echo fi
    ) > "%HOOKS_DIR%\prepare-commit-msg"
    echo Prepare-commit-msg hook installed!

) else if "%CHOICE%"=="6" (
    echo.
    echo Available hooks:
    dir /b "%HOOKS_DIR%" 2>nul | findstr /v ".sample"
    echo.
    set /p "HOOK_NAME=Enter hook name to view: "
    if exist "%HOOKS_DIR%\!HOOK_NAME!" (
        echo.
        echo Content of !HOOK_NAME!:
        echo ========================================
        type "%HOOKS_DIR%\!HOOK_NAME!"
        echo.
        echo ========================================
    ) else (
        echo Hook not found.
    )

) else if "%CHOICE%"=="7" (
    echo.
    dir /b "%HOOKS_DIR%" 2>nul | findstr /v ".sample"
    echo.
    set /p "HOOK_NAME=Enter hook name to edit: "
    if exist "%HOOKS_DIR%\!HOOK_NAME!" (
        notepad "%HOOKS_DIR%\!HOOK_NAME!"
    ) else (
        echo Hook not found. Creating new...
        notepad "%HOOKS_DIR%\!HOOK_NAME!"
    )

) else if "%CHOICE%"=="8" (
    echo.
    dir /b "%HOOKS_DIR%" 2>nul | findstr /v ".sample" | findstr /v ".disabled"
    echo.
    set /p "HOOK_NAME=Enter hook name to disable: "
    if exist "%HOOKS_DIR%\!HOOK_NAME!" (
        rename "%HOOKS_DIR%\!HOOK_NAME!" "!HOOK_NAME!.disabled"
        echo Hook disabled: !HOOK_NAME!
    ) else (
        echo Hook not found.
    )

) else if "%CHOICE%"=="9" (
    echo.
    echo Disabled hooks:
    dir /b "%HOOKS_DIR%\*.disabled" 2>nul
    echo.
    set /p "HOOK_NAME=Enter hook name to enable (without .disabled): "
    if exist "%HOOKS_DIR%\!HOOK_NAME!.disabled" (
        rename "%HOOKS_DIR%\!HOOK_NAME!.disabled" "!HOOK_NAME!"
        echo Hook enabled: !HOOK_NAME!
    ) else (
        echo Disabled hook not found.
    )

) else if "%CHOICE%"=="10" (
    echo.
    dir /b "%HOOKS_DIR%" 2>nul | findstr /v ".sample"
    echo.
    set /p "HOOK_NAME=Enter hook name to remove: "
    if exist "%HOOKS_DIR%\!HOOK_NAME!" (
        set /p "CONFIRM=Delete !HOOK_NAME!? (Y/N): "
        if /i "!CONFIRM!"=="Y" (
            del "%HOOKS_DIR%\!HOOK_NAME!"
            echo Hook removed: !HOOK_NAME!
        )
    ) else (
        echo Hook not found.
    )

) else if "%CHOICE%"=="11" (
    echo.
    echo Installing recommended hooks...
    echo.
    
    REM Pre-commit: Check for debug statements
    (
        echo #!/bin/sh
        echo # Pre-commit hook: Quality checks
        echo echo "Running pre-commit checks..."
        echo # Check for debug statements
        echo if git diff --cached --name-only ^| xargs grep -l "console.log\|debugger" 2^>/dev/null; then
        echo     echo "WARNING: Debug statements found"
        echo fi
    ) > "%HOOKS_DIR%\pre-commit"
    echo   - pre-commit installed
    
    REM Pre-push: Run tests
    (
        echo #!/bin/sh
        echo # Pre-push hook
        echo echo "Running pre-push checks..."
    ) > "%HOOKS_DIR%\pre-push"
    echo   - pre-push installed
    
    echo.
    echo All recommended hooks installed!

) else if "%CHOICE%"=="12" (
    echo.
    echo To bypass hooks for next commit, use:
    echo   git commit --no-verify -m "message"
    echo.
    echo Or for push:
    echo   git push --no-verify
    echo.

) else if "%CHOICE%"=="13" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
pause
