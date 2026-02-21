const express = require('express');
const cors = require('cors');
const path = require('path');
const { TableClient, AzureNamedKeyCredential } = require('@azure/data-tables');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// In-memory storage for development (will use Azure Table Storage in production)
let sensorData = [];

// Azure Storage configuration
const AZURE_STORAGE_ACCOUNT_NAME = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const AZURE_STORAGE_ACCESS_KEY = process.env.AZURE_STORAGE_ACCESS_KEY;
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;

// Initialize Azure Table Storage client
let tableClient;
if (connectionString) {
    tableClient = TableClient.fromConnectionString(connectionString, 'sensorData');
} else if (AZURE_STORAGE_ACCOUNT_NAME && AZURE_STORAGE_ACCESS_KEY) {
    const credential = new AzureNamedKeyCredential(AZURE_STORAGE_ACCOUNT_NAME, AZURE_STORAGE_ACCESS_KEY);
    tableClient = new TableClient(
        `https://${AZURE_STORAGE_ACCOUNT_NAME}.table.core.windows.net`,
        'sensorData',
        credential
    );
} else {
    console.warn('Azure Storage credentials not found. Using in-memory storage for development.');
}

// Create table if it doesn\'t exist (in production)
async function initializeTable() {
    if (!tableClient) return;
    
    try {
        await tableClient.createTable();
        console.log('Azure Table created successfully');
    } catch (error) {
        console.log('Table might already exist:', error.message);
    }
}

// API endpoint to submit sensor data
app.post('/api/sensor-data', async (req, res) => {
    try {
        const { sensorType, value, location, description } = req.body;
        
        // Validate required fields
        if (!sensorType || value === undefined || !location) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: sensorType, value, and location are required' 
            });
        }
        
        // Create entity for Azure Table Storage
        const entity = {
            partitionKey: sensorType,
            rowKey: `${Date.now()}`, // Unique identifier
            sensorType,
            value: parseFloat(value),
            location,
            description: description || '',
            timestamp: new Date().toISOString()
        };
        
        // Store in Azure Table Storage (production) or in-memory (development)
        if (tableClient) {
            try {
                await tableClient.createEntity(entity);
                console.log(`Data stored in Azure Table Storage: ${entity.rowKey}`);
            } catch (storageError) {
                console.error('Failed to store in Azure:', storageError.message);
                // Fallback to in-memory storage
                sensorData.push({ id: entity.rowKey, ...entity });
            }
        } else {
            // In-memory storage for development
            sensorData.push({ id: entity.rowKey, ...entity });
        }
        
        res.json({ 
            success: true, 
            message: 'Data submitted successfully',
            data: { id: entity.rowKey, ...entity }
        });
    } catch (error) {
        console.error('Error submitting sensor data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// API endpoint to get all sensor data
app.get('/api/sensor-data', async (req, res) => {
    try {
        if (tableClient) {
            // Retrieve from Azure Table Storage
            const entities = tableClient.listEntities({
                queryOptions: { 
                    filter: `PartitionKey eq '${req.query.sensorType || ''}'`.trim() || undefined
                }
            });
            
            const results = [];
            for await (const entity of entities) {
                results.push({
                    id: entity.rowKey,
                    sensorType: entity.partitionKey,
                    value: entity.value,
                    location: entity.location,
                    description: entity.description,
                    timestamp: entity.timestamp
                });
            }
            
            res.json({ success: true, data: results });
        } else {
            // Return in-memory data
            const filteredData = req.query.sensorType 
                ? sensorData.filter(item => item.sensorType === req.query.sensorType) 
                : sensorData;
            
            res.json({ success: true, data: filteredData });
        }
    } catch (error) {
        console.error('Error retrieving sensor data:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        services: {
            api: 'operational',
            storage: tableClient ? 'connected' : 'using in-memory'
        }
    });
});

initializeTable().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
        console.log(`Azure Storage: ${tableClient ? 'Connected' : 'Not configured (using in-memory)'}`);
    });
}).catch(err => {
    console.error('Failed to initialize table:', err);
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} (without Azure Storage)`);
    });
});

module.exports = app;
