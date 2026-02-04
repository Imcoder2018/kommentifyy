@echo off
setlocal enabledelayedexpansion

:MENU
cls
echo ========================================
echo    GIT ADVANCED SCRIPTS MENU
echo ========================================
echo.
echo This menu contains advanced features.
echo For basic operations, use menu.bat
echo.
echo === TAG ^& VERSION MANAGEMENT ===
echo [1]  Tag Manager
echo [2]  Version Bump (Semantic Versioning)
echo [3]  Changelog Generator
echo.
echo === BRANCH UTILITIES ===
echo [4]  Branch Cleanup
echo [5]  Branch Rename
echo [6]  Cherry-Pick Manager
echo.
echo === COMMIT TOOLS ===
echo [7]  Commit Amend
echo [8]  Conventional Commits
echo [9]  Bisect (Bug Finder)
echo [10] Blame Viewer
echo.
echo === REPOSITORY MANAGEMENT ===
echo [11] Worktree Manager
echo [12] Submodule Manager
echo [13] Remote Manager
echo [14] LFS Manager
echo.
echo === SECURITY ^& BACKUP ===
echo [15] Secret Scanner
echo [16] Config Backup/Restore
echo [17] Deploy Rollback
echo.
echo === ANALYSIS ^& TOOLS ===
echo [18] Contributor Statistics
echo [19] Archive Creator
echo [20] Diff Tool
echo [21] Patch Manager
echo [22] Reflog Explorer
echo [23] GC Optimizer
echo.
echo === INTEGRATIONS ===
echo [24] GitHub Integration
echo [25] Alias Manager
echo [26] Hooks Manager
echo [27] Gitignore Manager
echo.
echo [0]  Back to Main Menu
echo ========================================
echo.
set /p "CHOICE=Enter your choice (0-27): "

if "%CHOICE%"=="0" (
    call "%~dp0menu.bat"
    exit /b 0
)

if "%CHOICE%"=="1" call "%~dp0tag-manager.bat" & goto MENU
if "%CHOICE%"=="2" call "%~dp0version-bump.bat" & goto MENU
if "%CHOICE%"=="3" call "%~dp0changelog-generate.bat" & goto MENU
if "%CHOICE%"=="4" call "%~dp0branch-cleanup.bat" & goto MENU
if "%CHOICE%"=="5" call "%~dp0branch-rename.bat" & goto MENU
if "%CHOICE%"=="6" call "%~dp0cherry-pick.bat" & goto MENU
if "%CHOICE%"=="7" call "%~dp0commit-amend.bat" & goto MENU
if "%CHOICE%"=="8" call "%~dp0commit-conventional.bat" & goto MENU
if "%CHOICE%"=="9" call "%~dp0bisect.bat" & goto MENU
if "%CHOICE%"=="10" call "%~dp0blame.bat" & goto MENU
if "%CHOICE%"=="11" call "%~dp0worktree-manager.bat" & goto MENU
if "%CHOICE%"=="12" call "%~dp0submodule-manager.bat" & goto MENU
if "%CHOICE%"=="13" call "%~dp0remote-manager.bat" & goto MENU
if "%CHOICE%"=="14" call "%~dp0lfs-manager.bat" & goto MENU
if "%CHOICE%"=="15" call "%~dp0secret-scan.bat" & goto MENU
if "%CHOICE%"=="16" call "%~dp0config-backup.bat" & goto MENU
if "%CHOICE%"=="17" call "%~dp0deploy-rollback.bat" & goto MENU
if "%CHOICE%"=="18" call "%~dp0contributor-stats.bat" & goto MENU
if "%CHOICE%"=="19" call "%~dp0archive.bat" & goto MENU
if "%CHOICE%"=="20" call "%~dp0diff-tool.bat" & goto MENU
if "%CHOICE%"=="21" call "%~dp0patch-manager.bat" & goto MENU
if "%CHOICE%"=="22" call "%~dp0reflog-explorer.bat" & goto MENU
if "%CHOICE%"=="23" call "%~dp0gc-optimize.bat" & goto MENU
if "%CHOICE%"=="24" call "%~dp0github-integration.bat" & goto MENU
if "%CHOICE%"=="25" call "%~dp0alias-manager.bat" & goto MENU
if "%CHOICE%"=="26" call "%~dp0hooks-manager.bat" & goto MENU
if "%CHOICE%"=="27" call "%~dp0ignore-manager.bat" & goto MENU

echo.
echo Invalid choice. Please enter a number between 0 and 27.
timeout /t 2 >nul
goto MENU
