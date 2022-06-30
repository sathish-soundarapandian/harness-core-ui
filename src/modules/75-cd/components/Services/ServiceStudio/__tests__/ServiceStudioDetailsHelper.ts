/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const ServiceStudioDetailsProps = {
  serviceData: {
    service: {
      name: 'Service 1',
      identifier: 'Service_1',
      tags: {},
      serviceDefinition: {
        spec: {}
      }
    }
  }
}

export const pipelineContext = {
  state: {
    pipeline: {
      name: 'Service 1',
      identifier: 'Service_1',
      tags: {},
      gitOpsEnabled: false,
      stages: [
        {
          stage: {
            name: 'Stage Name',
            identifier: 'stage_id',
            spec: {
              serviceConfig: {
                serviceDefinition: {
                  spec: {}
                },
                serviceRef: 'Service_1'
              }
            }
          }
        }
      ]
    },
    pipelineView: {
      isSplitViewOpen: false,
      isDrawerOpened: false,
      isYamlEditable: false,
      splitViewData: {},
      drawerData: {
        type: 'AddCommand'
      }
    },
    selectionState: {
      selectedStageId: 'stage_id'
    },
    isUpdated: false,
    isLoading: false
  },
  allowableTypes: ['FIXED', 'RUNTIME', 'EXPRESSION'],
  isReadOnly: false
}

export const serviceContext = {
  isServiceEntityModalView: false,
  isServiceCreateModalView: false,
  serviceCacheKey: ''
}

export const mockStageReturnWithoutManifestData = {
  stage: {
    stage: {
      name: 'Stage Name',
      identifier: 'stage_id',
      spec: {
        serviceConfig: {
          serviceDefinition: {
            type: 'Kubernetes',
            spec: {}
          },
          serviceRef: 'Service_1'
        }
      }
    }
  }
}

export const updateResponse = {
  status: 'SUCCESS',
  data: {
    service: {
      accountId: 'kmpySmUISimoRrJL6NL73w',
      identifier: 'Service_1',
      orgIdentifier: 'default',
      projectIdentifier: 'TestFk',
      name: 'Service 1',
      description: null,
      deleted: false,
      tags: {},
      yaml: 'service:\n    name: Service 1\n    identifier: Service_1\n    tags: {}\n    serviceDefinition:\n        spec: {}\n        type: Kubernetes\n    description: null\n    gitOpsEnabled: false\n'
    },
    createdAt: 1655701511978,
    lastModifiedAt: 1655966420628
  },
  metaData: null,
  correlationId: '638409e7-9a1c-40e3-9bfc-298a0de0f0a7'
}
