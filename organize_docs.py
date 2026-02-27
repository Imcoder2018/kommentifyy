import os
import shutil
import pathspec

# Configuration
SOURCE_DIR = os.getcwd()
DEST_DIR_NAME = 'doc-md'
DEST_DIR = os.path.join(SOURCE_DIR, DEST_DIR_NAME)

def load_gitignore_spec(folder_path):
    """
    Reads a .gitignore file in the specific folder if it exists 
    and returns a pathspec object.
    """
    gitignore_path = os.path.join(folder_path, '.gitignore')
    if os.path.isfile(gitignore_path):
        try:
            with open(gitignore_path, 'r', encoding='utf-8') as f:
                return pathspec.PathSpec.from_lines('gitwildmatch', f)
        except Exception as e:
            # Silently ignore read errors or encoding issues
            pass
    return None

def move_md_files():
    """
    Walks the directory, finds .md files, and moves them 
    to doc-md preserving structure.
    """
    print(f"--- Starting Migration to '{DEST_DIR_NAME}' ---")
    
    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR)

    files_moved = 0

    for root, dirs, files in os.walk(SOURCE_DIR):
        # Prevent walking into the destination directory itself
        if DEST_DIR_NAME in dirs:
            dirs.remove(DEST_DIR_NAME)

        for file in files:
            if file.endswith('.md'):
                rel_path = os.path.relpath(root, SOURCE_DIR)
                target_folder = os.path.join(DEST_DIR, rel_path)
                
                if not os.path.exists(target_folder):
                    os.makedirs(target_folder)
                
                src_file = os.path.join(root, file)
                dst_file = os.path.join(target_folder, file)
                
                try:
                    shutil.move(src_file, dst_file)
                    print(f"Moved: {os.path.join(rel_path, file)}")
                    files_moved += 1
                except Exception as e:
                    print(f"Error moving {src_file}: {e}")

    print(f"--- Migration Complete. {files_moved} files moved. ---\n")

def list_files_recursive(current_dir, parent_spec=None):
    """
    Recursively lists files/folders, respecting nested .gitignore files.
    """
    # 1. Load local .gitignore
    local_spec = load_gitignore_spec(current_dir)
    
    # 2. Merge specs (Parent rules + Local rules)
    current_specs = []
    if parent_spec:
        current_specs.extend(parent_spec)
    if local_spec:
        current_specs.append(local_spec)

    try:
        items = os.listdir(current_dir)
    except PermissionError:
        return 

    dirs = []
    files = []
    
    for item in sorted(items):
        full_path = os.path.join(current_dir, item)
        is_dir = os.path.isdir(full_path)

        # Always explicitly ignore .git and the output folder
        if item == '.git' or item == DEST_DIR_NAME:
            continue

        # --- FIX START: correctly handle folder/ patterns ---
        # If it's a directory, append '/' so 'node_modules/' pattern matches 'node_modules'
        name_to_check = item + "/" if is_dir else item
        
        is_ignored = False
        if current_specs:
            for spec in current_specs:
                if spec.match_file(name_to_check):
                    is_ignored = True
                    break
        # --- FIX END ---
        
        if is_ignored:
            continue

        if is_dir:
            dirs.append(item)
        else:
            files.append(item)

    # Log current directory contents
    rel_path = os.path.relpath(current_dir, SOURCE_DIR)
    if rel_path == '.': 
        rel_path = "[ROOT]"
    
    print(f"📁 {rel_path}")
    for f in files:
        print(f"   📄 {f}")
    
    # Recurse into subdirectories
    for d in dirs:
        list_files_recursive(os.path.join(current_dir, d), current_specs)

if __name__ == "__main__":
    # 1. Execute the Move
    move_md_files()

    # 2. Execute the Log (Now correctly respecting .gitignore)
    print("--- Project Structure (Clean) ---")
    list_files_recursive(SOURCE_DIR)