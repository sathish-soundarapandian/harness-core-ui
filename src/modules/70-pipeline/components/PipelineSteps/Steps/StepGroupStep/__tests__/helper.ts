/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import type { CIVolume } from 'services/ci'
import type { K8sDirectInfraStepGroupElementConfig } from '../StepGroupUtil'

export const containerStepGroupInitialValues: K8sDirectInfraStepGroupElementConfig = {
  name: 'Container Step Group 1',
  identifier: 'container_step_group_1',
  sharedPaths: ['sp1', 'sp2'] as any,
  stepGroupInfra: {
    type: 'KubernetesDirect',
    spec: {
      connectorRef: 'awsConnector', // This does not matter as mocked value of useGetConnector gets selected
      namespace: 'default',
      volumes: [
        {
          mountPath: 'mp',
          type: 'EmptyDir',
          spec: {
            medium: 'm1',
            size: '1Gi'
          }
        } as CIVolume
      ],
      serviceAccountName: 'testServiceAccountName',
      automountServiceAccountToken: true,
      priorityClassName: 'pc1',
      labels: [
        {
          k1: 'v1'
        }
      ] as any,
      annotations: [{ aKey1: 'aValue1' }] as any,
      containerSecurityContext: {
        capabilities: {
          add: ['c1'],
          drop: ['c2']
        },
        privileged: true,
        allowPrivilegeEscalation: true,
        runAsNonRoot: true,
        readOnlyRootFilesystem: true,
        runAsUser: 2000
      },
      nodeSelector: [
        {
          nsKey1: 'nsValue1'
        }
      ] as any,
      tolerations: [
        {
          effect: 'e1',
          key: 'k1',
          operator: 'o1',
          value: 'v1'
        }
      ],
      hostNames: ['h1'],
      initTimeout: '20s',
      harnessImageConnectorRef: 'awsConnector', // This does not matter as mocked value of useGetConnector gets selected
      os: 'Linux'
    }
  },
  steps: [
    {
      step: {
        type: 'Wait',
        name: 'Wait_1',
        identifier: 'Wait_1',
        spec: {
          duration: '10m'
        }
      }
    }
  ]
}

export const containerStepGroupTemplate: K8sDirectInfraStepGroupElementConfig = {
  name: 'Container Step Group 1',
  identifier: 'container_step_group_1',
  sharedPaths: RUNTIME_INPUT_VALUE,
  stepGroupInfra: {
    type: 'KubernetesDirect',
    spec: {
      connectorRef: RUNTIME_INPUT_VALUE,
      namespace: RUNTIME_INPUT_VALUE,
      volumes: RUNTIME_INPUT_VALUE,
      serviceAccountName: RUNTIME_INPUT_VALUE,
      automountServiceAccountToken: RUNTIME_INPUT_VALUE as any,
      priorityClassName: RUNTIME_INPUT_VALUE,
      labels: [
        {
          k1: RUNTIME_INPUT_VALUE
        }
      ] as any,
      annotations: [{ aKey1: RUNTIME_INPUT_VALUE }] as any,
      containerSecurityContext: {
        capabilities: {
          add: ['c1'],
          drop: ['c2']
        },
        privileged: RUNTIME_INPUT_VALUE as any,
        allowPrivilegeEscalation: RUNTIME_INPUT_VALUE as any,
        runAsNonRoot: RUNTIME_INPUT_VALUE as any,
        readOnlyRootFilesystem: RUNTIME_INPUT_VALUE as any,
        runAsUser: RUNTIME_INPUT_VALUE as any
      },
      nodeSelector: [
        {
          nsKey1: RUNTIME_INPUT_VALUE
        }
      ] as any,
      tolerations: RUNTIME_INPUT_VALUE as any,
      hostNames: RUNTIME_INPUT_VALUE as any,
      initTimeout: RUNTIME_INPUT_VALUE,
      harnessImageConnectorRef: RUNTIME_INPUT_VALUE,
      os: 'Linux'
    }
  },
  steps: [
    {
      step: {
        type: 'Wait',
        name: 'Wait_1',
        identifier: 'Wait_1',
        spec: {
          duration: '10m'
        }
      }
    }
  ]
}
