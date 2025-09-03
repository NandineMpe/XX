# Set these paths to your actual repo locations
$frontendPath = "C:\Users\nandi\Augentik_FrontEnd"
$backendWebuiPath = "C:\Users\nandi\LightRAG-3\lightrag\api\webui"
$backendRepoPath = "C:\Users\nandi\LightRAG-3"

# 1. Build the frontend for backend deployment
Write-Host "Building frontend for backend deployment..."
Set-Location $frontendPath
$env:BUILD_TARGET = "railway"
npm run build

# 2. Remove old static files from backend
Write-Host "Removing old static files from backend..."
Remove-Item -Recurse -Force "$backendWebuiPath\*" -ErrorAction SilentlyContinue

# 3. Copy new build output to backend webui directory
Write-Host "Copying new build output to backend webui directory..."
Copy-Item -Recurse -Force "$frontendPath\dist\*" $backendWebuiPath

# 4. Commit and push changes to backend repo
Write-Host "Committing and pushing changes to backend repo..."
Set-Location $backendRepoPath
git add lightrag/api/webui
git commit -m "chore: update dashboard UI (automated script)"
git push

Write-Host "Deployment script complete! Check your Railway dashboard for deployment status."
