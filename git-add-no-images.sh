#!/bin/bash

# 只添加非图片文件的更改到 git 暂存区
# 排除常见的图片格式：jpg, jpeg, png, gif, webp, svg, ico, bmp, tiff

echo "正在添加非图片文件到暂存区..."

# 图片文件扩展名列表
IMAGE_EXTENSIONS="jpg|jpeg|png|gif|webp|svg|ico|bmp|tiff|tif|raw|psd|ai|eps"

# 获取所有修改的文件（包括未跟踪的文件）
{
    git ls-files -m
    git ls-files -o --exclude-standard
} | sort -u | while IFS= read -r file; do
    # 检查文件是否存在
    if [ -f "$file" ]; then
        # 获取文件扩展名
        extension="${file##*.}"
        extension_lower=$(echo "$extension" | tr '[:upper:]' '[:lower:]')

        # 如果不是图片文件，则添加
        if ! echo "$extension_lower" | grep -qE "^($IMAGE_EXTENSIONS)$"; then
            git add "$file"
            echo "添加: $file"
        fi
    fi
done

echo ""
echo "完成！已添加所有非图片文件"
echo ""
echo "暂存区状态："
git status --short
