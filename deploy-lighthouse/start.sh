#!/bin/bash
# 透明岗途 — Lighthouse 云端服务器启动脚本

cd "$(dirname "$0")"

# 安装依赖（首次运行）
if [ ! -d "node_modules" ]; then
    echo ">>> 安装依赖..."
    npm install
fi

echo ">>> 启动云端数据库服务器..."
node server-cloud.cjs
