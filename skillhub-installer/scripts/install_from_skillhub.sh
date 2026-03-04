#!/bin/bash

SKILLHUB_URL="${SKILLHUB_URL:-http://localhost:17890}"
SKILLHUB_API_KEY="${SKILLHUB_API_KEY:-skillhub-secret-key}"
SKILLS_DIR="$HOME/.openclaw/workspace/skills"

mkdir -p "$SKILLS_DIR"

command="$1"
shift

case "$command" in
  "安装")
    skill_name="$1"
    echo "正在从 SkillHub 安装 skill: $skill_name"
    
    skills=$(curl -s -H "X-API-Key: $SKILLHUB_API_KEY" "$SKILLHUB_URL/api/skills")
    skill_id=$(echo "$skills" | grep -o '"id":"[^"]*","name":"'"$skill_name"'"' | head -n1 | cut -d'"' -f4)
    
    if [ -z "$skill_id" ]; then
      echo "错误: 未找到名为 $skill_name 的 skill"
      exit 1
    fi
    
    skill_dir="$SKILLS_DIR/$skill_name"
    mkdir -p "$skill_dir"
    temp_file=$(mktemp)
    
    curl -s -H "X-API-Key: $SKILLHUB_API_KEY" -o "$temp_file" "$SKILLHUB_URL/api/skills/$skill_id/download"
    
    if [ -s "$temp_file" ]; then
      if echo "$temp_file" | grep -q "\.zip$"; then
        unzip -o "$temp_file" -d "$skill_dir"
      else
        cp "$temp_file" "$skill_dir/"
      fi
      echo "Skill $skill_name 安装成功到 $skill_dir"
      
      if command -v pkill &> /dev/null; then
        echo "尝试重启 gateway..."
        pkill -f "gateway" || true
      fi
    else
      echo "错误: 下载失败"
      rm -f "$temp_file"
      exit 1
    fi
    
    rm -f "$temp_file"
    ;;
  
  "更新")
    skill_name="$1"
    echo "正在更新 skill: $skill_name"
    "$0" "安装" "$skill_name"
    ;;
  
  "列出")
    echo "SkillHub 上的可用 skills:"
    curl -s -H "X-API-Key: $SKILLHUB_API_KEY" "$SKILLHUB_URL/api/skills" | grep -o '"name":"[^"]*"' | cut -d'"' -f4 | sort
    ;;
  
  *)
    echo "用法: $0 {安装|更新|列出} [skill名称]"
    exit 1
    ;;
esac
