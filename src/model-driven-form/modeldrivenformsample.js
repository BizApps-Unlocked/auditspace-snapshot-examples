var auditSpaceExample = window.auditSpaceExample || {};

(function () {

	this.onLoad = (executionContext) => {
		let formContext = executionContext.getFormContext();

		let rowid = formContext.data.entity.getId().replace('{', '').replace('}', '');
        let entityName = formContext.data.entity.getEntityName();

		var execute_unl_AuditSpaceSnapshot_Request = {
			// Parameters
			unl_TableLogicalName: entityName, // Edm.String
			unl_RecordId: rowid, // Edm.String
			unl_EventName: "A Custom Snapshot From Form JS", // Edm.String

			getMetadata: function () {
				return {
					boundParameter: null,
					parameterTypes: {
						unl_TableLogicalName: { typeName: "Edm.String", structuralProperty: 1 },
						unl_RecordId: { typeName: "Edm.String", structuralProperty: 1 },
						unl_EventName: { typeName: "Edm.String", structuralProperty: 1 }
					},
					operationType: 0, operationName: "unl_AuditSpaceSnapshot"
				};
			}
		};

		Xrm.WebApi.execute(execute_unl_AuditSpaceSnapshot_Request).then(
			function success(response) {
				if (response.ok) { console.log("Success"); }
			}
		).catch(function (error) {
			console.log(error.message);
		});
	}

}).call(auditSpaceExample);


