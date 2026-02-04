@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    GitHub Integration Tools
echo ========================================
echo.

cd /d "%~dp0.."

REM Check if GitHub CLI is installed
gh --version >nul 2>&1
if errorlevel 1 (
    echo GitHub CLI (gh) is NOT installed.
    echo.
    echo To install:
    echo   1. Download from: https://cli.github.com/
    echo   2. Or use: winget install GitHub.cli
    echo.
    echo Some features will be limited without GitHub CLI.
    echo.
    set "GH_AVAILABLE=0"
) else (
    set "GH_AVAILABLE=1"
    echo GitHub CLI is available.
    gh auth status 2>&1 | findstr "Logged in" >nul
    if errorlevel 1 (
        echo WARNING: Not logged in to GitHub CLI
        echo Run: gh auth login
    )
)
echo.

echo Select action:
echo.
echo === Repository ===
echo [1] View repository info
echo [2] Create new repository
echo [3] Fork repository
echo [4] Clone repository
echo.
echo === Pull Requests ===
echo [5] Create pull request
echo [6] List pull requests
echo [7] View pull request
echo [8] Merge pull request
echo [9] Review pull request
echo.
echo === Issues ===
echo [10] Create issue
echo [11] List issues
echo [12] View issue
echo [13] Close issue
echo.
echo === Actions/Workflows ===
echo [14] List workflow runs
echo [15] View workflow run
echo [16] Trigger workflow
echo.
echo === Releases ===
echo [17] Create release
echo [18] List releases
echo [19] Download release assets
echo.
echo [20] Open repository in browser
echo [21] Cancel
echo.
set /p "CHOICE=Enter choice (1-21): "

