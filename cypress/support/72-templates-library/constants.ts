export const versionLabel = '1122'
export const pipelineTemplateName = 'New Pipeline Template Name'
export const pipelineMadeFromTemplate = 'Pipeline From Template Test'
export const templateUsedForPipeline = 'testPipelineTemplate'

export const incompletePipelineCreationResponse = {
  status: 'ERROR',
  code: 'TEMPLATE_EXCEPTION',
  message: 'yamlNode provided doesn not have root yaml field: pipeline',
  correlationId: '32e010a4-a01f-4595-b8c1-f7c2d79fb4c6',
  detailedMessage: null,
  responseMessages: [
    {
      code: 'TEMPLATE_EXCEPTION',
      level: 'ERROR',
      message: 'yamlNode provided doesn not have root yaml field: pipeline',
      exception: null,
      failureTypes: []
    }
  ],
  metadata: null
}

export const pipelineTemplatePublishResponse = {
  status: 'SUCCESS',
  data: {
    mergedPipelineYaml:
      'name: "New Pipeline Template Name"\nidentifier: "new_pipeline_template_name"\nversionLabel: "1122"\ntype: "Pipeline"\nprojectIdentifier: "project1"\norgIdentifier: "default"\ntags: {}\n',
    templateReferenceSummaries: []
  },
  metaData: null,
  correlationId: '8b05db42-9f08-4850-87bb-e5c8c4ed967e'
}
export const selectedPipelineTemplateResponse = {
  status: 'SUCCESS',
  data: 'stages:\n- stage:\n    identifier: "teststage"\n    type: "Deployment"\n    spec:\n      service:\n        serviceRef: "<+input>"\n        serviceInputs: "<+input>"\n      environment:\n        environmentRef: "<+input>"\n        environmentInputs: "<+input>"\n        serviceOverrideInputs: "<+input>"\n        infrastructureDefinitions: "<+input>"\n',
  metaData: null,
  correlationId: 'abac43d0-0d82-4500-a61a-ba234cff6b6f'
}
export const applyTemplateResponse = {
  status: 'SUCCESS',
  data: {
    mergedPipelineYaml:
      'name: ${templateUsedForPipeline}\nidentifier: ${templateUsedForPipeline}\nversionLabel: "v1.0"\ntype: "Pipeline"\nprojectIdentifier: "TemplateTestSanity3"\norgIdentifier: "Pipelines_UI_Organisation"\ntags: {}\nspec:\n  stages:\n  - stage:\n      name: "teststage"\n      identifier: "teststage"\n      description: ""\n      type: "Deployment"\n      spec:\n        deploymentType: "Kubernetes"\n        service:\n          serviceRef: "<+input>"\n          serviceInputs: "<+input>"\n        environment:\n          environmentRef: "<+input>"\n          deployToAll: false\n          environmentInputs: "<+input>"\n          serviceOverrideInputs: "<+input>"\n          infrastructureDefinitions: "<+input>"\n        execution:\n          steps:\n          - step:\n              name: "Rollout Deployment"\n              identifier: "rolloutDeployment"\n              type: "K8sRollingDeploy"\n              timeout: "10m"\n              spec:\n                skipDryRun: false\n          rollbackSteps:\n          - step:\n              name: "Rollback Rollout Deployment"\n              identifier: "rollbackRolloutDeployment"\n              type: "K8sRollingRollback"\n              timeout: "10m"\n              spec: {}\n      tags: {}\n      failureStrategies:\n      - onFailure:\n          errors:\n          - "AllErrors"\n          action:\n            type: "StageRollback"\n',
    templateReferenceSummaries: []
  },
  metaData: null,
  correlationId: '416b502d-11bb-461b-9706-7aa40d95016f'
}

