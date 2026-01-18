#!/bin/bash

# Azure Cloud-Based Smart Monitoring System Deployment Script

# Default parameters
RESOURCE_GROUP_NAME=${1:-"smart-monitoring-rg"}
LOCATION=${2:-"eastus"}
WEB_APP_NAME=${3:-"smart-monitoring-$(openssl rand -hex 4)"}
SKU=${4:-"FREE"}

echo "Starting deployment of Cloud-Based Smart Monitoring System..."

# Check if logged in to Azure
if ! az account show &>/dev/null; then
    echo "Please log in to Azure:"
    az login
fi

# Create Resource Group
echo "Creating Resource Group: $RESOURCE_GROUP_NAME in Location: $LOCATION"
az group create --name $RESOURCE_GROUP_NAME --location $LOCATION

# Deploy ARM Template
echo "Deploying ARM template with parameters..."
az deployment group create \
    --resource-group $RESOURCE_GROUP_NAME \
    --template-file "./azure-config/azure-deploy.json" \
    --parameters \
        webAppName="$WEB_APP_NAME" \
        sku="$SKU"

# Get deployment outputs
WEB_APP_URL=$(az webapp list --resource-group $RESOURCE_GROUP_NAME --query "[0].defaultHostName" --output tsv)

echo "Deployment completed successfully!"
echo "Web Application URL: https://$WEB_APP_URL"

# Instructions for next steps
echo ""
echo "Next Steps:"
echo "1. Upload your application code to the web app:"
echo "   zip -r app.zip . -x '*.git*' 'node_modules/*' '.env' 'screenshots/*'"
echo "   az webapp deployment source config-zip --src app.zip --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP_NAME"
echo ""
echo "2. Configure Application Settings if needed:"
echo "   az webapp config appsettings set --name $WEB_APP_NAME --resource-group $RESOURCE_GROUP_NAME --settings KEY=VALUE"
echo ""
echo "3. Open the application in browser:"
echo "   xdg-open https://$WEB_APP_URL (Linux)"
echo "   open https://$WEB_APP_URL (Mac)"
echo "   start https://$WEB_APP_URL (Windows with Git Bash)"

# Ask if user wants to open the URL
read -p "Do you want to open the application in browser now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v xdg-open &>/dev/null; then
        xdg-open "https://$WEB_APP_URL"
    elif command -v open &>/dev/null; then
        open "https://$WEB_APP_URL"
    else
        echo "Could not detect browser opener command."
    fi
fi