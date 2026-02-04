@echo off
setlocal enabledelayedexpansion

echo ========================================
echo    Gitignore Manager
echo ========================================
echo.

cd /d "%~dp0.."

echo Select action:
echo.
echo [1] View current .gitignore
echo [2] Add pattern to .gitignore
echo [3] Remove pattern from .gitignore
echo [4] Generate .gitignore for project type
echo [5] Check if file is ignored
echo [6] List all ignored files
echo [7] Stop tracking ignored file
echo [8] Edit .gitignore
echo [9] Add to global gitignore
echo [10] View global gitignore
echo [11] Cancel
echo.
set /p "CHOICE=Enter choice (1-11): "

if "%CHOICE%"=="1" (
    echo.
    if exist ".gitignore" (
        echo Current .gitignore:
        echo ========================================
        type .gitignore
        echo.
        echo ========================================
    ) else (
        echo No .gitignore file found in this directory.
    )

) else if "%CHOICE%"=="2" (
    echo.
    echo Common patterns:
    echo   *.log          - Log files
    echo   node_modules/  - Node dependencies
    echo   .env           - Environment files
    echo   *.pyc          - Python compiled
    echo   __pycache__/   - Python cache
    echo   .DS_Store      - macOS files
    echo   Thumbs.db      - Windows thumbnails
    echo   *.bak          - Backup files
    echo   dist/          - Distribution folder
    echo   build/         - Build folder
    echo.
    
    set /p "PATTERN=Enter pattern to add: "
    if "!PATTERN!"=="" (
        echo ERROR: Pattern required
        pause
        exit /b 1
    )
    
    REM Check if pattern already exists
    if exist ".gitignore" (
        findstr /x "!PATTERN!" .gitignore >nul
        if not errorlevel 1 (
            echo Pattern already exists in .gitignore
            pause
            exit /b 0
        )
    )
    
    echo !PATTERN!>> .gitignore
    echo Pattern added: !PATTERN!

) else if "%CHOICE%"=="3" (
    if not exist ".gitignore" (
        echo No .gitignore file found.
        pause
        exit /b 1
    )
    
    echo.
    echo Current patterns:
    type .gitignore
    echo.
    
    set /p "PATTERN=Enter pattern to remove: "
    if "!PATTERN!"=="" (
        echo ERROR: Pattern required
        pause
        exit /b 1
    )
    
    findstr /v /x "!PATTERN!" .gitignore > .gitignore.tmp
    move /y .gitignore.tmp .gitignore >nul
    echo Pattern removed: !PATTERN!

) else if "%CHOICE%"=="4" (
    echo.
    echo Select project type:
    echo.
    echo [1] Node.js / JavaScript
    echo [2] Python
    echo [3] Java
    echo [4] C/C++
    echo [5] Go
    echo [6] Rust
    echo [7] .NET / C#
    echo [8] Ruby
    echo [9] PHP
    echo [10] Unity
    echo [11] Visual Studio
    echo [12] JetBrains IDEs
    echo.
    set /p "PROJECT_TYPE=Select (1-12): "
    
    if "!PROJECT_TYPE!"=="1" (
        (
            echo # Node.js
            echo node_modules/
            echo npm-debug.log*
            echo yarn-debug.log*
            echo yarn-error.log*
            echo .npm
            echo .yarn
            echo dist/
            echo build/
            echo .env
            echo .env.*
            echo !.env.example
            echo coverage/
            echo .nyc_output/
        ) >> .gitignore
        echo Node.js patterns added!
    ) else if "!PROJECT_TYPE!"=="2" (
        (
            echo # Python
            echo __pycache__/
            echo *.py[cod]
            echo *$py.class
            echo *.so
            echo .Python
            echo venv/
            echo env/
            echo .env
            echo .venv
            echo pip-log.txt
            echo .pytest_cache/
            echo .coverage
            echo htmlcov/
            echo .mypy_cache/
        ) >> .gitignore
        echo Python patterns added!
    ) else if "!PROJECT_TYPE!"=="3" (
        (
            echo # Java
            echo *.class
            echo *.jar
            echo *.war
            echo *.ear
            echo target/
            echo .gradle/
            echo build/
            echo out/
            echo .idea/
            echo *.iml
        ) >> .gitignore
        echo Java patterns added!
    ) else if "!PROJECT_TYPE!"=="4" (
        (
            echo # C/C++
            echo *.o
            echo *.obj
            echo *.exe
            echo *.dll
            echo *.so
            echo *.a
            echo *.lib
            echo *.dylib
            echo build/
            echo cmake-build-*/
        ) >> .gitignore
        echo C/C++ patterns added!
    ) else if "!PROJECT_TYPE!"=="5" (
        (
            echo # Go
            echo *.exe
            echo *.exe~
            echo *.dll
            echo *.so
            echo *.dylib
            echo *.test
            echo *.out
            echo vendor/
        ) >> .gitignore
        echo Go patterns added!
    ) else if "!PROJECT_TYPE!"=="6" (
        (
            echo # Rust
            echo /target/
            echo Cargo.lock
            echo **/*.rs.bk
        ) >> .gitignore
        echo Rust patterns added!
    ) else if "!PROJECT_TYPE!"=="7" (
        (
            echo # .NET
            echo bin/
            echo obj/
            echo *.user
            echo *.suo
            echo .vs/
            echo packages/
            echo *.nupkg
        ) >> .gitignore
        echo .NET patterns added!
    ) else if "!PROJECT_TYPE!"=="8" (
        (
            echo # Ruby
            echo *.gem
            echo *.rbc
            echo .bundle/
            echo vendor/bundle
            echo Gemfile.lock
            echo coverage/
            echo .rspec_status
        ) >> .gitignore
        echo Ruby patterns added!
    ) else if "!PROJECT_TYPE!"=="9" (
        (
            echo # PHP
            echo /vendor/
            echo composer.lock
            echo .phpunit.result.cache
            echo *.log
        ) >> .gitignore
        echo PHP patterns added!
    ) else if "!PROJECT_TYPE!"=="10" (
        (
            echo # Unity
            echo /[Ll]ibrary/
            echo /[Tt]emp/
            echo /[Oo]bj/
            echo /[Bb]uild/
            echo /[Bb]uilds/
            echo /[Ll]ogs/
            echo *.csproj
            echo *.unityproj
            echo *.sln
        ) >> .gitignore
        echo Unity patterns added!
    ) else if "!PROJECT_TYPE!"=="11" (
        (
            echo # Visual Studio
            echo .vs/
            echo *.user
            echo *.suo
            echo *.userosscache
            echo *.sln.docstates
            echo [Dd]ebug/
            echo [Rr]elease/
            echo x64/
            echo x86/
        ) >> .gitignore
        echo Visual Studio patterns added!
    ) else if "!PROJECT_TYPE!"=="12" (
        (
            echo # JetBrains
            echo .idea/
            echo *.iml
            echo *.iws
            echo out/
            echo .idea_modules/
        ) >> .gitignore
        echo JetBrains patterns added!
    ) else (
        echo Invalid selection.
    )
    
    REM Add common OS patterns
    (
        echo.
        echo # OS generated
        echo .DS_Store
        echo .DS_Store?
        echo Thumbs.db
        echo ehthumbs.db
        echo Desktop.ini
    ) >> .gitignore
    echo Common OS patterns added!

) else if "%CHOICE%"=="5" (
    echo.
    set /p "FILE_PATH=Enter file path to check: "
    if "!FILE_PATH!"=="" (
        echo ERROR: File path required
        pause
        exit /b 1
    )
    
    echo.
    git check-ignore -v "!FILE_PATH!"
    if errorlevel 1 (
        echo File is NOT ignored
    )

) else if "%CHOICE%"=="6" (
    echo.
    echo Ignored files:
    echo ========================================
    git status --ignored --porcelain | findstr "^!!"
    echo ========================================

) else if "%CHOICE%"=="7" (
    echo.
    set /p "FILE_PATH=Enter file path to stop tracking: "
    if "!FILE_PATH!"=="" (
        echo ERROR: File path required
        pause
        exit /b 1
    )
    
    git rm --cached "!FILE_PATH!"
    
    if errorlevel 1 (
        echo ERROR: Failed to stop tracking
    ) else (
        echo File removed from tracking: !FILE_PATH!
        echo Don't forget to add it to .gitignore!
    )

) else if "%CHOICE%"=="8" (
    if not exist ".gitignore" (
        echo. > .gitignore
    )
    notepad .gitignore

) else if "%CHOICE%"=="9" (
    echo.
    set /p "PATTERN=Enter pattern for global gitignore: "
    if "!PATTERN!"=="" (
        echo ERROR: Pattern required
        pause
        exit /b 1
    )
    
    set "GLOBAL_IGNORE=%USERPROFILE%\.gitignore_global"
    echo !PATTERN!>> "!GLOBAL_IGNORE!"
    git config --global core.excludesfile "!GLOBAL_IGNORE!"
    echo Pattern added to global gitignore!

) else if "%CHOICE%"=="10" (
    echo.
    set "GLOBAL_IGNORE=%USERPROFILE%\.gitignore_global"
    if exist "!GLOBAL_IGNORE!" (
        echo Global gitignore:
        echo ========================================
        type "!GLOBAL_IGNORE!"
        echo ========================================
    ) else (
        echo No global gitignore configured.
    )

) else if "%CHOICE%"=="11" (
    echo Operation cancelled.
    pause
    exit /b 0
) else (
    echo Invalid choice.
)

echo.
pause