export const selectedTemplateListFromPipeline = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        accountId: 'accountId',
        orgIdentifier: 'default',
        projectIdentifier: 'project1',
        identifier: templateUsedForPipeline,
        name: templateUsedForPipeline,
        description: '',
        tags: {},
        yaml: 'template:\n  name: ${templateUsedForPipeline}\n  identifier: ${templateUsedForPipeline}\n  versionLabel: v1.0\n  type: Pipeline\n  projectIdentifier: project1\n  orgIdentifier: default\n  tags: {}\n  spec:\n    stages:\n      - stage:\n          name: testStage\n          identifier: testStage\n          description: ""\n          type: Deployment\n          spec:\n            serviceConfig:\n              serviceRef: service_1\n              serviceDefinition:\n                spec:\n                  variables: []\n                type: Kubernetes\n            infrastructure:\n              infrastructureDefinition:\n                type: KubernetesDirect\n                spec:\n                  connectorRef: <+input>\n                  namespace: <+input>\n                  releaseName: release-<+INFRA_KEY>\n              allowSimultaneousDeployments: false\n              environmentRef: <+input>\n            execution:\n              steps:\n                - step:\n                    name: Rollout Deployment\n                    identifier: rolloutDeployment\n                    type: K8sRollingDeploy\n                    timeout: 10m\n                    spec:\n                      skipDryRun: false\n              rollbackSteps:\n                - step:\n                    name: Rollback Rollout Deployment\n                    identifier: rollbackRolloutDeployment\n                    type: K8sRollingRollback\n                    timeout: 10m\n                    spec: {}\n          tags: {}\n          failureStrategies:\n            - onFailure:\n                errors:\n                  - AllErrors\n                action:\n                  type: StageRollback\n',
        versionLabel: 'v1.0',
        templateEntityType: 'Pipeline',
        templateScope: 'project',
        version: 0,
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
        entityValidityDetails: {
          valid: true,
          invalidYaml: null
        },
        lastUpdatedAt: 1661243271130,
        createdAt: 1661243271130,
        stableTemplate: true
      }
    ],
    pageable: {
      sort: {
        unsorted: false,
        sorted: true,
        empty: false
      },
      pageNumber: 0,
      pageSize: 25,
      offset: 0,
      paged: true,
      unpaged: false
    },
    totalPages: 1,
    totalElements: 1,
    last: true,
    sort: {
      unsorted: false,
      sorted: true,
      empty: false
    },
    number: 0,
    first: true,
    numberOfElements: 1,
    size: 25,
    empty: false
  },
  metaData: null,
  correlationId: 'cefe0619-9a2c-486d-ae5a-fa1f033a75e1'
}
export const templateListCallAfterSelectionResponse = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        accountId: 'accountId',
        orgIdentifier: 'default',
        projectIdentifier: 'project1',
        identifier: templateUsedForPipeline,
        name: templateUsedForPipeline,
        description: '',
        tags: {},
        yaml: 'template:\n  name: ${templateUsedForPipeline}\n  identifier: ${templateUsedForPipeline}\n  versionLabel: v1.0\n  type: Pipeline\n  projectIdentifier: TemplateTestSanity3\n  orgIdentifier: Pipelines_UI_Organisation\n  tags: {}\n  spec:\n    stages:\n      - stage:\n          name: teststage\n          identifier: teststage\n          description: ""\n          type: Deployment\n          spec:\n            deploymentType: Kubernetes\n            service:\n              serviceRef: <+input>\n              serviceInputs: <+input>\n            environment:\n              environmentRef: <+input>\n              deployToAll: false\n              environmentInputs: <+input>\n              serviceOverrideInputs: <+input>\n              infrastructureDefinitions: <+input>\n            execution:\n              steps:\n                - step:\n                    name: Rollout Deployment\n                    identifier: rolloutDeployment\n                    type: K8sRollingDeploy\n                    timeout: 10m\n                    spec:\n                      skipDryRun: false\n              rollbackSteps:\n                - step:\n                    name: Rollback Rollout Deployment\n                    identifier: rollbackRolloutDeployment\n                    type: K8sRollingRollback\n                    timeout: 10m\n                    spec: {}\n          tags: {}\n          failureStrategies:\n            - onFailure:\n                errors:\n                  - AllErrors\n                action:\n                  type: StageRollback\n',
        versionLabel: 'v1.0',
        templateEntityType: 'Pipeline',
        templateScope: 'project',
        version: 0,
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
        entityValidityDetails: {
          valid: true,
          invalidYaml: null
        },
        lastUpdatedAt: 1661406218981,
        createdAt: 1661406218981,
        stableTemplate: true
      }
    ],
    pageable: {
      sort: {
        sorted: true,
        unsorted: false,
        empty: false
      },
      pageSize: 25,
      pageNumber: 0,
      offset: 0,
      paged: true,
      unpaged: false
    },
    totalPages: 1,
    totalElements: 1,
    last: true,
    sort: {
      sorted: true,
      unsorted: false,
      empty: false
    },
    number: 0,
    first: true,
    numberOfElements: 1,
    size: 25,
    empty: false
  },
  metaData: null,
  correlationId: '1c6439a1-d4d8-46f2-af04-d658ede277ff'
}

