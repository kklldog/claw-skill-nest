# SkillHub Installer

从 SkillHub 安装、更新、列出 Skills

## 环境变量

- `SKILLHUB_URL` - SkillHub 服务地址（例如 http://localhost:17890）
- `SKILLHUB_API_KEY` - SkillHub API Key

## 触发器

- `安装 skill <name>` - 安装指定名称的 skill
- `更新 skill <name>` - 更新指定名称的 skill
- `列出 skillhub skills` - 列出 SkillHub 上所有可用的 skills

## 安装位置

Skills 将安装到 `~/.openclaw/workspace/skills/<name>`
