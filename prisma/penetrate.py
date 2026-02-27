import os
import pathspec
from pathlib import Path

# --- CONFIGURATION ---
OUTPUT_FILE = "PROJECT_CODEBASE.md"

# Files extensions to ignore (Non-code files)
IGNORED_EXTENSIONS = {
    # Documentation & Text
    '.md', '.txt', '.rst', '.pdf', '.doc', '.docx', '.log', '.csv', '.bat',
    # Images & Media
    '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.svg', '.ico', '.mp3', '.mp4',
    # Archives & Binaries
    '.zip', '.tar', '.gz', '.7z', '.rar', '.exe', '.dll', '.so', '.dylib', '.bin',
    # Compiled/Cache
    '.pyc', '.class', '.o', '.obj', '.db', '.sqlite', '.sqlite3'
}

# Directories to always ignore (in addition to .gitignore)
IGNORED_DIRS = {'.git', '__pycache__', 'node_modules', 'venv', '.env', '.idea', '.vscode', '.vercel', '.trigger','action-scheduler'}

def load_gitignore(root_dir):
    """
    Loads .gitignore patterns from the root directory.
    """
    gitignore_path = os.path.join(root_dir, '.gitignore')
    if os.path.exists(gitignore_path):
        with open(gitignore_path, 'r') as f:
            return pathspec.PathSpec.from_lines('gitwildmatch', f)
    return None

def is_ignored(rel_path, spec):
    """
    Checks if a file matches .gitignore rules or our custom exclusion lists.
    """
    path_obj = Path(rel_path)
    
    # 1. Check strict directory excludes
    for part in path_obj.parts:
        if part in IGNORED_DIRS:
            return True

    # 2. Check extension blacklist
    if path_obj.suffix.lower() in IGNORED_EXTENSIONS:
        return True

    # 3. Check .gitignore (if it exists)
    if spec and spec.match_file(rel_path):
        return True

    return False

def generate_tree(file_list):
    """
    Generates a directory tree string for the Table of Contents.
    """
    tree_str = "## 1. Project Structure\n\n```text\n"
    tree_str += ".\n"
    
    # Sort files to ensure folders come before files or alphabetical order
    file_list.sort()
    
    for path in file_list:
        parts = path.split(os.sep)
        indent = "    " * (len(parts) - 1)
        tree_str += f"{indent}├── {parts[-1]}\n"
        
    tree_str += "```\n\n"
    return tree_str

def get_file_content(filepath, rel_path):
    """
    Reads file content and returns formatted markdown block.
    """
    try:
        # Try reading as UTF-8
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Determine language for syntax highlighting
        ext = Path(filepath).suffix.lstrip('.')
        lang_map = {
            'py': 'python', 'js': 'javascript', 'ts': 'typescript',
            'html': 'html', 'css': 'css', 'json': 'json', 'rs': 'rust',
            'java': 'java', 'c': 'c', 'cpp': 'cpp', 'sh': 'bash'
        }
        lang = lang_map.get(ext, '')

        return (
            f"### {rel_path}\n\n"
            f"```{lang}\n"
            f"{content}\n"
            f"```\n\n"
            f"---\n\n"
        )
    except Exception as e:
        return f"> Error reading file {rel_path}: {str(e)}\n\n---\n\n"

def main():
    root_dir = os.getcwd()
    gitignore_spec = load_gitignore(root_dir)
    
    valid_files = []
    
    print(f"Scanning directory: {root_dir}...")
    
    # Walk through the directory
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Modify dirnames in-place to skip ignored directories efficiently
        dirnames[:] = [d for d in dirnames if d not in IGNORED_DIRS]
        
        # Also skip .git folder specifically if it wasn't caught
        if '.git' in dirnames:
            dirnames.remove('.git')

        for filename in filenames:
            abs_path = os.path.join(dirpath, filename)
            rel_path = os.path.relpath(abs_path, root_dir)
            
            # Skip the script itself and the output file
            if filename == os.path.basename(__file__) or filename == OUTPUT_FILE:
                continue

            if not is_ignored(rel_path, gitignore_spec):
                valid_files.append(rel_path)

    print(f"Found {len(valid_files)} valid code files.")
    
    # Write the Markdown file
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as md_file:
        md_file.write(f"# Project Codebase: {os.path.basename(root_dir)}\n\n")
        
        # Section 1: Table of Contents / Structure
        md_file.write(generate_tree(valid_files))
        
        # Section 2: File Contents
        md_file.write("## 2. File Contents\n\n")
        
        for rel_path in valid_files:
            abs_path = os.path.join(root_dir, rel_path)
            content_block = get_file_content(abs_path, rel_path)
            md_file.write(content_block)
            
    print(f"Successfully generated: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()