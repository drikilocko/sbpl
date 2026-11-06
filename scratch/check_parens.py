import os

def check_balance(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    lines = content.split('\n')
    for i, line in enumerate(lines):
        for char in line:
            if char == '(':
                stack.append(('(', i+1))
            elif char == ')':
                if not stack:
                    print(f"Unbalanced ) at {filepath}:{i+1}")
                else:
                    stack.pop()
    
    for char, line_num in stack:
        print(f"Unbalanced ( at {filepath}:{line_num}")

files = [
    r"c:\Users\HP ProBook\OneDrive\Desktop\spbl\index.html",
    r"c:\Users\HP ProBook\OneDrive\Desktop\spbl\app.js",
    r"c:\Users\HP ProBook\OneDrive\Desktop\index (2).html",
    r"c:\Users\HP ProBook\OneDrive\Desktop\index.html"
]

for f in files:
    if os.path.exists(f):
        print(f"Checking {f}...")
        check_balance(f)
