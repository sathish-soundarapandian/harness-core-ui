import type { SelectedStageType } from '../utils'
export const selectedStageMock: SelectedStageType = {
  stage: {
    name: 'azure',
    identifier: 'azure',
    description: '',
    type: 'Deployment',
    spec: {
      deploymentType: 'AzureWebApp',
      service: {
        serviceRef: '<+input>'
      },
      execution: {
        steps: [
          {
            parallel: [
              {
                step: {
                  type: 'AzureSlotDeployment',
                  name: 'AzureSlotDeployment_1',
                  identifier: 'AzureSlotDeployment_1',
                  spec: {
                    deploymentSlot: 'doc-example',
                    webApp: 'doc-example'
                  },
                  timeout: '20m'
                }
              },
              {
                step: {
                  type: 'AzureSlotDeployment',
                  name: 'AzureSlotDeployment_2',
                  identifier: 'AzureSlotDeployment_2',
                  spec: {
                    webApp: '<+input>',
                    deploymentSlot: '<+input>'
                  },
                  timeout: '20m'
                }
              }
            ]
          }
        ],
        rollbackSteps: [
          {
            step: {
              name: 'WebApp rollback',
              identifier: 'webAppRollback',
              type: 'AzureWebAppRollback',
              timeout: '20m',
              spec: {}
            }
          }
        ]
      },
      environment: {
        environmentRef: 'a1',
        deployToAll: false,
        infrastructureDefinitions: [
          {
            identifier: 'a34'
          }
        ]
      }
    },
    tags: {},
    failureStrategies: [
      {
        onFailure: {
          errors: ['AllErrors'],
          action: {
            type: 'StageRollback'
          }
        }
      }
    ]
  }
}
