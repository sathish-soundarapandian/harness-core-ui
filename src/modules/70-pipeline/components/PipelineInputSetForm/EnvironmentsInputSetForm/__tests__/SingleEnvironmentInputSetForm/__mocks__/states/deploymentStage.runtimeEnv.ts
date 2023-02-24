/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DeploymentStageConfig } from 'services/cd-ng'

export const runtimeEnvDS: DeploymentStageConfig = {
  deploymentType: 'Kubernetes',
  service: {
    serviceRef: 'svc_to_override'
  },
  environment: {
    environmentRef: '<+input>',
    deployToAll: false,
    environmentInputs: '<+input>' as any,
    serviceOverrideInputs: '<+input>' as any,
    infrastructureDefinitions: '<+input>' as any
  },
  execution: {
    steps: [
      {
        step: {
          identifier: 'ShellScript_1',
          type: 'ShellScript',
          name: 'Shell Script_1',
          spec: {
            shell: 'Bash',
            onDelegate: true,
            source: {
              type: 'Inline',
              spec: {
                script: 'echo "Hi"'
              }
            },
            environmentVariables: [],
            outputVariables: []
          },
          timeout: '10m'
        }
      }
    ],
    rollbackSteps: []
  }
}
