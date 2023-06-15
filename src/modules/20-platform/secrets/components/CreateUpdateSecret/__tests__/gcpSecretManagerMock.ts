export const gcpConnector = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'swaraj gcp',
      identifier: 'swaraj_gcp',
      description: '',
      orgIdentifier: null,
      projectIdentifier: null,
      tags: {},
      type: 'GcpSecretManager',
      spec: { credentialsRef: 'account.shreyasgcpqasetup', delegateSelectors: [], default: false }
    },
    createdAt: 1667215783715,
    lastModifiedAt: 1667215783712,
    status: {
      status: 'SUCCESS',
      errorSummary: null,
      errors: null,
      testedAt: 1668081072763,
      lastTestedAt: 0,
      lastConnectedAt: 1668081072763
    },
    activityDetails: { lastActivityTime: 1667215783727 },
    harnessManaged: false,
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null,
      commitId: null,
      fileUrl: null,
      repoUrl: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    governanceMetadata: null
  },
  metaData: null,
  correlationId: '63354c90-856e-41b8-8d01-441c84a3f739'
}

export const gcpSecretMock = {
  status: 'SUCCESS',
  data: {
    secret: {
      type: 'SecretText',
      name: 'swarajtest2',
      identifier: 'swarajtest2',
      tags: {},
      description: '',
      spec: {
        secretManagerIdentifier: 'swaraj_gcp',
        valueType: 'Inline',
        value: null,
        additionalMetadata: { values: { regions: 'us-east1,us-east4' } }
      }
    },
    createdAt: 1668094538601,
    updatedAt: 1668094538601,
    draft: false,
    governanceMetadata: null
  },
  metaData: null,
  correlationId: '7c72b5c4-ac30-4b3b-9af0-2a2fdsff0af9b3ad9'
}
