/// <summary>
/// AuditSpace Snapshot Model-Driven Form Sample
/// 
/// This script demonstrates how to call the unl_AuditSpaceSnapshot custom action
/// from a Dynamics 365 / Dataverse model-driven form using JavaScript.
/// 
/// The script automatically captures a snapshot of the current record when the form loads.
/// 
/// Prerequisites:
/// - AuditSpace solution must be installed in your Dataverse environment
/// - The unl_AuditSpaceSnapshot custom action must be available
/// - The current user must have permission to execute the custom action
/// 
/// Setup Instructions:
/// 1. Add this file as a Web Resource in your Dynamics 365 / Dataverse environment
/// 2. Register this script on the form's OnLoad event
/// 3. Customize the unl_EventName parameter to match your business requirements
/// </summary>

var auditSpaceExample = window.auditSpaceExample || {};

(function () {

	/// <summary>
	/// Form OnLoad event handler that triggers the AuditSpace snapshot capture
	/// </summary>
	/// <param name="executionContext">The form execution context passed by Dynamics 365</param>
	this.onLoad = (executionContext) => {
		// Get the form context from the execution context
		// The form context provides access to the current form's data and methods
		let formContext = executionContext.getFormContext();

		// Extract the record ID from the form context and remove the curly braces
		// The getId() method returns the GUID in the format: {XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX}
		// We remove the braces to get the clean GUID format
		let rowid = formContext.data.entity.getId().replace('{', '').replace('}', '');
		
		// Get the logical name of the current entity/table
		// This is the schema name of the table (e.g., "contact", "account", "opportunity")
		let entityName = formContext.data.entity.getEntityName();

		/// <summary>
		/// Constructs the request object for the unl_AuditSpaceSnapshot custom action
		/// This object defines all the parameters and metadata needed to invoke the custom action
		/// </summary>
		var execute_unl_AuditSpaceSnapshot_Request = {
			// ==================== PARAMETERS ====================
			// These parameters are sent to the unl_AuditSpaceSnapshot custom action
			
			/// <summary>
			/// The logical name of the table containing the record to snapshot
			/// Automatically retrieved from the current form context
			/// Examples: "contact", "account", "opportunity", "incident", "new_customtable"
			/// </summary>
			unl_TableLogicalName: entityName, // Edm.String

			/// <summary>
			/// The unique identifier (GUID) of the record to snapshot
			/// Automatically retrieved from the current form's record
			/// This should be a valid GUID without curly braces
			/// </summary>
			unl_RecordId: rowid, // Edm.String

			/// <summary>
			/// A descriptive event name for this snapshot
			/// Customize this to describe why the snapshot was taken
			/// Examples: "Contact Updated", "Account Activated", "Form Loaded"
			/// This helps with auditing and tracking important business moments
			/// </summary>
			unl_EventName: "A Custom Snapshot From Form JS", // Edm.String

			/// <summary>
			/// Metadata definition for the custom action
			/// This tells the Dataverse Web API how to execute the custom action
			/// and what parameter types to expect
			/// </summary>
			getMetadata: function () {
				return {
					// boundParameter: null means this is an unbound action (not bound to a specific table)
					boundParameter: null,
					
					// parameterTypes: Defines the data type of each parameter
					parameterTypes: {
						unl_TableLogicalName: { typeName: "Edm.String", structuralProperty: 1 },
						unl_RecordId: { typeName: "Edm.String", structuralProperty: 1 },
						unl_EventName: { typeName: "Edm.String", structuralProperty: 1 }
					},
					
					// operationType: 0 = Action (as opposed to a Function or CRUD operation)
					operationType: 0,
					
					// operationName: The exact name of the custom action in Dataverse
					// This must match the exact name of the custom action you created
					operationName: "unl_AuditSpaceSnapshot"
				};
			}
		};

		/// <summary>
		/// Execute the custom action using the Dataverse Web API
		/// Xrm.WebApi.execute() asynchronously sends the request to Dataverse
		/// </summary>
		Xrm.WebApi.execute(execute_unl_AuditSpaceSnapshot_Request).then(
			// Success handler: Called when the custom action executes successfully
			function success(response) {
				// Check if the response indicates success
				// response.ok is true when the HTTP status code is 200-299
				if (response.ok) { 
					console.log("Success"); 
					// Optional: Add additional success handling here
					// Examples:
					// - Display a success notification: Xrm.Page.ui.setFormNotification("Snapshot created successfully", "SUCCESS");
					// - Log additional information
					// - Trigger additional business logic
				}
			}
		).catch(function (error) {
			// Error handler: Called when the custom action fails
			// This could happen due to:
			// - Invalid record ID or table name
			// - Missing or unpublished custom action
			// - Permission issues
			// - Network connectivity problems
			console.log(error.message);
			// Optional: Add error handling here
			// Examples:
			// - Display an error notification to the user
			// - Log the error for debugging
			// - Retry the action with modified parameters
		});
	}

}).call(auditSpaceExample);


