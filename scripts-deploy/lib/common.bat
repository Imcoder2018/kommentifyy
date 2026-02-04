@echo off
REM ============================================
REM Common Library Functions for Git Scripts
REM Version 2.0
REM ============================================

REM This file should be called from other scripts using:
REM call "%~dp0lib\common.bat"

REM ============================================
REM COLOR SUPPORT (Windows 10+)
REM ============================================

REM Initialize ANSI escape codes
for /f "tokens=1,2 delims=#" %%a in ('"prompt #$E# & echo on & for %%b in (1) do rem"') do set "ESC=%%b"

REM Define colors
set "C_RED=%ESC%[91m"
set "C_GREEN=%ESC%[92m"
set "C_YELLOW=%ESC%[93m"
set "C_BLUE=%ESC%[94m"
set "C_MAGENTA=%ESC%[95m"
set "C_CYAN=%ESC%[96m"
set "C_WHITE=%ESC%[97m"
set "C_RESET=%ESC%[0m"
set "C_BOLD=%ESC%[1m"

REM Status icons
set "ICON_OK=[OK]"
set "ICON_FAIL=[FAIL]"
set "ICON_WARN=[WARN]"
set "ICON_INFO=[INFO]"

goto :EOF

REM ============================================
REM PRINT FUNCTIONS
REM ============================================

:print_header
REM Usage: call :print_header "Title"
echo.
echo %C_CYAN%========================================%C_RESET%
echo %C_CYAN%   %~1%C_RESET%
echo %C_CYAN%========================================%C_RESET%
echo.
goto :EOF

:print_success
REM Usage: call :print_success "Message"
echo %C_GREEN%%ICON_OK% %~1%C_RESET%
goto :EOF

:print_error
REM Usage: call :print_error "Message"
echo %C_RED%%ICON_FAIL% %~1%C_RESET%
goto :EOF

:print_warning
REM Usage: call :print_warning "Message"
echo %C_YELLOW%%ICON_WARN% %~1%C_RESET%
goto :EOF

:print_info
REM Usage: call :print_info "Message"
echo %C_BLUE%%ICON_INFO% %~1%C_RESET%
goto :EOF

REM ============================================
REM VALIDATION FUNCTIONS
REM ============================================

:check_git_installed
REM Check if Git is installed
git --version >nul 2>&1
if errorlevel 1 (
    call :print_error "Git is not installed"
    echo Please install Git from: https://git-scm.com/downloads
    exit /b 1
)
goto :EOF

:check_git_repo
REM Check if current directory is a Git repository
if not exist ".git" (
    call :print_error "Not a Git repository"
    echo Please run init-repo.bat first or navigate to a Git repository.
    exit /b 1
)
goto :EOF

:check_network
REM Check network connectivity to GitHub
ping -n 1 github.com >nul 2>&1
if errorlevel 1 (
    call :print_warning "Network connectivity issues detected"
    exit /b 1
)
call :print_success "Network connectivity OK"
goto :EOF

:validate_branch_name
REM Usage: call :validate_branch_name "branch-name"
REM Returns errorlevel 1 if invalid
set "BRANCH_TO_CHECK=%~1"

REM Check for empty
if "%BRANCH_TO_CHECK%"=="" (
    call :print_error "Branch name cannot be empty"
    exit /b 1
)

REM Check for spaces
echo %BRANCH_TO_CHECK% | findstr " " >nul
if not errorlevel 1 (
    call :print_error "Branch name cannot contain spaces"
    exit /b 1
)

REM Check for invalid characters
echo %BRANCH_TO_CHECK% | findstr /r "[~^:?*\[\]@{}\]" >nul
if not errorlevel 1 (
    call :print_error "Branch name contains invalid characters"
    exit /b 1
)

REM Check for reserved names
if /i "%BRANCH_TO_CHECK%"=="HEAD" (
    call :print_error "HEAD is a reserved name"
    exit /b 1
)

goto :EOF

:validate_commit_message
REM Usage: call :validate_commit_message "message"
set "MSG_TO_CHECK=%~1"

REM Check for empty
if "%MSG_TO_CHECK%"=="" (
    call :print_error "Commit message cannot be empty"
    exit /b 1
)

REM Check minimum length
set "MSG_LEN=0"
set "TEMP_MSG=%MSG_TO_CHECK%"
:count_loop
if not "%TEMP_MSG%"=="" (
    set /a MSG_LEN+=1
    set "TEMP_MSG=%TEMP_MSG:~1%"
    goto :count_loop
)

if %MSG_LEN% LSS 3 (
    call :print_error "Commit message too short (minimum 3 characters)"
    exit /b 1
)

goto :EOF

REM ============================================
REM GIT HELPER FUNCTIONS
REM ============================================

