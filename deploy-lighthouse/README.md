# 透明岗途 — Lighthouse 云端数据库部署指南

## 一、上传文件到 Lighthouse

将以下文件上传到你的 Lighthouse 服务器（假设路径 `/opt/lighthouse-api/`）：

```
deploy-lighthouse/
├── server-cloud.cjs    ← 编译后的后端服务器
├── package.json        ← 运行依赖
└── start.sh            ← 启动脚本
```

### 上传方式（任选其一）

**方式1：SCP 上传**
```bash
scp -r deploy-lighthouse/* root@<你的Lighthouse IP>:/opt/lighthouse-api/
```

**方式2：在 Lighthouse 上用 git 拉取**  
先 push 到 git，再在 Lighthouse 上 git clone

---

## 二、在 Lighthouse 上安装依赖

SSH 登录 Lighthouse 后：

```bash
cd /opt/lighthouse-api
npm install
```

---

## 三、启动服务器

### 方式1：直接启动（测试用）
```bash
node server-cloud.cjs
```

### 方式2：使用 PM2 持久化运行（推荐）
```bash
# 安装 PM2（如果没有）
npm install -g pm2

# 启动
pm2 start server-cloud.cjs --name lighthouse-api

# 开机自启
pm2 save
pm2 startup
```

### 方式3：后台运行
```bash
nohup node server-cloud.cjs > api.log 2>&1 &
```

---

## 四、配置防火墙

Lighthouse 默认不开放 3000 端口，需要到腾讯云控制台配置：

1. 登录 [腾讯云轻量应用服务器控制台](https://console.cloud.tencent.com/lighthouse)
2. 选择你的实例 → 防火墙
3. 添加规则：TCP / 3000 / 0.0.0.0/0

---

## 五、验证服务

```bash
# 在 Lighthouse 上测试
curl http://localhost:3000/api/health

# 从外网测试
curl http://<你的 Lighthouse 公网 IP>:3000/api/health
```

预期返回：
```json
{
  "status": "ok",
  "uptime": 1.23,
  "database": "lighthouse_data.db",
  "dbSize": "12.3 KB",
  "records": { "candidates": 4, "complaints": 1 }
}
```

---

## 六、配置前端连接云端

拿到 Lighthouse 的公网 IP 后，更新前端的 API 地址：

### 方式1：环境变量（需重新构建部署）
在 `.env` 中设置：
```
VITE_API_BASE_URL=http://<你的Lighthouse公网IP>:3000
```
然后 `npm run build && tcb hosting deploy dist -e hank89757`

### 方式2：浏览器运行时配置（无需重新部署）
打开网站后，在浏览器控制台执行：
```js
// 以后打开网站都会自动连接这个地址
localStorage.setItem('lighthouse_api_base', 'http://<你的Lighthouse公网IP>:3000');
location.reload();
```

### 方式3：反向代理（推荐生产环境）
使用 Nginx 反向代理，配置 HTTPS 域名：
```nginx
server {
    listen 443 ssl;
    server_name api.your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 七、数据库文件

所有数据存储在 `lighthouse_data.db`（SQLite 文件）中。
- 位置：`/opt/lighthouse-api/lighthouse_data.db`
- 定期备份：`cp lighthouse_data.db lighthouse_data_backup_$(date +%Y%m%d).db`

---

## 常见问题

### Q: 如何查看运行日志？
```bash
# PM2 日志
pm2 logs lighthouse-api

# nohup 日志
tail -f /opt/lighthouse-api/api.log
```

### Q: 如何重启服务？
```bash
pm2 restart lighthouse-api
```

### Q: 数据会丢吗？
SQLite 数据文件 `lighthouse_data.db` 持久化在磁盘，重启不丢失。
建议定期备份到其他位置。

### Q: 多人同时访问有问题吗？
SQLite 支持并发读，Express 的写操作是串行的（Node.js 单线程），
小规模使用（<100并发）没有问题。
高并发场景可后续升级到 MySQL/PostgreSQL。
