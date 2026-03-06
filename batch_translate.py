import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    # Simple static replacements for common strings inside JSX
    replacements = {
        r'>Previous<': r'>{t(\'common.previous\')}<',
        r'>Next<': r'>{t(\'common.next\')}<',
        r'>Save<': r'>{t(\'common.save\')}<',
        r'>Cancel<': r'>{t(\'common.cancel\')}<',
        r'>Delete<': r'>{t(\'common.delete\')}<',
        r'>Edit<': r'>{t(\'common.edit\')}<',
        r'>View<': r'>{t(\'common.view\')}<',
        r'>Back<': r'>{t(\'common.back\')}<',
        r'>Submit<': r'>{t(\'common.submit\')}<',
        r'>Search<': r'>{t(\'common.search\')}<',
    }

    modified = False
    for pattern, rep in replacements.items():
        if re.search(pattern, content):
            content = re.sub(pattern, rep, content)
            modified = True

    if modified:
        # Check if useTranslation is imported
        if 'useTranslation' not in content:
            # Insert import after react or inertia imports
            import_statement = "import { useTranslation } from 'react-i18next';\n"
            
            # Find last import
            last_import_idx = content.rfind('import')
            if last_import_idx != -1:
                end_of_line = content.find('\n', last_import_idx)
                content = content[:end_of_line+1] + import_statement + content[end_of_line+1:]
            else:
                content = import_statement + content

        # Check if t is instantiated in the component
        # We need a robust way, but simple regex might work for some
        # Find default export function Name(
        func_match = re.search(r'export default function (\w+)\s*\([^)]*\)\s*\{', content)
        if func_match and 'const { t } = useTranslation();' not in content:
            func_end = func_match.end()
            content = content[:func_end] + "\n    const { t } = useTranslation();" + content[func_end:]

        if original != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")

for root, dirs, files in os.walk('resources/js'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))