if "%CHOICE%"=="1" (
    if "%GH_AVAILABLE%"=="0" (
        echo Requires GitHub CLI
        pause
        exit /b 1
    )
    echo.
    echo Repository Information:
    echo ========================================
    gh repo view
    echo ========================================

) else if "%CHOICE%"=="2" (
    if "%GH_AVAILABLE%"=="0" (
        echo Opening GitHub in browser...
        start https://github.com/new
        pause
        exit /b 0
    )
    
    echo.
    set /p "REPO_NAME=Enter repository name: "
    if "!REPO_NAME!"=="" (
        echo ERROR: Name required
        pause
        exit /b 1
    )
    
    echo.
    echo Visibility:
    echo [1] Public
    echo [2] Private
    set /p "VIS=Select (1/2): "
    
    if "!VIS!"=="1" (
        gh repo create !REPO_NAME! --public --source=. --remote=origin
    ) else (
        gh repo create !REPO_NAME! --private --source=. --remote=origin
    )

) else if "%CHOICE%"=="3" (
    if "%GH_AVAILABLE%"=="0" (
        echo Requires GitHub CLI
        pause
        exit /b 1
    )
    
    echo.
    set /p "REPO_URL=Enter repository to fork (owner/repo): "
    if "!REPO_URL!"=="" (
        echo ERROR: Repository required
        pause
        exit /b 1
    )
    
    gh repo fork !REPO_URL! --clone
    echo Repository forked and cloned!

) else if "%CHOICE%"=="4" (
    echo.
    set /p "REPO_URL=Enter repository (owner/repo or URL): "
    if "!REPO_URL!"=="" (
        echo ERROR: Repository required
        pause
        exit /b 1
    )
    
    if "%GH_AVAILABLE%"=="1" (
        gh repo clone !REPO_URL!
    ) else (
        git clone https://github.com/!REPO_URL!.git
    )

) else if "%CHOICE%"=="5" (
    if "%GH_AVAILABLE%"=="0" (
        echo Opening GitHub PR page in browser...
        for /f "delims=" %%u in ('git remote get-url origin 2^>nul') do set "REMOTE_URL=%%u"
        set "REMOTE_URL=!REMOTE_URL:.git=!"
        start !REMOTE_URL!/compare
        pause
        exit /b 0
    )
    
    echo.
    set /p "PR_TITLE=Enter PR title: "
    if "!PR_TITLE!"=="" (
        echo ERROR: Title required
        pause
        exit /b 1
    )
    
    set /p "PR_BODY=Enter PR description (optional): "
    set /p "BASE_BRANCH=Enter base branch (default: main): "
    if "!BASE_BRANCH!"=="" set "BASE_BRANCH=main"
    
    if "!PR_BODY!"=="" (
        gh pr create --title "!PR_TITLE!" --base !BASE_BRANCH!
    ) else (
        gh pr create --title "!PR_TITLE!" --body "!PR_BODY!" --base !BASE_BRANCH!
    )

) else if "%CHOICE%"=="6" (
    if "%GH_AVAILABLE%"=="0" (
        echo Requires GitHub CLI
        pause
        exit /b 1
    )
    
    echo.
    echo Open Pull Requests:
    echo ========================================
    gh pr list
    echo ========================================

) else if "%CHOICE%"=="7" (
    if "%GH_AVAILABLE%"=="0" (
        echo Requires GitHub CLI
        pause
        exit /b 1
    )
    
    echo.
    set /p "PR_NUM=Enter PR number: "
    if "!PR_NUM!"=="" (
        echo ERROR: PR number required
        pause
        exit /b 1
    )
    
    gh pr view !PR_NUM!

) else if "%CHOICE%"=="8" (
    if "%GH_AVAILABLE%"=="0" (
        echo Requires GitHub CLI
        pause
        exit /b 1
    )
    
    echo.
    gh pr list
    echo.
    
    set /p "PR_NUM=Enter PR number to merge: "
    if "!PR_NUM!"=="" (
        echo ERROR: PR number required
        pause
        exit /b 1
    )
    
    echo.
    echo Merge method:
    echo [1] Merge commit
    echo [2] Squash and merge
    echo [3] Rebase and merge
    set /p "MERGE_METHOD=Select (1-3): "
    
    if "!MERGE_METHOD!"=="1" (
        gh pr merge !PR_NUM! --merge
    ) else if "!MERGE_METHOD!"=="2" (
        gh pr merge !PR_NUM! --squash
    ) else if "!MERGE_METHOD!"=="3" (
        gh pr merge !PR_NUM! --rebase
    )

) else if "%CHOICE%"=="9" (
    if "%GH_AVAILABLE%"=="0" (
        echo Requires GitHub CLI
        pause
        exit /b 1
    )
    
    echo.
    set /p "PR_NUM=Enter PR number to review: "
    
    echo.
    echo Review action:
    echo [1] Approve
    echo [2] Request changes
    echo [3] Comment only
    set /p "REVIEW_ACTION=Select (1-3): "
    
    set /p "REVIEW_BODY=Enter review comment: "
    
    if "!REVIEW_ACTION!"=="1" (
        gh pr review !PR_NUM! --approve --body "!REVIEW_BODY!"
    ) else if "!REVIEW_ACTION!"=="2" (
        gh pr review !PR_NUM! --request-changes --body "!REVIEW_BODY!"
    ) else (
        gh pr review !PR_NUM! --comment --body "!REVIEW_BODY!"
    )

) else if "%CHOICE%"=="10" (
    if "%GH_AVAILABLE%"=="0" (
        echo Opening GitHub issues in browser...
        for /f "delims=" %%u in ('git remote get-url origin 2^>nul') do set "REMOTE_URL=%%u"
        set "REMOTE_URL=!REMOTE_URL:.git=!"
        start !REMOTE_URL!/issues/new
        pause
        exit /b 0
    )
    
    echo.
    set /p "ISSUE_TITLE=Enter issue title: "
    if "!ISSUE_TITLE!"=="" (
        echo ERROR: Title required
        pause
        exit /b 1
    )
    
    set /p "ISSUE_BODY=Enter issue description: "
    
    gh issue create --title "!ISSUE_TITLE!" --body "!ISSUE_BODY!"

) else if "%CHOICE%"=="11" (
    if "%GH_AVAILABLE%"=="0" (
        echo Requires GitHub CLI
        pause
        exit /b 1
    )
    
    echo.
    echo Open Issues:
    echo ========================================
    gh issue list
    echo ========================================

) else if "%CHOICE%"=="12" (
    if "%GH_AVAILABLE%"=="0" (
        echo Requires GitHub CLI
        pause
        exit /b 1
    )
    
    echo.
    set /p "ISSUE_NUM=Enter issue number: "
    gh issue view !ISSUE_NUM!

) else if "%CHOICE%"=="13" (
    if "%GH_AVAILABLE%"=="0" (
        echo Requires GitHub CLI
        pause
        exit /b 1
    )
    
    echo.
    set /p "ISSUE_NUM=Enter issue number to close: "
    gh issue close !ISSUE_NUM!
    echo Issue #!ISSUE_NUM! closed!

) else if "%CHOICE%"=="14" (
    if "%GH_AVAILABLE%"=="0" (
        echo Requires GitHub CLI
        pause
        exit /b 1
    )
    
    echo.
    echo Recent Workflow Runs:
    echo ========================================
    gh run list --limit 10
    echo ========================================

) else if "%CHOICE%"=="15" (
    if "%GH_AVAILABLE%"=="0" (
        echo Requires GitHub CLI
        pause
        exit /b 1
    )
    
    echo.
    set /p "RUN_ID=Enter run ID: "
    gh run view !RUN_ID!

) else if "%CHOICE%"=="16" (
    if "%GH_AVAILABLE%"=="0" (
        echo Requires GitHub CLI
        pause
        exit /b 1
    )
    
    echo.
    echo Available workflows:
    gh workflow list
    echo.
    
    set /p "WORKFLOW=Enter workflow name or ID: "
    gh workflow run !WORKFLOW!
    echo Workflow triggered!

) else if "%CHOICE%"=="17" (
    if "%GH_AVAILABLE%"=="0" (
        echo Opening GitHub releases in browser...
        for /f "delims=" %%u in ('git remote get-url origin 2^>nul') do set "REMOTE_URL=%%u"
        set "REMOTE_URL=!REMOTE_URL:.git=!"
        start !REMOTE_URL!/releases/new
        pause
        exit /b 0
    )
    
    echo.
    set /p "TAG_NAME=Enter tag name (e.g., v1.0.0): "
    set /p "RELEASE_TITLE=Enter release title: "
    set /p "RELEASE_NOTES=Enter release notes: "
    
    gh release create !TAG_NAME! --title "!RELEASE_TITLE!" --notes "!RELEASE_NOTES!"
    echo Release created!

) else if "%CHOICE%"=="18" (
    if "%GH_AVAILABLE%"=="0" (
        echo Requires GitHub CLI
        pause
        exit /b 1
    )
    
    echo.
    echo Releases:
    echo ========================================
    gh release list
    echo ========================================

) else if "%CHOICE%"=="19" (
    if "%GH_AVAILABLE%"=="0" (
        echo Requires GitHub CLI
        pause
        exit /b 1
    )
    
    echo.
    gh release list
    echo.
    
    set /p "TAG_NAME=Enter release tag to download: "
    gh release download !TAG_NAME!
    echo Assets downloaded!

) else if "%CHOICE%"=="20" (
    echo.
    echo Opening repository in browser...
    
    if "%GH_AVAILABLE%"=="1" (
        gh repo view --web
    ) else (
        for /f "delims=" %%u in ('git remote get-url origin 2^>nul') do set "REMOTE_URL=%%u"
        set "REMOTE_URL=!REMOTE_URL:.git=!"
        set "REMOTE_URL=!REMOTE_URL:git@github.com:=https://github.com/!"
        start !REMOTE_URL!
    )

) else if "%CHOICE%"=="21" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
pause
