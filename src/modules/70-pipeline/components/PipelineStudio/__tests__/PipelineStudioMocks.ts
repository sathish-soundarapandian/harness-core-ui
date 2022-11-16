/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const PipelineResponse = {
  status: 'SUCCESS',
  data: {
    ngPipeline: {},
    executionsPlaceHolder: [],
    yamlPipeline:
      'pipeline:\n  name: editPipeline\n  identifier: editPipeline\n  description: ""\n  stages:\n    - parallel:\n        - stage:\n            name: asd\n            identifier: asd\n            description: ""\n            type: Deployment\n            spec:\n              service:\n                identifier: asd\n                name: asd\n                description: ""\n                serviceDefinition:\n                  type: Kubernetes\n                  spec:\n                    artifacts:\n                      sidecars: []\n                      primary:\n                        type: Dockerhub\n                        spec:\n                          connectorRef: org.docker\n                          imagePath: asd\n                    manifests: []\n                    artifactOverrideSets: []\n                    manifestOverrideSets: []\n              execution:\n                steps:\n                  - step:\n                      name: Rollout Deployment\n                      identifier: rolloutDeployment\n                      type: K8sRollingDeploy\n                      spec:\n                        timeout: 10m\n                        skipDryRun: false\n                rollbackSteps:\n                  - step:\n                      name: Rollback Rollout Deployment\n                      identifier: rollbackRolloutDeployment\n                      type: K8sRollingRollback\n                      spec:\n                        timeout: 10m\n              infrastructure:\n                environment:\n                  name: qa\n                  identifier: qa\n                  description: ""\n                  type: PreProduction\n                infrastructureDefinition:\n                  type: KubernetesDirect\n                  spec:\n                    connectorRef: <+input>\n                    namespace: <+input>\n                    releaseName: <+input>\n        - stage:\n            name: test1\n            identifier: test1\n            description: ""\n            type: Deployment\n            spec:\n              execution: {}\n    - stage:\n        name: test2\n        identifier: test2\n        description: ""\n        type: Deployment\n        spec:\n          execution: {}\n'
  },
  metaData: null,
  correlationId: '969ad7a4-0629-4965-8940-1e12c15c504c'
}

export const StepsResponse = {
  status: 'SUCCESS',
  data: {
    name: 'Library',
    stepsData: [],
    stepCategories: [
      {
        name: 'Kubernetes',
        stepsData: [
          { type: 'Placeholder', name: 'Apply' },
          { type: 'Placeholder', name: 'Scale' },
          { type: 'Placeholder', name: 'Stage Deployment' },
          { type: 'K8sRollingDeploy', name: 'K8s Rolling' },
          { type: 'K8sRollingRollback', name: 'K8s Rolling Rollback' },
          { type: 'Placeholder', name: 'Swap Selectors' },
          { type: 'Placeholder', name: 'Delete' },
          { type: 'Placeholder', name: 'Deployment' }
        ],
        stepCategories: []
      },
      {
        name: 'Infrastructure Provisioners',
        stepsData: [],
        stepCategories: [
          {
            name: 'Terraform',
            stepsData: [
              { type: 'Placeholder', name: 'Terraform Apply' },
              { type: 'Placeholder', name: 'Terraform Provision' },
              { type: 'Placeholder', name: 'Terraform Delete' }
            ],
            stepCategories: []
          },
          {
            name: 'Cloudformation',
            stepsData: [
              { type: 'Placeholder', name: 'Create Stack' },
              { type: 'Placeholder', name: 'Delete Stack' }
            ],
            stepCategories: []
          },
          {
            name: 'Shell Script Provisioner',
            stepsData: [{ type: 'Placeholder', name: 'Shell Script Provisioner' }],
            stepCategories: []
          }
        ]
      },
      {
        name: 'Issue Tracking',
        stepsData: [
          { type: 'Placeholder', name: 'Jira' },
          { type: 'Placeholder', name: 'ServiceNow' }
        ],
        stepCategories: []
      },
      { name: 'Notification', stepsData: [{ type: 'Placeholder', name: 'Email' }], stepCategories: [] },
      { name: 'Flow Control', stepsData: [{ type: 'Placeholder', name: 'Barriers' }], stepCategories: [] },
      {
        name: 'Utilites',
        stepsData: [],
        stepCategories: [
          {
            name: 'Scripted',
            stepsData: [
              { type: 'ShellScript', name: 'Shell Script' },
              { type: 'Http', name: 'Http' }
            ],
            stepCategories: []
          },
          {
            name: 'Non-Scripted',
            stepsData: [
              { type: 'Placeholder', name: 'New Relic Deployment Maker' },
              { type: 'Placeholder', name: 'Templatized Secret Manager' }
            ],
            stepCategories: []
          }
        ]
      }
    ]
  },
  metaData: null,
  correlationId: '16826f95-19e8-41f1-8cf2-8dfb844a8fa2'
}

export const ExecutionResponse = {
  status: 'SUCCESS',
  data: {
    Kubernetes: ['Rolling', 'BlueGreen', 'Canary'],
    Ssh: ['Basic'],
    Helm: ['Basic'],
    Ecs: ['Basic', 'BlueGreen', 'Canary'],
    Pcf: ['Basic', 'BlueGreen', 'Canary']
  },
  metaData: null,
  correlationId: '4c1b97ff-bd37-4965-af23-610e4f080d1c'
}

export const YamlResponse = {
  status: 'SUCCESS',
  data: 'execution:\n  steps:\n    - step:\n        name: "Rollout Deployment"\n        identifier: rolloutDeployment\n        type: K8sRollingDeploy\n        spec:\n          timeout: 10m\n          skipDryRun: false\n  rollbackSteps:\n    - step:\n        name: "Rollback Rollout Deployment"\n        identifier: rollbackRolloutDeployment\n        type: K8sRollingRollback\n        spec:\n          timeout: 10m',
  metaData: null,
  correlationId: '311c0c61-8164-406a-b277-5064a56cba3f'
}