export const afterUseTemplateEndpointResponse = {
  status: 'SUCCESS',
  data: {
    mergedPipelineYaml:
      'pipeline:\n  name: ${pipelineMadeFromTemplate}\n  identifier: ${pipelineMadeFromTemplate}\n  stages:\n  - stage:\n      identifier: "teststage"\n      type: "Deployment"\n      name: "teststage"\n      description: ""\n      spec:\n        serviceConfig:\n          serviceRef: "servicetest"\n          serviceDefinition:\n            type: "ServerlessAwsLambda"\n            spec:\n              variables: []\n        execution:\n          steps:\n          - step:\n              identifier: "rolloutDeployment"\n              type: "K8sRollingDeploy"\n              name: "Rollout Deployment"\n              timeout: "10m"\n              spec:\n                skipDryRun: false\n          rollbackSteps:\n          - step:\n              identifier: "rollbackRolloutDeployment"\n              type: "K8sRollingRollback"\n              name: "Rollback Rollout Deployment"\n              timeout: "10m"\n              spec: {}\n        infrastructure:\n          infrastructureDefinition:\n            type: "ServerlessAwsLambda"\n          allowSimultaneousDeployments: false\n      tags: {}\n      failureStrategies:\n      - onFailure:\n          errors:\n          - "AllErrors"\n          action:\n            type: "StageRollback"\n  tags: {}\n  projectIdentifier: "TemplateTestSanity3"\n  orgIdentifier: "Pipelines_UI_Organisation"\n',
    templateReferenceSummaries: [
      {
        fqn: 'pipeline',
        templateIdentifier: templateUsedForPipeline,
        versionLabel: 'v1',
        scope: 'project',
        stableTemplate: false,
        moduleInfo: []
      }
    ]
  },
  metaData: null,
  correlationId: 'af36bd52-f04b-48a0-a699-f0c9bdaaf398'
}
export const afterUseTemplatePipelineTemplateNameResponse = {
  status: 'SUCCESS',
  data: {
    accountId: 'accountId',
    orgIdentifier: 'default',
    projectIdentifier: 'project1',
    identifier: templateUsedForPipeline,
    name: templateUsedForPipeline,
    description: '',
    tags: {},
    yaml: 'template:\n  name: ${templateUsedForPipeline}\n  identifier: ${templateUsedForPipeline}\n  versionLabel: v1\n  type: Pipeline\n  projectIdentifier: TemplateTestSanity3\n  orgIdentifier: Pipelines_UI_Organisation\n  tags: {}\n  spec:\n    stages:\n      - stage:\n          name: teststage\n          identifier: teststage\n          description: ""\n          type: Deployment\n          spec:\n            serviceConfig:\n              serviceRef: servicetest\n              serviceDefinition:\n                spec:\n                  variables: []\n                type: ServerlessAwsLambda\n            execution:\n              steps:\n                - step:\n                    name: Rollout Deployment\n                    identifier: rolloutDeployment\n                    type: K8sRollingDeploy\n                    timeout: 10m\n                    spec:\n                      skipDryRun: false\n              rollbackSteps:\n                - step:\n                    name: Rollback Rollout Deployment\n                    identifier: rollbackRolloutDeployment\n                    type: K8sRollingRollback\n                    timeout: 10m\n                    spec: {}\n            infrastructure:\n              environmentRef: <+input>\n              infrastructureDefinition:\n                type: ServerlessAwsLambda\n                spec:\n                  connectorRef: <+input>\n                  stage: <+input>\n                  region: <+input>\n              allowSimultaneousDeployments: false\n          tags: {}\n          failureStrategies:\n            - onFailure:\n                errors:\n                  - AllErrors\n                action:\n                  type: StageRollback\n',
    versionLabel: 'v1',
    templateEntityType: 'Pipeline',
    templateScope: 'project',
    version: 0,
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
    entityValidityDetails: {
      valid: true,
      invalidYaml: null
    },
    lastUpdatedAt: 1661168203483,
    storeType: 'INLINE',
    stableTemplate: true
  },
  metaData: null,
  correlationId: 'e204520d-ac73-4148-856f-e3e913d2fd3e'
}
export const afterUseTemplateApplyTemplateResponse = {
  status: 'SUCCESS',
  data: {
    mergedPipelineYaml:
      'pipeline:\n  name: ${pipelineMadeFromTemplate}\n  identifier: ${pipelineMadeFromTemplate}\n  stages:\n  - stage:\n      identifier: "teststage"\n      type: "Deployment"\n      name: "teststage"\n      description: ""\n      spec:\n        serviceConfig:\n          serviceRef: "servicetest"\n          serviceDefinition:\n            type: "ServerlessAwsLambda"\n            spec:\n              variables: []\n        execution:\n          steps:\n          - step:\n              identifier: "rolloutDeployment"\n              type: "K8sRollingDeploy"\n              name: "Rollout Deployment"\n              timeout: "10m"\n              spec:\n                skipDryRun: false\n          rollbackSteps:\n          - step:\n              identifier: "rollbackRolloutDeployment"\n              type: "K8sRollingRollback"\n              name: "Rollback Rollout Deployment"\n              timeout: "10m"\n              spec: {}\n        infrastructure:\n          infrastructureDefinition:\n            type: "ServerlessAwsLambda"\n          allowSimultaneousDeployments: false\n      tags: {}\n      failureStrategies:\n      - onFailure:\n          errors:\n          - "AllErrors"\n          action:\n            type: "StageRollback"\n  tags: {}\n  projectIdentifier: "TemplateTestSanity3"\n  orgIdentifier: "Pipelines_UI_Organisation"\n',
    templateReferenceSummaries: [
      {
        fqn: 'pipeline',
        templateIdentifier: templateUsedForPipeline,
        versionLabel: 'v1.0',
        scope: 'project',
        stableTemplate: false,
        moduleInfo: []
      }
    ]
  },
  metaData: null,
  correlationId: 'af36bd52-f04b-48a0-a699-f0c9bdaaf398'
}
export const afterUseTemplatePipelineTemplateInputsResponse = {
  status: 'SUCCESS',
  data: 'stages:\n- stage:\n    identifier: "teststage"\n    type: "Deployment"\n    spec:\n      infrastructure:\n        environmentRef: "<+input>"\n        infrastructureDefinition:\n          type: "ServerlessAwsLambda"\n          spec:\n            connectorRef: "<+input>"\n            stage: "<+input>"\n            region: "<+input>"\n',
  metaData: null,
  correlationId: 'e097de1b-9135-4a16-82ef-344d8049c4fa'
}
