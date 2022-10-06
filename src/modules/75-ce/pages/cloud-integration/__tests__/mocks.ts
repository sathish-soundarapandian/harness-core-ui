/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import metadataRes from '@ce/pages/anomalies-overview/__test__/CCMMetaDataResponse.json'

export const ccmK8sListResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 1,
    content: [
      {
        k8sConnector: {
          connector: {
            name: 'connector1',
            identifier: 'connector1',
            tags: {},
            type: 'K8sCluster',
            spec: {
              delegateSelectors: ['connector1']
            }
          },
          createdAt: 1649072964626,
          lastModifiedAt: 1657088701129,
          status: {
            status: 'FAILURE',
            errorSummary: ' No Delegate Found ( No Delegate Eligible to perform the request)',
            errors: [
              {
                reason: ' No Delegate Found',
                message: ' No Delegate Eligible to perform the request',
                code: 463
              }
            ],
            testedAt: 1658672894695,
            lastTestedAt: 0,
            lastConnectedAt: 0
          },
          activityDetails: {
            lastActivityTime: 1657088701212
          }
        },
        ccmk8sConnector: []
      },
      {
        k8sConnector: {
          connector: {
            name: 'connector2',
            identifier: 'connector2',
            tags: {},
            type: 'K8sCluster',
            spec: {
              delegateSelectors: ['connector2']
            }
          },
          createdAt: 1633542198467,
          lastModifiedAt: 1640159579256,
          status: {
            status: 'SUCCESS',
            errorSummary: null,
            errors: null,
            testedAt: 1640159579866,
            lastTestedAt: 0,
            lastConnectedAt: 1640159579866
          },
          activityDetails: {
            lastActivityTime: 1640159579290
          }
        },
        ccmk8sConnector: [
          {
            connector: {
              name: 'ccmConnector2',
              identifier: 'ccmConnector2',
              description: 'test permissions',
              orgIdentifier: null,
              projectIdentifier: null,
              tags: {},
              type: 'CEK8sCluster',
              spec: {
                connectorRef: 'connector2',
                featuresEnabled: ['VISIBILITY']
              }
            },
            createdAt: 1629117369301,
            lastModifiedAt: 1634621015606,
            status: {
              status: 'SUCCESS',
              testedAt: 1658211126868,
              lastTestedAt: 0,
              lastConnectedAt: 1634629180162
            }
          }
        ]
      },
      {
        k8sConnector: {
          connector: {
            name: 'connector3',
            identifier: 'connector3',
            tags: {},
            type: 'K8sCluster',
            spec: {
              delegateSelectors: ['connector2']
            }
          },
          createdAt: 1633542198467,
          lastModifiedAt: 1640159579256,
          status: {
            status: 'SUCCESS',
            errorSummary: null,
            errors: null,
            testedAt: 1640159579866,
            lastTestedAt: 0,
            lastConnectedAt: 1640159579866
          },
          activityDetails: {
            lastActivityTime: 1640159579290
          }
        },
        ccmk8sConnector: [
          {
            connector: {
              name: 'ccmConnector3',
              identifier: 'ccmConnector3',
              description: 'test permissions',
              orgIdentifier: null,
              projectIdentifier: null,
              tags: {},
              type: 'CEK8sCluster',
              spec: {
                connectorRef: 'connector2',
                featuresEnabled: ['VISIBILITY', 'OPTIMIZATION']
              }
            },
            createdAt: 1629117369301,
            lastModifiedAt: 1634621015606,
            status: {
              status: 'FAILURE',
              errorSummary: ' No Delegate Found ( No Delegate Eligible to perform the request)',
              errors: [
                {
                  reason: ' No Delegate Found',
                  message: ' No Delegate Eligible to perform the request',
                  code: 463
                }
              ],
              testedAt: 1658211126868,
              lastTestedAt: 0,
              lastConnectedAt: 1634629180162
            }
          }
        ]
      }
    ],
    pageIndex: 0,
    empty: false
  }
}

