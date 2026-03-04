# Agile Skill Hub

OpenClaw 内部 Skill 管理中心

## 功能特性

- Express 后端 + 静态 HTML 管理界面
- API Key 认证（X-API-Key 请求头）
- Skill 上传、下载、删除、列表
- 支持 .skill 和 .zip 文件
- 磁盘存储 + JSON 元数据持久化

## 快速开始

### 本地运行

```bash
cd agile-skill-hub
npm install
npm start
```

访问 http://localhost:17890

### 一键脚本（推荐）

```bash
cd agile-skill-hub
./start.sh   # 一键启动
./stop.sh    # 一键关闭
```

- `start.sh` 优先使用 Docker Compose；若不可用则自动回退到 Node.js 模式。
- `stop.sh` 会关闭 Docker 服务，并尝试停止 Node.js 后台进程。

### Docker Compose 运行

```bash
docker-compose up -d
```

服务将在 http://localhost:17890 启动，数据存储在 `skillhub_data` 持久卷中。

## API 文档

### 认证
所有 /api 端点需要在请求头中包含 `X-API-Key`。

### 端点
- `GET /api/skills` - 获取所有 skills
- `POST /api/skills/upload` - 上传新 skill（multipart/form-data，file 字段）
- `GET /api/skills/:id` - 获取单个 skill 信息
- `DELETE /api/skills/:id` - 删除 skill
- `GET /api/skills/:id/download` - 下载 skill 文件

## 环境变量

- `PORT` - 服务端口（默认 17890）
- `API_KEY` - API 认证密钥（默认 skillhub-secret-key）
