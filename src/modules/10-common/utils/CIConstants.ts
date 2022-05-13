/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
export const DEFAULT_ORG_ID = 'default'

export const DEFAULT_PROJECT_NAME = 'Default Project'

export const DEFAULT_PROJECT_ID = 'Default_Project_'.concat(new Date().getTime().toString())

export const DEFAULT_ORG_NAME = 'Default_Org'

export const UNIQUE_ORG_ID = 'Default_Org_'.concat(new Date().getTime().toString())

export const DEFAULT_PIPELINE_NAME = 'Default Pipeline'

export const DEFAULT_PIPELINE_ID = 'Default_Pipeline_'.concat(new Date().getTime().toString())

export const DEFAULT_PIPELINE_PAYLOAD = {
  pipeline: {
    name: DEFAULT_PIPELINE_NAME,
    identifier: DEFAULT_PIPELINE_ID,
    projectIdentifier: '',
    orgIdentifier: '',
    properties: {
      ci: {
        codebase: {
          connectorRef: 'connectorRef',
          build: '<+input>'
        }
      }
    },
    stages: [
      {
        stage: {
          name: 'Stage',
          identifier: 'Stage',
          type: 'CI',
          spec: {
            cloneCodebase: true,
            infrastructure: {
              type: 'KubernetesDirect',
              spec: {
                connectorRef: '<+input>',
                namespace: '<+input>',
                automountServiceAccountToken: true
              }
            },
            execution: {
              steps: [
                {
                  step: {
                    type: 'Run',
                    name: 'Run',
                    identifier: 'Run',
                    spec: {
                      connectorRef: '<+input>',
                      image: '<+input>',
                      shell: 'Sh',
                      command: '<+input>'
                    }
                  }
                }
              ]
            }
          }
        }
      }
    ]
  }
}

export enum Status {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  FAILURE = 'FAILURE'
}