export const ccmK8sMetaResponse = {
  status: 'SUCCESS',
  data: {
    ccmK8sMeta: [
      {
        clusterId: 'clusterId3',
        ccmk8sConnectorId: 'ccmConnector3',
        visibility: ['No events received. It typically takes 3 to 5 minutes to start receiving events.'],
        optimisation: null
      },
      {
        clusterId: 'clusterId2',
        ccmk8sConnectorId: 'ccmConnector2',
        visibility: ['last event received at Wed, 09 February 2022 21:15:06 UTC'],
        optimisation: null
      }
    ]
  }
}

export const listV2Response = {
  status: 'SUCCESS',
  data: {
    totalPages: 2,
    totalItems: 14,
    pageItemCount: 10,
    pageSize: 10,
    content: [
      {
        connector: {
          name: 'azureConnector',
          identifier: 'azureConnector',
          description: null,
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'CEAzure',
          spec: {
            featuresEnabled: ['VISIBILITY', 'OPTIMIZATION', 'BILLING'],
            tenantId: 'tenantId1',
            subscriptionId: 'subscriptionId1',
            billingExportSpec: {
              storageAccountName: 'dummystorageaccount',
              containerName: 'dummy',
              directoryName: 'dummy',
              reportName: 'dummy',
              subscriptionId: 'subscriptionId1'
            }
          }
        },
        createdAt: 1658121275830,
        lastModifiedAt: 1658121275825,
        status: {
          status: 'FAILURE',
          errorSummary:
            'Error Encountered (Review the billing export settings in your Azure account and in CCM connector. For more information, refer to the documentation.)',
          errors: [
            {
              reason: 'Unexpected Error',
              message:
                'Review the billing export settings in your Azure account and in CCM connector. For more information, refer to the documentation.',
              code: 450
            }
          ],
          testedAt: 1658662327292,
          lastTestedAt: 0,
          lastConnectedAt: 0
        }
      },
      {
        connector: {
          name: 'gcpConnector',
          identifier: 'gcpConnector1',
          description: null,
          orgIdentifier: null,
          projectIdentifier: null,
          tags: {},
          type: 'GcpCloudCost',
          spec: {
            featuresEnabled: ['OPTIMIZATION'],
            projectId: 'projectId2',
            serviceAccountEmail: 'a@a.com',
            billingExportSpec: null
          }
        },
        createdAt: 1657612813073,
        lastModifiedAt: 1657612813070,
        status: {
          status: 'SUCCESS',
          errorSummary: null,
          errors: null,
          testedAt: 1658632798035,
          lastTestedAt: 0,
          lastConnectedAt: 1658632798035
        },
        activityDetails: {
          lastActivityTime: 1657612813098
        }
      },
      {
        connector: {
          name: 'awsConnector',
          identifier: 'awsConnectorId',
          description: null,
          type: 'CEAws',
          spec: {
            crossAccountAccess: { crossAccountRoleArn: 'crossAccountRoleArn' },
            curAttributes: { reportName: 'Lightwing-Non-Prod-Usage' },
            awsAccountId: 'accountId',
            featuresEnabled: ['OPTIMIZATION', 'VISIBILITY', 'BILLING']
          }
        },
        createdAt: 1660727401645,
        lastModifiedAt: 1660727578217,
        status: {
          status: 'SUCCESS',
          testedAt: 1661139000603,
          lastTestedAt: 0,
          lastConnectedAt: 1660727403576
        }
      }
    ],
    pageIndex: 0,
    empty: false
  }
}

export const ccmMetadataResponse = { ...metadataRes, loading: false }
export const noConnectorsRes = {
  data: {
    ccmMetaData: {
      k8sClusterConnectorPresent: false,
      cloudDataPresent: false,
      awsConnectorsPresent: false,
      gcpConnectorsPresent: false,
      azureConnectorsPresent: false
    }
  },
  loading: false
}

export const testConnectionResponse = {
  status: 'SUCCESS',
  data: {
    status: 'SUCCESS',
    errors: null,
    errorSummary: null,
    testedAt: 0,
    delegateId: 'delegateId'
  }
}
