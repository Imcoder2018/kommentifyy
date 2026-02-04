@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Conventional Commit Generator
echo ========================================
echo.

cd /d "%~dp0.."

if not exist ".git" (
    echo ERROR: Git repository not initialized
    pause
    exit /b 1
)

echo Current changes:
git status --short
echo.

echo Select commit type:
echo.
echo [1] feat     - A new feature
echo [2] fix      - A bug fix
echo [3] docs     - Documentation only changes
echo [4] style    - Code style (formatting, etc)
echo [5] refactor - Code refactoring
echo [6] perf     - Performance improvement
echo [7] test     - Adding tests
echo [8] build    - Build system changes
echo [9] ci       - CI configuration changes
echo [10] chore   - Other changes (maintenance)
echo [11] revert  - Revert previous commit
echo [12] Cancel
echo.
set /p "TYPE_CHOICE=Select type (1-12): "

if "%TYPE_CHOICE%"=="1" set "COMMIT_TYPE=feat"
if "%TYPE_CHOICE%"=="2" set "COMMIT_TYPE=fix"
if "%TYPE_CHOICE%"=="3" set "COMMIT_TYPE=docs"
if "%TYPE_CHOICE%"=="4" set "COMMIT_TYPE=style"
if "%TYPE_CHOICE%"=="5" set "COMMIT_TYPE=refactor"
if "%TYPE_CHOICE%"=="6" set "COMMIT_TYPE=perf"
if "%TYPE_CHOICE%"=="7" set "COMMIT_TYPE=test"
if "%TYPE_CHOICE%"=="8" set "COMMIT_TYPE=build"
if "%TYPE_CHOICE%"=="9" set "COMMIT_TYPE=ci"
if "%TYPE_CHOICE%"=="10" set "COMMIT_TYPE=chore"
if "%TYPE_CHOICE%"=="11" set "COMMIT_TYPE=revert"
if "%TYPE_CHOICE%"=="12" (
    echo Operation cancelled.
    pause
    exit /b 0
)

if "%COMMIT_TYPE%"=="" (
    echo Invalid selection.
    pause
    exit /b 1
)

echo.
echo Selected type: %COMMIT_TYPE%
echo.

REM Optional scope
set /p "SCOPE=Enter scope (optional, e.g., auth, api, ui): "

REM Breaking change
set /p "BREAKING=Is this a BREAKING CHANGE? (Y/N): "

REM Description
:get_description
set /p "DESCRIPTION=Enter short description: "
if "%DESCRIPTION%"=="" (
    echo Description is required!
    goto :get_description
)

REM Build commit message
if not "%SCOPE%"=="" (
    set "COMMIT_MSG=%COMMIT_TYPE%(%SCOPE%): %DESCRIPTION%"
) else (
    set "COMMIT_MSG=%COMMIT_TYPE%: %DESCRIPTION%"
)

REM Add breaking change indicator
if /i "%BREAKING%"=="Y" (
    set "COMMIT_MSG=%COMMIT_MSG%!"
)

echo.
echo Commit message: %COMMIT_MSG%
echo.

REM Optional body
set /p "ADD_BODY=Add detailed body? (Y/N): "
if /i "%ADD_BODY%"=="Y" (
    echo Enter body (press Enter twice to finish):
    set "BODY="
    :body_loop
    set /p "LINE="
    if not "!LINE!"=="" (
        set "BODY=!BODY!!LINE!\n"
        goto :body_loop
    )
)

REM Optional footer (for breaking changes, issue refs)
set "FOOTER="
if /i "%BREAKING%"=="Y" (
    set /p "BREAK_DESC=Describe the breaking change: "
    set "FOOTER=BREAKING CHANGE: !BREAK_DESC!"
)

set /p "ISSUE_REF=Reference issue/ticket (e.g., #123, JIRA-456): "
if not "%ISSUE_REF%"=="" (
    if not "%FOOTER%"=="" (
        set "FOOTER=!FOOTER!\n\nRefs: %ISSUE_REF%"
    ) else (
        set "FOOTER=Refs: %ISSUE_REF%"
    )
)

echo.
echo ========================================
echo Final commit message:
echo ========================================
echo %COMMIT_MSG%
if not "%BODY%"=="" (
    echo.
    echo %BODY%
)
if not "%FOOTER%"=="" (
    echo.
    echo %FOOTER%
)
echo ========================================
echo.

set /p "CONFIRM=Create this commit? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo Commit cancelled.
    pause
    exit /b 0
)

REM Stage all changes
git add .

REM Create commit
if not "%BODY%"=="" if not "%FOOTER%"=="" (
    git commit -m "%COMMIT_MSG%" -m "%BODY%" -m "%FOOTER%"
) else if not "%BODY%"=="" (
    git commit -m "%COMMIT_MSG%" -m "%BODY%"
) else if not "%FOOTER%"=="" (
    git commit -m "%COMMIT_MSG%" -m "%FOOTER%"
) else (
    git commit -m "%COMMIT_MSG%"
)

if errorlevel 1 (
    echo ERROR: Commit failed
    pause
    exit /b 1
)

echo.
echo Commit created successfully!
echo.

set /p "PUSH_NOW=Push to remote? (Y/N): "
if /i "%PUSH_NOW%"=="Y" (
    git push
    if errorlevel 1 (
        for /f "delims=" %%b in ('git branch --show-current 2^>nul') do set "BRANCH=%%b"
        git push -u origin !BRANCH!
    )
)

echo.
echo Latest commits:
git log --oneline -5
echo.
pause
