# Audit trail

The Audit trail framework is built using the _registration_ pattern. Developers from each team will need to register their resources with the AuditTrailFactory.

Registration of **resources** requires the following details -

- **moduleIcon** - Module icon to which the resource belongs.
- **moduleLabel** - Label to show in tooltip when hover on module icon.
- **resourceLabel** - Corresponding resource label to be visible in resource column.
- **resourceUrl** - Resource redirection url (For eg. Connector details page in case of connector)

Example of a resource registration:

```typescript
import AuditTrailFactory from 'framework/AuditTrail/AuditTrailFactory'
import type { ResourceDTO, ResourceScopeDTO } from 'services/audit'

AuditTrailFactory.registerResourceHandler('CONNECTOR', {
  moduleIcon: {
    name: 'nav-settings'
  },
  moduleLabel: platformLabel,
  resourceLabel: 'connector',
  resourceUrl: (resource: ResourceDTO, resourceScope: ResourceScope) => {
    const { accountIdentifier, orgIdentifier, projectIdentifier } = resourceScope

    return routes.toConnectorDetails({
      orgIdentifier,
      accountId: accountIdentifier,
      connectorId: resource.identifier,
      projectIdentifier
    })
  }
})
```

Note - `CONNECTOR` in above example is a resource type present in audit service types, genrated through swagger.json. To add a new resorce, types should be generted first.
