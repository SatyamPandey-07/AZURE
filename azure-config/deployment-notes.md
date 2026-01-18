# Azure Deployment Notes

## Prerequisites

1. Azure Account with free tier access
2. Azure CLI installed locally
3. Node.js and npm installed

## Azure Services Setup

### 1. Create Resource Group
```bash
az group create --name smart-monitoring-rg --location eastus
```

### 2. Create Storage Account
```bash
# Generate random name for storage account (must be globally unique, 3-24 chars, lowercase)
STORAGE_NAME="sm$(date +%s)"

az storage account create \
    --name $STORAGE_NAME \
    --resource-group smart-monitoring-rg \
    --location eastus \
    --sku Standard_LRS \
    --kind StorageV2
```

### 3. Create App Service Plan
```bash
az appservice plan create \
    --name smart-monitoring-plan \
    --resource-group smart-monitoring-rg \
    --sku FREE
```

### 4. Create Web App
```bash
az webapp create \
    --name my-smart-monitoring-app \
    --plan smart-monitoring-plan \
    --resource-group smart-monitoring-rg \
    --runtime "NODE|18-lts"
```

## Environment Variables Setup

Add these application settings to your Azure Web App:

```
AZURE_STORAGE_ACCOUNT_NAME=[your-storage-account-name]
AZURE_STORAGE_ACCESS_KEY=[your-storage-access-key]
AZURE_STORAGE_CONNECTION_STRING=[your-storage-connection-string]
```

To get storage keys:
```bash
az storage account show -n $STORAGE_NAME -g smart-monitoring-rg --query "id"
az storage account keys list -n $STORAGE_NAME -g smart-monitoring-rg
```

## Deployment Options

### Option 1: Deploy via Git
```bash
az webapp deployment source config-local-git --name my-smart-monitoring-app --resource-group smart-monitoring-rg
git remote add azure [git-url-from-above-command]
git push azure main
```

### Option 2: Deploy via Zip
```bash
zip -r app.zip . -x "*.git*" "node_modules/*" ".env" "screenshots/*"
az webapp deployment source config-zip --src app.zip --name my-smart-monitoring-app --resource-group smart-monitoring-rg
```

## Application Insights Setup

1. Create Application Insights resource:
```bash
az extension add --name application-insights
az monitor app-insights component create --app smart-monitoring-ai --location eastus --resource-group smart-monitoring-rg --application-type web
```

2. Enable Application Insights on Web App:
```bash
APP_INSIGHTS_KEY=$(az monitor app-insights component show --app smart-monitoring-ai -g smart-monitoring-rg --query instrumentationKey -o tsv)
az webapp config appsettings set --name my-smart-monitoring-app --resource-group smart-monitoring-rg --settings APPLICATIONINSIGHTS_CONNECTION_STRING="InstrumentationKey=$APP_INSIGHTS_KEY"
```

## Monitoring Setup

### Azure Monitor
- Go to Azure Portal -> Monitor
- Set up alerts for:
  - CPU usage > 80%
  - Memory usage > 80%
  - Failed requests > 10/hour

### Application Insights
- Monitor request rates, response times, and failure rates
- Set up availability tests
- Configure custom dashboards

## Security Best Practices

1. Enable HTTPS-only access
2. Use managed identities where possible
3. Store secrets in Azure Key Vault
4. Implement proper CORS policies
5. Use authentication for sensitive endpoints

## Cost Optimization Tips

1. Use Free/App Service plans during development
2. Scale appropriately based on traffic
3. Clean up resources when not needed
4. Use reserved capacity for predictable workloads

## Troubleshooting

### Common Issues:
- Ensure CORS is properly configured
- Check storage account firewall settings
- Verify connection strings are correct
- Monitor Application Insights for errors

### Logging:
- Check Azure Web App logs
- Review Application Insights telemetry
- Use Log Analytics for detailed analysis