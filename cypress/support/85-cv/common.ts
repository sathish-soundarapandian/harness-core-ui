const accountId = 'accountId'

export const featureFlagsCall = `/api/users/feature-flags/accountId?routingId=${accountId}`

export const awsRegionsCall = '/cv/api/aws/regions?*'
export const awsWorkspacesCall = '/cv/api/aws/prometheus/workspaces?*'
export const awsConnectorCall = '/ng/api/connectors?accountIdentifier=accountId&type=Aws*'

export const awsRegionsResponse = {
  status: 'SUCCESS',
  data: ['region 1', 'region 2'],
  metaData: null,
  correlationId: '6474b2da-aa40-4347-bf7b-a7407278328e'
}

export const workspaceMock = {
  data: [
    {
      name: 'Workspace 1',
      workspaceId: 'sjksm43455n-34x53c45vdssd-fgdfd232sdfad'
    }
  ]
}
