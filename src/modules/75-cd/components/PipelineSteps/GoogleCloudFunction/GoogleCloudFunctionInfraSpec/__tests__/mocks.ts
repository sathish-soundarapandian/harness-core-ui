export const gcpConnectorListResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 2,
    pageItemCount: 2,
    pageSize: 10,
    content: [
      {
        connector: {
          name: 'gcpConnector',
          identifier: 'gcpConnector',
          description: '',
          orgIdentifier: 'default',
          projectIdentifier: 'NamanTestZone',
          tags: {},
          type: 'Gcp',
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                secretKeyRef: 'GCS_secret'
              }
            },
            delegateSelectors: [],
            executeOnDelegate: false
          }
        },
        createdAt: 1675847321274,
        lastModifiedAt: 1675847321271,
        status: {
          status: 'SUCCESS',
          errorSummary: null,
          errors: null,
          testedAt: 1675847323520,
          lastTestedAt: 0,
          lastConnectedAt: 1675847323520
        },
        activityDetails: {
          lastActivityTime: 1675847321285
        },
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
          repoUrl: null,
          parentEntityConnectorRef: null,
          parentEntityRepoName: null
        },
        entityValidityDetails: {
          valid: true,
          invalidYaml: null
        },
        governanceMetadata: null
      },
      {
        connector: {
          name: 'gcpConnector2',
          identifier: 'gcpConnector2',
          description: '',
          orgIdentifier: 'default',
          projectIdentifier: 'NamanTestZone',
          tags: {},
          type: 'Gcp',
          spec: {
            credential: {
              type: 'ManualConfig',
              spec: {
                secretKeyRef: 'GCS_secret'
              }
            },
            delegateSelectors: [],
            executeOnDelegate: false
          }
        },
        createdAt: 1675847321274,
        lastModifiedAt: 1675847321271,
        status: {
          status: 'SUCCESS',
          errorSummary: null,
          errors: null,
          testedAt: 1675847323520,
          lastTestedAt: 0,
          lastConnectedAt: 1675847323520
        },
        activityDetails: {
          lastActivityTime: 1675847321285
        },
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
          repoUrl: null,
          parentEntityConnectorRef: null,
          parentEntityRepoName: null
        },
        entityValidityDetails: {
          valid: true,
          invalidYaml: null
        },
        governanceMetadata: null
      }
    ],
    pageIndex: 0,
    empty: false,
    pageToken: null
  },
  metaData: null,
  correlationId: 'ef432e84-37f8-404a-a5e5-01fe4920c677'
}

// when selecting gcpConnector
export const gcpProjectListResponse = {
  status: 'SUCCESS',
  data: {
    projects: [
      {
        id: 'qa-target',
        name: 'qa-target'
      }
    ]
  },
  metaData: null,
  correlationId: '0f8d9f33-f66f-4cf7-baf0-f2066c9eeccd'
}

export const gcfTypeRegions = {
  status: 'SUCCESS',
  data: [
    {
      name: 'asia',
      value: 'asia'
    },
    {
      name: 'asia-east1',
      value: 'asia-east1'
    },
    {
      name: 'asia-east2',
      value: 'asia-east2'
    },
    {
      name: 'asia-northeast1',
      value: 'asia-northeast1'
    },
    {
      name: 'asia-northeast2',
      value: 'asia-northeast2'
    },
    {
      name: 'asia-northeast3',
      value: 'asia-northeast3'
    },
    {
      name: 'asia-south1',
      value: 'asia-south1'
    },
    {
      name: 'asia-south2',
      value: 'asia-south2'
    },
    {
      name: 'asia-southeast1',
      value: 'asia-southeast1'
    },
    {
      name: 'asia-southeast2',
      value: 'asia-southeast2'
    },
    {
      name: 'australia-southeast1',
      value: 'australia-southeast1'
    },
    {
      name: 'australia-southeast2',
      value: 'australia-southeast2'
    },
    {
      name: 'europe',
      value: 'europe'
    },
    {
      name: 'europe-central2',
      value: 'europe-central2'
    },
    {
      name: 'europe-north1',
      value: 'europe-north1'
    },
    {
      name: 'europe-southwest1',
      value: 'europe-southwest1'
    },
    {
      name: 'europe-west1',
      value: 'europe-west1'
    },
    {
      name: 'europe-west2',
      value: 'europe-west2'
    },
    {
      name: 'europe-west3',
      value: 'europe-west3'
    },
    {
      name: 'europe-west4',
      value: 'europe-west4'
    },
    {
      name: 'europe-west6',
      value: 'europe-west6'
    },
    {
      name: 'europe-west8',
      value: 'europe-west8'
    },
    {
      name: 'europe-west9',
      value: 'europe-west9'
    },
    {
      name: 'northamerica-northeast1',
      value: 'northamerica-northeast1'
    },
    {
      name: 'northamerica-northeast2',
      value: 'northamerica-northeast2'
    },
    {
      name: 'southamerica-east1',
      value: 'southamerica-east1'
    },
    {
      name: 'southamerica-west1',
      value: 'southamerica-west1'
    },
    {
      name: 'us',
      value: 'us'
    },
    {
      name: 'us-central1',
      value: 'us-central1'
    },
    {
      name: 'us-east1',
      value: 'us-east1'
    },
    {
      name: 'us-east4',
      value: 'us-east4'
    },
    {
      name: 'us-east5',
      value: 'us-east5'
    },
    {
      name: 'us-south1',
      value: 'us-south1'
    },
    {
      name: 'us-west1',
      value: 'us-west1'
    },
    {
      name: 'us-west2',
      value: 'us-west2'
    },
    {
      name: 'us-west3',
      value: 'us-west3'
    },
    {
      name: 'us-west4',
      value: 'us-west4'
    }
  ],
  metaData: null,
  correlationId: 'ec11341b-bc1d-4d19-bda6-d6df5660b550'
}
