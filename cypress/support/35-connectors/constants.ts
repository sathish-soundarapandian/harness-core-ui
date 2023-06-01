/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { addHashInCypressURLBasedOnBrowserRouter } from '../../utils/windowLocation'

const projectId = 'project1'
const accountId = 'accountId'
const orgIdentifier = 'default'
const connectorName = 'testConnector'
const connectorType = 'Jenkins'

export const connectorsListAPI = `/ng/api/connectors/listV2?routingId=${accountId}&sortOrders=lastModifiedAt%2CDESC&pageIndex=0&pageSize=10&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&accountIdentifier=${accountId}`
export const connectorsListWithoutSort = `/ng/api/connectors/listV2?accountIdentifier=${accountId}&searchTerm=&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&pageIndex=0&pageSize=10&includeAllConnectorsAvailableAtScope=true`
export const connectorListScopeTab = `/ng/api/connectors/listV2?accountIdentifier=${accountId}&searchTerm=&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&pageIndex=0&pageSize=10&includeAllConnectorsAvailableAtScope=false`
export const accountConnectorsListAPI = `/ng/api/connectors/listV2?routingId=${accountId}&sortOrders=lastModifiedAt%2CDESC&pageIndex=0&pageSize=10&accountIdentifier=${accountId}*`
export const connectorsCatalogueAPI = `/ng/api/connectors/catalogue?routingId=${accountId}&accountIdentifier=${accountId}`
export const delegatesListAPI = `/api/setup/delegates/delegate-selectors-up-the-hierarchy?routingId=${accountId}&accountId=${accountId}&orgId=${orgIdentifier}&projectId=${projectId}`
export const connectorsRoute = `${addHashInCypressURLBasedOnBrowserRouter()}account/${accountId}/cd/orgs/${orgIdentifier}/projects/${projectId}/setup/resources/connectors`
export const accountResourceConnectors = `${addHashInCypressURLBasedOnBrowserRouter()}account/${accountId}/settings/resources/connectors`
export const testConnection = `ng/api/connectors/testConnection/${connectorName}?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}`
export const accountConnectorTestConnection = `ng/api/connectors/testConnection/${connectorName}?routingId=${accountId}&accountIdentifier=${accountId}`
export const connectorStats = `/ng/api/connectors/stats?routingId=${accountId}&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&accountIdentifier=${accountId}`
export const connectorInfo = `/ng/api/connectors/${connectorName}?routingId=${accountId}&accountIdentifier=${accountId}&orgIdentifier=${orgIdentifier}&projectIdentifier=${projectId}`
export const accountConnectorInfo = `/ng/api/connectors/${connectorName}?routingId=${accountId}&accountIdentifier=${accountId}`
export const accountConnectorStats = `/ng/api/connectors/stats?routingId=${accountId}&accountIdentifier=${accountId}`
export const jenkinsSecretKeys = `/ng/api/v2/secrets?accountIdentifier=${accountId}&type=SecretText&searchTerm=&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}&pageIndex=0&pageSize=10&includeAllSecretsAccessibleAtScope=true`
export const delegatesList = `/api/setup/delegates/delegate-selectors-up-the-hierarchy?routingId=${accountId}&accountId=${accountId}&orgId=${orgIdentifier}&projectId=${projectId}`
export const delegatesInfo = `/api/setup/delegates/v2/up-the-hierarchy?routingId=${accountId}&accountId=${accountId}&orgId=${orgIdentifier}&projectId=${projectId}`
export const addConnector = `/ng/api/connectors?routingId=${accountId}&accountIdentifier=${accountId}`
export const connectorsList = `/ng/api/connectors?accountIdentifier=${accountId}&type=${connectorType}&searchTerm=&pageIndex=0&pageSize=10&projectIdentifier=${projectId}&orgIdentifier=${orgIdentifier}`

// CE connector
export const ceConnectorOverviewSave = `ng/api/connectors/listV2?routingId=${accountId}&pageIndex=0&pageSize=10&accountIdentifier=${accountId}&getDistinctFromBranches=false`
export const ceAWSConnectionData = `ccm/api/connector/awsaccountconnectiondetail?routingId=${accountId}&accountIdentifier=${accountId}&is_gov=false`
export const getGcpPermissions = `ccm/api/connector/gcpserviceaccount?routingId=${accountId}&accountIdentifier=${accountId}`
export const connectorsListRoute = `${addHashInCypressURLBasedOnBrowserRouter()}account/${accountId}/cd/orgs/${orgIdentifier}/projects/${projectId}/setup/resources/connectors`
export const accountConnectorsListRoute = `${addHashInCypressURLBasedOnBrowserRouter()}account/${accountId}/settings/resources/connectors`
