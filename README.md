
## Overview

This repository contains console application samples demonstrating how to use the AuditSpace Snapshot feature to capture the state of Dataverse records at specific points in time. The snapshot functionality allows you to:

- **Capture record state**: Create a snapshot of a record's current data
- **Custom event tracking**: Associate snapshots with meaningful event names for audit and compliance purposes
- **Historical tracking**: Maintain a historical record of important data changes and milestones

## Disclaimer

The code provided in this repository is for **sample purposes only** and is provided as-is without any warranty or support. These examples are intended to demonstrate how to use the AuditSpace Snapshot functionality and should be thoroughly tested and customized for your specific production environment before deployment. The authors and contributors of this repository are not responsible for any issues, data loss, or damages that may result from using this code.

## Prerequisites

Before running the console application samples, ensure you have:

- **Azure subscription** with appropriate credentials configured for authentication
- **Dynamics 365 / Dataverse environment** with read/write access
- **AuditSpace solution** installed in your Dataverse environment
- **AuditSpace custom action** (`unl_AuditSpaceSnapshot`) available in your environment
- **.NET 10.0 or later** installed on your machine
- **Azure.Identity** configured for authentication (see [Authentication Setup](#authentication-setup) section)

## Console Application Sample

### Overview

The console application sample demonstrates how to authenticate to Dataverse and call the `unl_AuditSpaceSnapshot` custom action to create a snapshot of a record with a custom event name.

**Location**: `src/console-application/`

### Files

| File | Purpose |
|------|---------|
| `Program.cs` | Main application logic for authenticating and calling the snapshot API |
| `AuditSpaceCustomSnapshot.csproj` | Project configuration and NuGet dependencies |
| `settings.local.json` | Configuration file for Dataverse environment URL |

### Getting Started

#### 1. Configure the Dataverse Environment URL

Edit the `src/console-application/settings.local.json` file and replace the placeholder with your Dataverse environment URL:

```json
{
  "DataverseEnvironmentUrl": "https://your-org.crm.dynamics.com/"
}
```

**Note**: Ensure the URL ends with a trailing slash and uses `https://`.

#### 2. Set Up Azure Authentication

The console application uses Azure Managed Identity (DefaultAzureCredential) for secure authentication. The `DefaultAzureCredential` automatically uses the account you're logged into in Visual Studio if available. Choose one of the following authentication methods:

**Option A: Using Visual Studio Account (Recommended for Development)**

1. Sign into Visual Studio with an Azure-authenticated account
2. The `DefaultAzureCredential` will automatically detect and use your Visual Studio credentials
3. No additional configuration is required; simply run the application

**Option B: Using Azure CLI**
```bash
az login
```

**Option C: Using Environment Variables**
Set the following environment variables:
```bash
$env:AZURE_CLIENT_ID = "your-client-id"
$env:AZURE_TENANT_ID = "your-tenant-id"
$env:AZURE_CLIENT_SECRET = "your-client-secret"
```

**Option D: Using Service Principal in Production**
Configure an Azure App Registration with credentials and set the appropriate environment variables or use managed identity in Azure services.

#### 3. Customize the Snapshot Parameters

In `Program.cs`, update the snapshot request parameters to match your use case:

```csharp
// Set the event name for this snapshot (e.g., "Snapshot from console app")
request.Parameters["unl_EventName"] = "Snapshot from console app";

// Set the record ID (GUID) of the record to snapshot
request.Parameters["unl_RecordId"] = "2b19f98a-dd81-f011-b4cc-000d3a59c9d6";

// Set the table logical name (e.g., "contact", "account", "opportunity")
request.Parameters["unl_TableLogicalName"] = "contact";
```

**Parameters**:
- **unl_EventName**: A descriptive name for the snapshot event (string)
- **unl_RecordId**: The GUID of the record to snapshot (Guid format)
- **unl_TableLogicalName**: The logical name of the table containing the record (string)

#### 4. Run the Console Application

Navigate to the console application directory and run:

```bash
cd src/console-application
dotnet run
```

The application will:
1. Load configuration from `settings.local.json`
2. Authenticate to your Dataverse environment using Azure credentials
3. Execute the `unl_AuditSpaceSnapshot` custom action
4. Create a snapshot of the specified record with your custom event name

### Example Use Cases

#### Example 1: Snapshot a Contact Record
```csharp
request.Parameters["unl_EventName"] = "Contact Details Updated";
request.Parameters["unl_RecordId"] = "a1b2c3d4-e5f6-7890-1234-567890abcdef";
request.Parameters["unl_TableLogicalName"] = "contact";
```

#### Example 2: Snapshot an Account Record
```csharp
request.Parameters["unl_EventName"] = "Account Status Changed to Active";
request.Parameters["unl_RecordId"] = "f1e2d3c4-b5a6-7890-1234-567890abcdef";
request.Parameters["unl_TableLogicalName"] = "account";
```

#### Example 3: Snapshot a Custom Table Record
```csharp
request.Parameters["unl_EventName"] = "Custom Process Completed";
request.Parameters["unl_RecordId"] = "c1d2e3f4-a5b6-7890-1234-567890abcdef";
request.Parameters["unl_TableLogicalName"] = "new_customtable";
```

## Architecture and Key Components

### Authentication Flow

The console application implements a secure token-caching authentication system:

1. **DefaultAzureCredential**: Uses Azure's credential chain to automatically detect available authentication methods
2. **Token Caching**: Implements in-memory token caching to reduce authentication overhead
3. **Token Refresh**: Tokens are automatically refreshed when expired (20-minute expiration)

### Dataverse Integration

The application uses the `Microsoft.PowerPlatform.Dataverse.Client` to:
- Create a secure connection to your Dataverse environment
- Execute the custom `unl_AuditSpaceSnapshot` action
- Handle authentication tokens and session management

### Custom Action

The `unl_AuditSpaceSnapshot` custom action is an AuditSpace solution component that:
- Validates the input parameters
- Creates a snapshot record in the AuditSpace snapshot table
- Associates the snapshot with the specified record and event name
- Returns success or error information to the caller

## Troubleshooting

### Issue: "DataverseEnvironmentUrl is not configured"
**Solution**: Ensure `settings.local.json` exists and contains the correct `DataverseEnvironmentUrl` value.

### Issue: "Authentication failed"
**Solution**: 
- Verify your Azure credentials are valid and have access to the Dataverse environment
- Ensure the user/service principal has read access to the target table
- Check that you're signed into Visual Studio or have valid Azure CLI credentials

### Issue: "unl_AuditSpaceSnapshot action not found"
**Solution**: 
- Verify the AuditSpace solution is installed in your Dataverse environment
- Check that the custom action is enabled and published
- Ensure your user has appropriate permissions to execute custom actions

### Issue: "Record not found" or permission errors
**Solution**:
- Verify the `unl_RecordId` GUID is valid and exists in your Dataverse environment
- Confirm the `unl_TableLogicalName` is correct for your record
- Ensure your user has read access to the specified table and record

## Additional Resources

- [AuditSpace Documentation](https://docs.auditspace.io/)
- [Microsoft Dataverse Client Documentation](https://learn.microsoft.com/en-us/dotnet/api/microsoft.poweraplatform.dataverse.client)
- [Azure Identity Documentation](https://learn.microsoft.com/en-us/dotnet/api/azure.identity)

## License

Please refer to the license file in this repository for usage terms and conditions.
