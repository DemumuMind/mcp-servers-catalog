#!/usr/bin/env python3
"""Transform console.log calls to process.stdout.write in scripts/*.ts files."""

import re
import os
import glob

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))

def transform_console_log(content: str, filepath: str) -> str:
    """Transform all console.log calls in the content to process.stdout.write."""
    lines = content.split('\n')
    result = []
    changed = False
    
    for line in lines:
        new_line = transform_line(line, filepath)
        if new_line != line:
            changed = True
        result.append(new_line)
    
    return '\n'.join(result), changed

def transform_line(line: str, filepath: str) -> str:
    """Transform a single line's console.log call."""
    stripped = line.lstrip()
    indent = line[:len(line) - len(stripped)]
    
    # lib.ts scriptLog needs special handling: spread args → args.join()
    if filepath.endswith('lib.ts') and "console.log('[script]', ...args)" in line:
        return line.replace("console.log('[script]', ...args)", 
                           "process.stdout.write(`[script] ${args.join(' ')}\\n`)")
    
    # Handle multi-argument console.log calls
    # Pattern: console.log('prefix', var1, var2, ...)
    multi_arg = match_multi_arg_console_log(stripped)
    if multi_arg:
        prefix, args = multi_arg
        transformed = convert_multi_arg_to_stdout(prefix, args)
        return indent + transformed
    
    # Handle single-argument template literal: console.log(`...`)
    tmpl_match = re.match(r"console\.log\(`(.*)`\)", stripped)
    if tmpl_match:
        inner = tmpl_match.group(1)
        return indent + f"process.stdout.write(`{inner}\\n`)"
    
    # Handle single-argument string: console.log('...')
    str_match = re.match(r"console\.log\('(.*)'\)", stripped)
    if str_match:
        inner = str_match.group(1)
        # Escape any single quotes in the replacement... but the original had them fine
        return indent + f"process.stdout.write('{inner}\\n')"
    
    # Handle single-argument string with double quotes: console.log("...")
    str2_match = re.match(r'console\.log\("(.*)"\)', stripped)
    if str2_match:
        inner = str2_match.group(1)
        return indent + f'process.stdout.write("{inner}\\n")'
    
    return line

def match_multi_arg_console_log(stripped: str):
    """Match console.log('prefix', arg1, arg2, ...) and return (prefix, [args])."""
    # Try: console.log('prefix', arg1, arg2)
    m = re.match(r"console\.log\('([^']*)',\s*(.*)\)", stripped)
    if m:
        prefix = m.group(1)
        args_str = m.group(2)
        args = split_args(args_str)
        return prefix, args
    
    # Try: console.log("prefix", arg1, arg2)  
    m = re.match(r'console\.log\("([^"]*)",\s*(.*)\)', stripped)
    if m:
        prefix = m.group(1)
        args_str = m.group(2)
        args = split_args(args_str)
        return prefix, args
    
    return None

def split_args(args_str: str) -> list:
    """Split comma-separated arguments, respecting parentheses and brackets."""
    args = []
    depth = 0
    current = ''
    for ch in args_str:
        if ch in '([{':
            depth += 1
            current += ch
        elif ch in ')]}':
            depth -= 1
            current += ch
        elif ch == ',' and depth == 0:
            args.append(current.strip())
            current = ''
        else:
            current += ch
    if current.strip():
        args.append(current.strip())
    return args

def convert_multi_arg_to_stdout(prefix: str, args: list) -> str:
    """Convert console.log('prefix', arg1, arg2) to process.stdout.write(`prefix ${arg1} ${arg2}\n`)."""
    # console.log('prefix', arg1, arg2) → process.stdout.write(`prefix ${arg1} ${arg2}\n`)
    parts = [prefix]
    for arg in args:
        # Check if it's already a template expression that needs wrapping
        if '${' in arg:
            # It's inside a template literal already - this is tricky
            # Just use string concatenation approach
            parts.append('${' + arg + '}')
        else:
            parts.append('${' + arg + '}')
    
    template = ' '.join(parts)
    return f"process.stdout.write(`{template}\\n`)"

def main():
    ts_files = sorted(glob.glob(os.path.join(SCRIPTS_DIR, '*.ts')))
    # Exclude this script
    ts_files = [f for f in ts_files if not f.endswith('fix_console_log.py')]
    
    total_changes = 0
    for filepath in ts_files:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        new_content, changed = transform_console_log(content, filepath)
        
        if changed:
            # Count how many console.log calls were changed
            old_count = content.count('console.log(')
            new_count = new_content.count('console.log(')
            diff = old_count - new_count
            total_changes += diff
            print(f"  {os.path.basename(filepath)}: {diff} console.log calls fixed")
            
            with open(filepath, 'w', encoding='utf-8', newline='') as f:
                f.write(new_content)
        else:
            # Check if it had console.log calls that we missed
            if 'console.log(' in content:
                print(f"  WARNING: {os.path.basename(filepath)} has console.log but no changes made!")
    
    print(f"\nTotal console.log calls transformed: {total_changes}")

if __name__ == '__main__':
    main()
