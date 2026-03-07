# Local SkillHub Installer

用于 **本地/私有 Agile Skill Hub** 的 skill 安装器。

> 边界说明：
> - 本技能仅面向 **本地（local）SkillHub**。
> - 不用于 ClawHub 公共仓库（clawhub.com）。

## 环境变量

- `SKILLHUB_URL` - 本地 SkillHub 服务地址（例如 `http://localhost:17890`）
- `SKILLHUB_API_KEY` - 本地 SkillHub API Key

## 推荐触发语（强调本地语义）

- `安装本地 skill <name>` / `install local skill <name>`
- `更新本地 skill <name>` / `update local skill <name>`
- `列出本地 skill` / `list local skills`
- `从本地 skillhub 安装 <name>`
- `从 local skillhub 更新 <name>`

## 安装位置

Skills 将安装到 `~/.openclaw/workspace/skills/<name>`
