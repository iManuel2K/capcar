[CmdletBinding()]
param([string]$ProjectPath = "E:\capcar", [switch]$SkipChecks)
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"
$project = [IO.Path]::GetFullPath($ProjectPath).TrimEnd('\', '/')
if ($project -eq [IO.Path]::GetPathRoot($project).TrimEnd('\', '/')) { throw "Select the project folder, not a drive root." }
if ((Get-Content -LiteralPath (Join-Path $project 'package.json') -Raw | ConvertFrom-Json).name -ne 'capcar') { throw "Not a Capcar project." }
$entries = @(Get-Content -LiteralPath (Join-Path $PSScriptRoot 'manifest.json') -Raw | ConvertFrom-Json)
function Text-Hash([string]$Path) {
    $bytes = [Text.Encoding]::UTF8.GetBytes([IO.File]::ReadAllText($Path).Replace("`r`n", "`n"))
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant() }
    finally { $sha.Dispose() }
}
# Validate every target before backing up or modifying anything.
foreach ($entry in $entries) {
    $relative = [string]$entry.path
    if ($relative -notmatch '^[a-zA-Z0-9_./-]+$' -or $relative -match '(^|/)\.\.(/|$)' -or [IO.Path]::IsPathRooted($relative)) { throw "Unsafe payload path." }
    $source = Join-Path (Join-Path $PSScriptRoot 'payload') $relative
    if ((Get-FileHash -LiteralPath $source -Algorithm SHA256).Hash.ToLowerInvariant() -ne $entry.sha256) { throw "Damaged payload: $relative" }
    $target = Join-Path $project $relative
    $ancestor = $target
    while ($ancestor -and $ancestor.Length -ge $project.Length) {
        if ((Test-Path -LiteralPath $ancestor) -and ((Get-Item -LiteralPath $ancestor -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw "Linked target path is not supported: $ancestor" }
        $ancestor = Split-Path -Parent $ancestor
    }
    if (Test-Path -LiteralPath $target) {
        if (-not (Test-Path -LiteralPath $target -PathType Leaf)) { throw "Target is not a file: $relative" }
        $actual = (Get-FileHash -LiteralPath $target -Algorithm SHA256).Hash.ToLowerInvariant()
        if ($actual -ne $entry.sha256 -and @($entry.baseHashes) -notcontains (Text-Hash $target)) {
            throw "Local version differs from the supplied baseline: $relative. Nothing changed. Merge this file manually before installing; do not discard your edits."
        }
    } elseif ($entry.required) { throw "Missing baseline file: $relative. Install the earlier Capcar packages first." }
}
if (-not $SkipChecks -and -not (Get-Command pnpm.cmd -ErrorAction SilentlyContinue)) { throw "pnpm.cmd is required." }
$backupRoot = Join-Path (Split-Path -Parent $project) '.capcar-installer-backups'
if ((Test-Path -LiteralPath $backupRoot) -and ((Get-Item -LiteralPath $backupRoot -Force).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw "Backup root must not be a junction or symbolic link." }
$backup = Join-Path $backupRoot ('epics-66-69-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '-' + [Guid]::NewGuid().ToString('N').Substring(0,8))
New-Item -ItemType Directory -Path $backup | Out-Null
$created = @()
foreach ($entry in $entries) {
    $target = Join-Path $project $entry.path
    if (Test-Path -LiteralPath $target) {
        $saved = Join-Path (Join-Path $backup 'files') $entry.path
        New-Item -ItemType Directory -Path (Split-Path -Parent $saved) -Force | Out-Null
        Copy-Item -LiteralPath $target -Destination $saved
    } else { $created += $entry.path }
}
$created | Set-Content -LiteralPath (Join-Path $backup 'created-files.txt') -Encoding UTF8
Write-Host "Backup: $backup"
foreach ($entry in $entries) {
    $target = Join-Path $project $entry.path
    New-Item -ItemType Directory -Path (Split-Path -Parent $target) -Force | Out-Null
    Copy-Item -LiteralPath (Join-Path (Join-Path $PSScriptRoot 'payload') $entry.path) -Destination $target -Force
}
if (-not $SkipChecks) {
    Push-Location $project
    try {
        & pnpm.cmd install --frozen-lockfile
        if ($LASTEXITCODE -ne 0) { throw "Dependency installation failed. Backup: $backup" }
        foreach ($check in @('format:check','lint','typecheck','test','build')) {
            & pnpm.cmd $check
            if ($LASTEXITCODE -ne 0) { throw "$check failed. Changes remain available for diagnosis. Backup: $backup" }
        }
    } finally { Pop-Location }
}
Write-Host 'Epics 66-69 installed. Review /studio on desktop and mobile before deploying.'
