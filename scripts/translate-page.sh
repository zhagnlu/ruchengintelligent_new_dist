#!/bin/bash

# 自动翻译页面脚本
# 使用方法: ./translate-page.sh <html-file-path>

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 检查是否提供了文件路径参数
if [ $# -eq 0 ]; then
    echo "错误: 请提供HTML文件路径"
    echo ""
    echo "使用方法:"
    echo "  ./translate-page.sh <html-file-path>"
    echo ""
    echo "示例:"
    echo "  ./translate-page.sh product/bending_machine/new-product.html"
    echo "  ./translate-page.sh ../product.html"
    exit 1
fi

# 运行Node.js翻译脚本
node "$SCRIPT_DIR/auto-generate-translations.js" "$1"
