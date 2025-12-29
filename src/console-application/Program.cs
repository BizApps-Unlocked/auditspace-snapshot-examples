// See https://aka.ms/new-console-template for more information
/// <summary>
/// AuditSpace Snapshot Console Application Example
/// 
/// This application demonstrates how to capture a snapshot of a Dataverse record using the 
/// AuditSpace Snapshot feature from a .NET console application.
/// 
/// The AuditSpace Snapshot feature allows you to:
/// - Capture the current state of a record at a specific point in time
/// - Create an event-driven snapshot with custom metadata
/// - Store snapshots for audit, compliance, or historical tracking purposes
/// 
/// Prerequisites:
/// - Azure subscription with appropriate credentials configured
/// - Access to a Dynamics 365 / Dataverse environment
/// - AuditSpace solution installed in the Dataverse environment
/// - The unl_AuditSpaceSnapshot custom action available
/// </summary>

using Azure.Identity;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection; // Use explicit alias below to resolve ambiguity
using Microsoft.Extensions.Configuration;
using Microsoft.PowerPlatform.Dataverse.Client;
using System.Runtime.Caching;

internal class Program
{
    // Memory cache instance for storing and reusing authentication tokens
    private static IMemoryCache _memoryCache;
    // Configuration instance for reading settings from settings.local.json
    private static IConfiguration _configuration;

    private static void Main(string[] args)
    {
        Console.WriteLine("Calling unl_AuditSpaceSnapshot");

        // Load configuration from settings.local.json file
        // This allows the environment URL and other settings to be externalized
        var configBuilder = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("settings.local.json", optional: false, reloadOnChange: true);
        _configuration = configBuilder.Build();

        // Initialize dependency injection container to manage memory caching
        // This caches authentication tokens to avoid repeated authentication calls
        var provider = new ServiceCollection()
                   .AddMemoryCache()
                   .BuildServiceProvider();

        // Retrieve the IMemoryCache instance from the service provider
        _memoryCache = provider.GetService<IMemoryCache>();

        // Create and configure a ServiceClient to connect to the Dataverse environment
        var client = GetServiceClient();

        // Create an organization request to call the unl_AuditSpaceSnapshot custom action
        // This action captures a snapshot of a specific record in the Dataverse
        var request = new Microsoft.Xrm.Sdk.OrganizationRequest("unl_AuditSpaceSnapshot");
        
        // Set the parameters for the snapshot operation:
        // unl_EventName: A descriptive event name for this snapshot capture (e.g., "Snapshot from console app")
        request.Parameters["unl_EventName"] = "Snapshot from console app";
        
        // unl_RecordId: The unique identifier (GUID) of the record to snapshot
        // Example: A contact record with ID "2b19f98a-dd81-f011-b4cc-000d3a59c9d6"
        // Replace this with the actual record ID you want to snapshot
        request.Parameters["unl_RecordId"] = "2b19f98a-dd81-f011-b4cc-000d3a59c9d6";
        
        // unl_TableLogicalName: The logical name of the table/entity containing the record
        // Common examples: "contact", "account", "opportunity", "incident", etc.
        // Replace "contact" with the appropriate table logical name for your use case
        request.Parameters["unl_TableLogicalName"] = "contact";

        // Execute the snapshot request against the Dataverse environment
        // This will create a snapshot record that captures the current state of the specified record
        client.Execute(request);
    }

    /// <summary>
    /// Creates and returns a ServiceClient instance configured to connect to the Dataverse environment.
    /// Uses Azure managed identity for secure authentication.
    /// </summary>
    static ServiceClient GetServiceClient()
    {
        // Initialize Azure DefaultAzureCredential for authentication
        // This uses the environment's authentication chain (e.g., managed identity, environment variables, etc.)
        var managedIdentity = new DefaultAzureCredential();
        
        // Read the Dataverse environment URL from the configuration settings
        // This is loaded from settings.local.json
        var environment = _configuration["DataverseEnvironmentUrl"];
        
        // Validate that the environment URL is configured
        if (string.IsNullOrEmpty(environment))
        {
            throw new InvalidOperationException("DataverseEnvironmentUrl is not configured in settings.local.json");
        }
        
        // Get the memory cache instance for token caching
        var cache = _memoryCache;
        
        // Create and return a ServiceClient with a custom token provider function
        // The token provider uses caching to avoid authenticating on every request
        return new ServiceClient(
                // Custom token provider function that gets tokens with caching
                tokenProviderFunction: f => GetDataverseToken(environment, managedIdentity, cache),
                // The Dataverse environment URL
                instanceUrl: new Uri(environment),
                // Use unique instance to ensure a dedicated connection
                useUniqueInstance: true);
    }

    /// <summary>
    /// Retrieves an authentication token for accessing the Dataverse environment.
    /// Implements caching to reuse tokens and reduce authentication overhead.
    /// </summary>
    /// <param name="environment">The Dataverse environment URL</param>
    /// <param name="credential">Azure credential for authentication</param>
    /// <param name="cache">Memory cache for storing tokens</param>
    /// <returns>An authentication token string valid for 20 minutes</returns>
    static async Task<string> GetDataverseToken(string environment, DefaultAzureCredential credential, IMemoryCache cache)
    {
        // Attempt to get or create a cached token for the environment
        var accessToken = await cache.GetOrCreateAsync(environment, async (cacheEntry) =>
        {
            // Set token expiration to 20 minutes from creation
            // Tokens are automatically refreshed when expired
            cacheEntry.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(20);
            
            // Request a new token from Azure AD for accessing the Dataverse environment
            // The "/.default" scope requests all available scopes for the Dataverse resource
            var token = await credential.GetTokenAsync(
                new Azure.Core.TokenRequestContext(new[] { $"{environment}/.default" }));
            
            return token;
        });
        
        // Return the token string from the Azure token response
        return accessToken.Token;
    }
}