:get_current_branch
REM Sets CURRENT_BRANCH variable
for /f "delims=" %%i in ('git branch --show-current 2^>nul') do set "CURRENT_BRANCH=%%i"
if "%CURRENT_BRANCH%"=="" set "CURRENT_BRANCH=HEAD (detached)"
goto :EOF

:get_remote_url
REM Sets REMOTE_URL variable
for /f "delims=" %%i in ('git remote get-url origin 2^>nul') do set "REMOTE_URL=%%i"
goto :EOF

:has_uncommitted_changes
REM Sets HAS_CHANGES to 1 if there are uncommitted changes
set "HAS_CHANGES=0"
git diff --quiet 2>nul
if errorlevel 1 set "HAS_CHANGES=1"
git diff --cached --quiet 2>nul
if errorlevel 1 set "HAS_CHANGES=1"
goto :EOF

:get_repo_name
REM Sets REPO_NAME variable from remote URL or folder name
for /f "delims=" %%i in ('git remote get-url origin 2^>nul') do set "TEMP_URL=%%i"
if "%TEMP_URL%"=="" (
    for %%i in ("%CD%") do set "REPO_NAME=%%~ni"
) else (
    for %%i in ("%TEMP_URL%") do set "REPO_NAME=%%~ni"
    set "REPO_NAME=%REPO_NAME:.git=%"
)
goto :EOF

REM ============================================
REM DATETIME FUNCTIONS
REM ============================================

:get_timestamp
REM Sets TIMESTAMP variable in format: YYYY-MM-DD_HH-MM-SS
for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd_HH-mm-ss\""') do set "TIMESTAMP=%%a"
if "%TIMESTAMP%"=="" (
    REM Fallback
    set "TIMESTAMP=%date:~10,4%-%date:~4,2%-%date:~7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%"
    set "TIMESTAMP=%TIMESTAMP: =0%"
)
goto :EOF

:get_datetime
REM Sets DATETIME variable in format: YYYY-MM-DD HH:MM:SS
for /f "delims=" %%a in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set "DATETIME=%%a"
goto :EOF

REM ============================================
REM LOGGING FUNCTIONS
REM ============================================

:log_operation
REM Usage: call :log_operation "Operation" "Details"
call :get_datetime
set "LOG_DIR=%~dp0..\logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
echo [%DATETIME%] %~1: %~2 >> "%LOG_DIR%\operations.log"
goto :EOF

:log_error
REM Usage: call :log_error "Error message"
call :get_datetime
set "LOG_DIR=%~dp0..\logs"
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
echo [%DATETIME%] ERROR: %~1 >> "%LOG_DIR%\errors.log"
goto :EOF

REM ============================================
REM BACKUP FUNCTIONS
REM ============================================

:create_backup_branch
REM Creates a backup branch before destructive operations
REM Usage: call :create_backup_branch
call :get_timestamp
call :get_current_branch
set "BACKUP_BRANCH=backup/%CURRENT_BRANCH%_%TIMESTAMP%"
git branch "%BACKUP_BRANCH%" >nul 2>&1
if not errorlevel 1 (
    call :print_info "Backup created: %BACKUP_BRANCH%"
    call :log_operation "Backup" "Created backup branch %BACKUP_BRANCH%"
)
goto :EOF

:create_stash_backup
REM Stashes changes with a descriptive message
REM Usage: call :create_stash_backup "description"
call :get_datetime
git stash push -m "Auto-backup [%DATETIME%]: %~1" >nul 2>&1
if not errorlevel 1 (
    call :print_info "Changes stashed as backup"
)
goto :EOF

REM ============================================
REM CONFIRMATION FUNCTIONS
REM ============================================

:confirm_action
REM Usage: call :confirm_action "message" RESULT_VAR
REM Sets RESULT_VAR to Y or N
set /p "%~2=%~1 (Y/N): "
goto :EOF

:confirm_dangerous
REM Usage: call :confirm_dangerous "message" "CONFIRM_TEXT" RESULT_VAR
REM Requires typing specific text to confirm
echo.
call :print_warning "%~1"
set /p "CONFIRM_INPUT=Type '%~2' to confirm: "
if "%CONFIRM_INPUT%"=="%~2" (
    set "%~3=Y"
) else (
    set "%~3=N"
)
goto :EOF

REM ============================================
REM PROGRESS INDICATOR
REM ============================================

:show_spinner
REM Shows a simple spinner (call in loop)
set "SPINNER_CHARS=|/-\"
set /a "SPINNER_IDX=(%SPINNER_IDX%+1) %% 4"
set "SPINNER_CHAR=!SPINNER_CHARS:~%SPINNER_IDX%,1!"
echo|set /p="%SPINNER_CHAR%"
goto :EOF

:show_progress
REM Shows dots for progress
echo|set /p="."
goto :EOF
