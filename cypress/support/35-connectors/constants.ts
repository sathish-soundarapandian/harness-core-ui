const projectId = 'project1'
const accountId = 'accountId'
const orgIdentifier = 'default'
const connectorName = 'testConnector'
const connectorType = 'Jenkins'

export const connectorsListAPI = `/ng/api/connectors/listV2?routingId=${accountId}&pageIndex=0&pageSize=10&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&accountIdentifier=${accountId}&searchTerm=`
export const accountConnectorsListAPI = `/ng/api/connectors/listV2?routingId=${accountId}&pageIndex=0&pageSize=10&accountIdentifier=${accountId}&searchTerm=`
export const connectorsCatalogueAPI = `/ng/api/connectors/catalogue?routingId=${accountId}&accountIdentifier=${accountId}`
export const delegatesListAPI = `/api/setup/delegates/delegate-selectors-up-the-hierarchy?routingId=${accountId}&accountId=${accountId}&orgId=${orgIdentifier}&projectId=${projectId}`
export const connectorsRoute = `#/account/${accountId}/cd/orgs/${orgIdentifier}/projects/${projectId}/setup/resources/connectors`
export const accountResourceConnectors = `#/account/${accountId}/settings/resources/connectors`
export const testConnection = `ng/api/connectors/testConnection/${connectorName}?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}`
export const accountConnectorTestConnection = `ng/api/connectors/testConnection/${connectorName}?routingId=${accountId}&accountIdentifier=${accountId}`
export const connectorStats = `/ng/api/connectors/stats?routingId=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&accountIdentifier=${accountId}`
export const connectorInfo = `/ng/api/connectors/${connectorName}?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}`
export const accountConnectorInfo = `/ng/api/connectors/${connectorName}?routingId=${accountId}&accountIdentifier=${accountId}`
export const accountConnectorStats = `/ng/api/connectors/stats?routingId=${accountId}&accountIdentifier=${accountId}`
export const jenkinsSecretKeys = `/ng/api/v2/secrets?accountIdentifier=${accountId}&type=SecretText&searchTerm=&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&pageIndex=0&pageSize=10`
export const delegatesList = `/api/setup/delegates/delegate-selectors-up-the-hierarchy?routingId=${accountId}&accountId=${accountId}&orgId=${orgIdentifier}&projectId=${projectId}`
export const delegatesInfo = `/api/setup/delegates/v2/up-the-hierarchy?routingId=${accountId}&accountId=${accountId}&orgId=${orgIdentifier}&projectId=${projectId}`
export const addConnector = `/ng/api/connectors?routingId=${accountId}&accountIdentifier=${accountId}`
export const connectorsList = `/ng/api/connectors?accountIdentifier=${accountId}&type=${connectorType}&searchTerm=&pageIndex=0&pageSize=10&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}`

// CE connector
export const ceConnectorOverviewSave = `ng/api/connectors/listV2?routingId=${accountId}&pageIndex=0&pageSize=10&accountIdentifier=${accountId}&getDistinctFromBranches=false`
export const ceAWSConnectionData = `ccm/api/connector/awsaccountconnectiondetail?routingId=${accountId}&accountIdentifier=${accountId}`
export const getGcpPermissions = `ccm/api/connector/gcpserviceaccount?routingId=${accountId}&accountIdentifier=${accountId}`
export const connectorsListRoute = `#/account/${accountId}/cd/orgs/${orgIdentifier}/projects/${projectId}/setup/resources/connectors`
export const accountConnectorsListRoute = `#/account/${accountId}/settings/resources/connectors`
