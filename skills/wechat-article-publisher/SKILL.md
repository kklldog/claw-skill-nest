---
name: wechat-article-publisher
description: Prepare WeChat Official Account (公众号) article publishing pre-steps through mdnice and mp.weixin.qq.com browser automation. Use when user asks to publish to 公众号 and wants automatic content prep: import article, apply default theme 青兰, copy to WeChat format, open WeChat backend new-article page, and fill article title. Stop before final manual publishing steps.
---

# wechat-article-publisher

## Defaults

- Default mdnice theme: **青兰**
- Automation scope: **only pre-publish preparation**
- WeChat backend scope: **open new article editor and fill title only**
- Everything after that is handled manually by user

## Workflow

1. Prepare source article.
   - Read article content from provided file/path.
   - Use H1 or filename as title unless user gives a title.

2. Open mdnice editor.
   - Navigate to `https://editor.mdnice.com/`.
   - If login required or editor disabled, ask user to log in.

3. Import article in mdnice.
   - Create/open article draft.
   - Fill title + body.
   - Apply theme **青兰** by default (unless user overrides).

4. Copy to WeChat format.
   - Click mdnice toolbar action **复制到公众号**.
   - If unrelated distribution modal appears, close it and continue.

5. Open WeChat backend.
   - Navigate to `https://mp.weixin.qq.com/`.
   - If login QR appears, send screenshot and wait for user confirmation.

6. Enter new article editor.
   - Click **新的创作 → 文章** to open the new publishing editor.
   - Fill only the article title.

7. Stop and handoff.
   - Tell user that pre-publish setup is done.
   - Explicitly state: subsequent steps (body check/cover/declaration/publish/verification) are manual.

## Interaction rules

- Pause whenever a human-only step appears (login QR, security verification, admin approval).
- Give short progress updates: `mdnice已完成` / `已复制到公众号格式` / `已打开新建发表页并填好标题`.
- Do not auto-click final publish actions in this skill.

## Failure handling

- If browser control fails temporarily, inform user and retry after recovery.
- If UI labels differ, locate semantically equivalent controls (e.g., 新的创作, 文章).
- If user later wants full automation (including final publish), require explicit opt-in and run that as a separate instruction.
