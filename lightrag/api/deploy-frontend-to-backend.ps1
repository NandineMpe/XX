param(
    [string]$FrontendPath,
    [string]$DistPath,
    [string]$BuildCommand,
    [switch]$SkipInstall,
    [switch]$SkipBuild,
    [switch]$NoStage
)

$repoRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if (-not $FrontendPath) {
    $FrontendPath = if ($env:FRONTEND_PATH) { $env:FRONTEND_PATH } else { "C:\\Users\\nandi\\Augentik_FrontEnd" }
}

$nodeScript = Join-Path (Join-Path $repoRoot 'scripts') 'build-frontend-and-stage.mjs'
if (-not (Test-Path $nodeScript)) {
    throw "Unable to locate build helper script at $nodeScript"
}

$arguments = @()
if ($FrontendPath) { $arguments += @('--frontend-path', $FrontendPath) }
if ($DistPath) { $arguments += @('--dist-path', $DistPath) }
if ($BuildCommand) { $arguments += @('--build-command', $BuildCommand) }
if ($SkipInstall.IsPresent) { $arguments += '--skip-install' }
if ($SkipBuild.IsPresent) { $arguments += '--skip-build' }
if ($NoStage.IsPresent) { $arguments += '--no-stage' }

Write-Host "Running WebUI build helper..."
node $nodeScript @arguments
