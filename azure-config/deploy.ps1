# Azure Cloud-Based Smart Monitoring System Deployment Script

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "East US",
    
    [Parameter(Mandatory=$false)]
    [string]$WebAppName = "smart-monitoring-$((Get-Random -Maximum 99999).ToString())",
    
    [Parameter(Mandatory=$false)]
    [string]$Sku = "Free"
)

# Login to Azure (uncomment if needed)
# Connect-AzAccount

Write-Host "Starting deployment of Cloud-Based Smart Monitoring System..." -ForegroundColor Green

# Create Resource Group
Write-Host "Creating Resource Group: $ResourceGroupName in Location: $Location" -ForegroundColor Yellow
New-AzResourceGroup -Name $ResourceGroupName -Location $Location -Force

# Deploy ARM Template
Write-Host "Deploying ARM template with parameters..." -ForegroundColor Yellow
New-AzResourceGroupDeployment -ResourceGroupName $ResourceGroupName `
    -TemplateFile ".\azure-config\azure-deploy.json" `
    -webAppName $WebAppName `
    -sku $Sku `
    -Verbose

# Get deployment outputs
$deploymentOutputs = Get-AzResourceGroupDeployment -ResourceGroupName $ResourceGroupName | Select-Object -First 1
$webAppUrl = $deploymentOutputs.Outputs.webAppUrl.Value

Write-Host "Deployment completed successfully!" -ForegroundColor Green
Write-Host "Web Application URL: $webAppUrl" -ForegroundColor Cyan

# Provide instructions for next steps
Write-Host "`nNext Steps:" -ForegroundColor Magenta
Write-Host "1. Upload your application code to the web app:"
Write-Host "   az webapp deployment source config-zip --src app.zip --name $WebAppName --resource-group $ResourceGroupName"
Write-Host ""
Write-Host "2. Configure Application Settings if needed:"
Write-Host "   az webapp config appsettings set --name $WebAppName --resource-group $ResourceGroupName --settings KEY=VALUE"
Write-Host ""
Write-Host "3. Open the application in browser:"
Write-Host "   Start-Process $webAppUrl"

# Ask if user wants to open the URL
$openBrowser = Read-Host "Do you want to open the application in browser now? (y/n)"
if ($openBrowser -eq 'y' -or $openBrowser -eq 'Y') {
    Start-Process $webAppUrl
}