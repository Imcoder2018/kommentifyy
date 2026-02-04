@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Git Configuration Backup/Restore
echo ========================================
echo.

set "BACKUP_DIR=%~dp0backups"
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

echo Select action:
echo.
echo [1] Backup global Git configuration
echo [2] Backup local repository configuration
echo [3] Backup all configurations
echo [4] Restore global Git configuration
echo [5] Restore local repository configuration
echo [6] View current global configuration
echo [7] View current local configuration
echo [8] Export configuration to file
echo [9] Import configuration from file
echo [10] Sync configuration across machines
echo [11] List available backups
echo [12] Cancel
echo.
set /p "CHOICE=Enter choice (1-12): "

REM Get timestamp using PowerShell
for /f "delims=" %%d in ('powershell -Command "Get-Date -Format \"yyyyMMdd_HHmm\""') do set "TIMESTAMP=%%d"

if "%CHOICE%"=="1" (
    echo.
    echo Backing up global Git configuration...
    
    set "BACKUP_FILE=%BACKUP_DIR%\gitconfig_global_%TIMESTAMP%.txt"
    git config --global --list > "!BACKUP_FILE!"
    
    if errorlevel 1 (
        echo ERROR: Failed to backup global configuration
    ) else (
        echo Global configuration backed up to:
        echo !BACKUP_FILE!
    )

) else if "%CHOICE%"=="2" (
    cd /d "%~dp0.."
    if not exist ".git" (
        echo ERROR: Not in a Git repository
        pause
        exit /b 1
    )
    
    echo.
    echo Backing up local repository configuration...
    
    set "BACKUP_FILE=%BACKUP_DIR%\gitconfig_local_%TIMESTAMP%.txt"
    git config --local --list > "!BACKUP_FILE!"
    
    if errorlevel 1 (
        echo ERROR: Failed to backup local configuration
    ) else (
        echo Local configuration backed up to:
        echo !BACKUP_FILE!
    )

) else if "%CHOICE%"=="3" (
    echo.
    echo Backing up all configurations...
    
    set "BACKUP_FILE=%BACKUP_DIR%\gitconfig_all_%TIMESTAMP%.txt"
    
    (
        echo ========== GLOBAL CONFIGURATION ==========
        git config --global --list
        echo.
        echo ========== SYSTEM CONFIGURATION ==========
        git config --system --list 2>nul
        echo.
        echo ========== LOCAL CONFIGURATION ==========
        cd /d "%~dp0.."
        if exist ".git" git config --local --list 2>nul
    ) > "!BACKUP_FILE!"
    
    echo All configurations backed up to:
    echo !BACKUP_FILE!

) else if "%CHOICE%"=="4" (
    echo.
    echo Available global backups:
    dir /b "%BACKUP_DIR%\gitconfig_global_*.txt" 2>nul
    if errorlevel 1 echo   No backups found.
    echo.
    
    set /p "BACKUP_NAME=Enter backup filename: "
    if not exist "%BACKUP_DIR%\!BACKUP_NAME!" (
        echo ERROR: Backup file not found
        pause
        exit /b 1
    )
    
    echo.
    echo Restoring global configuration...
    echo.
    
    for /f "tokens=1,* delims==" %%a in ('type "%BACKUP_DIR%\!BACKUP_NAME!"') do (
        echo Setting: %%a = %%b
        git config --global "%%a" "%%b" 2>nul
    )
    
    echo.
    echo Global configuration restored!

) else if "%CHOICE%"=="5" (
    cd /d "%~dp0.."
    if not exist ".git" (
        echo ERROR: Not in a Git repository
        pause
        exit /b 1
    )
    
    echo.
    echo Available local backups:
    dir /b "%BACKUP_DIR%\gitconfig_local_*.txt" 2>nul
    if errorlevel 1 echo   No backups found.
    echo.
    
    set /p "BACKUP_NAME=Enter backup filename: "
    if not exist "%BACKUP_DIR%\!BACKUP_NAME!" (
        echo ERROR: Backup file not found
        pause
        exit /b 1
    )
    
    echo.
    echo Restoring local configuration...
    
    for /f "tokens=1,* delims==" %%a in ('type "%BACKUP_DIR%\!BACKUP_NAME!"') do (
        echo Setting: %%a = %%b
        git config --local "%%a" "%%b" 2>nul
    )
    
    echo.
    echo Local configuration restored!

) else if "%CHOICE%"=="6" (
    echo.
    echo Global Git Configuration:
    echo ========================================
    git config --global --list
    echo ========================================

) else if "%CHOICE%"=="7" (
    cd /d "%~dp0.."
    if not exist ".git" (
        echo ERROR: Not in a Git repository
        pause
        exit /b 1
    )
    
    echo.
    echo Local Repository Configuration:
    echo ========================================
    git config --local --list
    echo ========================================

) else if "%CHOICE%"=="8" (
    echo.
    set /p "EXPORT_FILE=Enter export filename: "
    if "!EXPORT_FILE!"=="" set "EXPORT_FILE=git_config_export.txt"
    
    for /f "delims=" %%d in ('powershell -Command "Get-Date -Format \"yyyy-MM-dd HH:mm:ss\""') do set "DATETIME=%%d"
    
    (
        echo # Git Configuration Export
        echo # Generated: !DATETIME!
        echo # Use this file to restore configuration on another machine
        echo.
        echo [global]
        git config --global --list
        echo.
    ) > "!EXPORT_FILE!"
    
    echo Configuration exported to: !EXPORT_FILE!

) else if "%CHOICE%"=="9" (
    echo.
    set /p "IMPORT_FILE=Enter import filename: "
    if not exist "!IMPORT_FILE!" (
        echo ERROR: Import file not found
        pause
        exit /b 1
    )
    
    echo.
    echo Importing configuration...
    
    set "SECTION="
    for /f "tokens=1,* delims==" %%a in ('type "!IMPORT_FILE!" ^| findstr /v "^#" ^| findstr /v "^$"') do (
        if "%%a"=="[global]" (
            set "SECTION=global"
        ) else if "%%a"=="[local]" (
            set "SECTION=local"
        ) else (
            if "!SECTION!"=="global" (
                git config --global "%%a" "%%b" 2>nul
            ) else if "!SECTION!"=="local" (
                git config --local "%%a" "%%b" 2>nul
            )
        )
    )
    
    echo Configuration imported!

) else if "%CHOICE%"=="10" (
    echo.
    echo Configuration Sync Options:
    echo.
    echo To sync Git configuration across machines:
    echo.
    echo 1. Export configuration:
    echo    Run option [8] to export configuration
    echo.
    echo 2. Copy the export file to the new machine
    echo.
    echo 3. Import configuration:
    echo    Run option [9] to import configuration
    echo.
    echo Alternatively, you can:
    echo - Store .gitconfig in a dotfiles repository
    echo - Use a cloud service to sync ~/.gitconfig
    echo - Use a configuration management tool
    echo.

) else if "%CHOICE%"=="11" (
    echo.
    echo Available backups:
    echo ========================================
    dir /b "%BACKUP_DIR%" 2>nul
    if errorlevel 1 echo No backups found.
    echo ========================================

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
