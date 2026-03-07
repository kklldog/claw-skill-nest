param(
  [Parameter(Mandatory=$true)][ValidateSet('安装','更新','列出')] [string]$Command,
  [string]$SkillName
)

$SkillHubUrl = if ($env:SKILLHUB_URL) { $env:SKILLHUB_URL } else { 'http://localhost:17890' }
$ApiKey = if ($env:SKILLHUB_API_KEY) { $env:SKILLHUB_API_KEY } else { 'claw-skill-nest-secret-key' }
$SkillsDir = Join-Path $HOME '.openclaw/workspace/skills'
New-Item -ItemType Directory -Path $SkillsDir -Force | Out-Null

$headers = @{ 'X-API-Key' = $ApiKey }

switch ($Command) {
  '列出' {
    $skills = Invoke-RestMethod -Uri "$SkillHubUrl/api/skills" -Headers $headers -Method Get
    Write-Host 'Claw Skill Nest 上的可用 skills:'
    $skills | ForEach-Object { $_.name } | Sort-Object
  }

  '安装' {
    if (-not $SkillName) { throw '请提供 skill 名称' }
    Write-Host "正在从 Claw Skill Nest 安装 skill: $SkillName"

    $skills = Invoke-RestMethod -Uri "$SkillHubUrl/api/skills" -Headers $headers -Method Get
    $target = $skills | Where-Object { $_.name -eq $SkillName } | Select-Object -First 1
    if (-not $target) { throw "未找到名为 $SkillName 的 skill" }

    $skillDir = Join-Path $SkillsDir $SkillName
    New-Item -ItemType Directory -Path $skillDir -Force | Out-Null

    $tmpFile = Join-Path $env:TEMP ("$SkillName-" + [guid]::NewGuid().ToString() + '.bin')
    Invoke-WebRequest -Uri "$SkillHubUrl/api/skills/$($target.id)/download" -Headers $headers -OutFile $tmpFile

    try {
      Expand-Archive -Path $tmpFile -DestinationPath $skillDir -Force -ErrorAction Stop
    } catch {
      Copy-Item -Path $tmpFile -Destination (Join-Path $skillDir ([IO.Path]::GetFileName($tmpFile))) -Force
    }

    Remove-Item -Path $tmpFile -Force -ErrorAction SilentlyContinue
    Write-Host "Skill $SkillName 安装成功到 $skillDir"
  }

  '更新' {
    if (-not $SkillName) { throw '请提供 skill 名称' }
    & $PSCommandPath -Command '安装' -SkillName $SkillName
  }
}
