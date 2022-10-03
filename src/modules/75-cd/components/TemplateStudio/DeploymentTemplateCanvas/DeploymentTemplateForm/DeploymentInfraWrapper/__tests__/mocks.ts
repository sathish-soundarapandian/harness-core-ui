/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { JsonNode } from 'services/pipeline-ng'

export interface DeploymentTemplateWrapperProps {
  deploymentConfigInitialValues?: JsonNode
}
export const defaultInitialValues = {
  infrastructure: {
    variables: [],
    fetchInstancesScript: {},
    instanceAttributes: [
      {
        name: 'hostname',
        jsonPath: '',
        description: ''
      }
    ],
    instancesListPath: ''
  },
  execution: {
    stepTemplateRefs: []
  }
}

export const defaultInitialValuesWithFileStore = {
  infrastructure: {
    variables: [],
    fetchInstancesScript: {
      store: {
        type: 'Harness',
        spec: {
          files: ['org:/script']
        }
      }
    },
    instanceAttributes: [
      {
        name: 'hostname',
        jsonPath: '',
        description: ''
      }
    ],
    instancesListPath: ''
  },
  execution: {
    stepTemplateRefs: []
  }
}

export const initialValues = {
  ...defaultInitialValues,
  infrastructure: {
    ...defaultInitialValues.infrastructure,
    variables: [
      {
        name: 'clusterUrl',
        type: 'String',
        value: 'clusterURL',
        description: 'URL to connect to cluster'
      }
    ],
    fetchInstancesScript: {
      store: {
        type: 'Inline',
        spec: {
          content: 'echo test'
        }
      }
    },
    instancesListPath: 'instances',

    instanceAttributes: [
      {
        name: 'hostName',
        jsonPath: 'ip',
        description: 'IP address of the host'
      }
    ]
  }
}
