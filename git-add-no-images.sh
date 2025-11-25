#!/bin/bash

# 只添加非图片文件的更改到 git 暂存区
# 排除常见的图片格式：jpg, jpeg, png, gif, webp, svg, ico, bmp, tiff

echo "正在添加非图片文件到暂存区..."

# 添加常见的非图片文件类型
git add '*.html' '*.htm' \
        '*.css' '*.scss' '*.sass' '*.less' \
        '*.js' '*.jsx' '*.ts' '*.tsx' '*.mjs' '*.cjs' \
        '*.json' '*.xml' '*.yaml' '*.yml' \
        '*.txt' '*.md' '*.markdown' \
        '*.sh' '*.bash' '*.zsh' \
        '*.py' '*.rb' '*.php' '*.java' '*.c' '*.cpp' '*.h' \
        '*.sql' '*.env.example' \
        '*.config' '*.conf' \
        'Makefile' 'Dockerfile' '.gitignore' '.dockerignore' 2>/dev/null

echo "完成！已添加所有非图片文件"
echo ""
echo "暂存区状态："
git status --short | grep '^[AM]'
