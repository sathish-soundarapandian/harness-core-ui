// Variables
export const versionLabel = '1122'
export const pipelineTemplateName = 'New Pipeline Template Name'
export const pipelineMadeFromTemplate = 'Pipeline From Template Test'
export const templateUsedForPipeline = 'testPipelineTemplate'

//Endpoints
export const deploymentTemplatesListCall =
  '/template/api/templates/list?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&templateListType=Stable&searchTerm=&page=0&size=20&includeAllTemplatesAvailableAtScope=true'
export const useTemplateCall =
  '/template/api/templates/dep_temp_test?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&orgIdentifier=default&versionLabel=1&getDefaultFromOtherRepo=true'
export const afterUseTemplateListCall =
  '/template/api/templates/list?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&templateListType=Stable&getDefaultFromOtherRepo=true'
export const afterSaveServiceEndpointPOST = '/ng/api/servicesV2?routingId=accountId&accountIdentifier=accountId'
export const afterSaveServiceNameEndpoint =
  '/ng/api/servicesV2/testServiceV2?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
export const afterSaveServiceHeaderEndpoint =
  '/ng/api/dashboard/getServiceHeaderInfo?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&serviceId=testServiceV2'

export const incompleteTemplateCreationResponse = {
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

//API Responses
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
export const stepTemplateListCallAfterSelectionResponse = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        accountId: 'accountId',
        orgIdentifier: 'default',
        projectIdentifier: 'project1',
        identifier: 'testStepTemplate_Cypress',
        name: 'testStepTemplate_Cypress',
        description: '',
        tags: {},
        yaml: 'template:\n  name: testStepTemplate_Cypress\n  type: Step\n  projectIdentifier: samarthproject\n  orgIdentifier: samarth_org\n  spec:\n    type: Http\n    timeout: 10s\n    spec:\n      url: <+input>\n      method: GET\n      headers: []\n      outputVariables: []\n  identifier: http_project_level\n  versionLabel: "212"\n',
        versionLabel: '212',
        templateEntityType: 'Step',
        childType: 'Http',
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
        lastUpdatedAt: 1664047838696,
        createdAt: 1664047838696,
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
    last: true,
    totalElements: 1,
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
  correlationId: '6634a9fa-bbdc-4ed3-9405-a34d5fc5c446'
}
export const deploymentTemplateInputCallAfterSelectionResponse = {
  status: 'SUCCESS',
  data: 'type: "Http"\nspec:\n  url: "<+input>"\n',
  metaData: null,
  correlationId: 'c53ebaa8-b420-4c94-82c9-9bf128dfcf62'
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

export const useTemplateResponse = {
  status: 'SUCCESS',
  data: {
    accountId: 'accountId',
    orgIdentifier: 'default',
    projectIdentifier: 'project1',
    identifier: 'dep_temp_test',
    name: 'dep temp test',
    description: '',
    tags: {},
    yaml: 'template:\n  name: dep temp test\n  identifier: dep_temp_test\n  versionLabel: "1"\n  type: CustomDeployment\n  projectIdentifier: project1\n  orgIdentifier: default\n  tags: {}\n  spec:\n    infrastructure:\n      variables:\n        - name: string\n          type: String\n          description: ""\n          value: Hi\n        - name: secret\n          type: Secret\n          description: ""\n          value: account.jenkinssecret1\n        - name: number\n          type: Number\n          description: ""\n          value: 10\n        - name: connector\n          type: Connector\n          description: ""\n          value: gitConnector\n        - name: string1\n          type: String\n          description: ""\n          value: Hi\n        - name: secret1\n          type: Secret\n          description: ""\n          value: account.JenkinsPassword\n        - name: number1\n          type: Number\n          description: ""\n          value: 10\n        - name: connector1\n          type: Connector\n          description: ""\n          value: testArtifactory\n        - name: stringRuntime\n          type: String\n          description: ""\n          value: <+input>\n        - name: secretRuntime\n          type: Secret\n          description: ""\n          value: <+input>\n        - name: numberRuntime\n          type: Number\n          description: ""\n          value: <+input>\n        - name: connectorRuntime\n          type: Connector\n          description: ""\n          value: <+input>\n        - name: stringExpression\n          type: String\n          description: ""\n          value: <+stage.spec.infrastructure.output.variables.string>\n        - name: secretExpression\n          type: Secret\n          description: ""\n          value: <+stage.spec.infrastructure.output.variables.secret>\n        - name: numberExpression\n          type: Number\n          description: ""\n          value: <+stage.spec.infrastructure.output.variables.number>\n        - name: connectorExpression\n          type: Connector\n          description: ""\n          value: test\n      fetchInstancesScript:\n        store:\n          type: Inline\n          spec:\n            content: fsdfdsf\n      instanceAttributes:\n        - name: hostname\n          jsonPath: dsf\n          description: dfsf\n      instancesListPath: dfdsf\n    execution:\n      stepTemplateRefs:\n        - templateRef: org.new_org_http\n          versionLabel: "1"\n        - templateRef: new_http_temp\n          versionLabel: "1"\n        - templateRef: new_shell_temp\n          versionLabel: "1"\n        - templateRef: account.accountSetup\n          versionLabel: "1"\n        - templateRef: custom_shell\n          versionLabel: "1"\n',
    versionLabel: '1',
    templateEntityType: 'CustomDeployment',
    templateScope: 'project',
    version: 6,
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
    lastUpdatedAt: 1664279690633,
    storeType: 'INLINE',
    stableTemplate: true
  },
  metaData: null,
  correlationId: '36190130-22f4-4f93-a2b8-c7dd3a1926bd'
}
export const afterUseTemplateListResponse = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        accountId: 'accountId',
        orgIdentifier: 'default',
        projectIdentifier: 'project1',
        identifier: 'dep_temp_test',
        name: 'dep temp test',
        description: '',
        tags: {},
        yaml: 'template:\n  name: dep temp test\n  identifier: dep_temp_test\n  versionLabel: "1"\n  type: CustomDeployment\n  projectIdentifier: project1\n  orgIdentifier: default\n  tags: {}\n  spec:\n    infrastructure:\n      variables:\n        - name: string\n          type: String\n          description: ""\n          value: Hi\n        - name: secret\n          type: Secret\n          description: ""\n          value: account.jenkinssecret1\n        - name: number\n          type: Number\n          description: ""\n          value: 10\n        - name: connector\n          type: Connector\n          description: ""\n          value: gitConnector\n        - name: string1\n          type: String\n          description: ""\n          value: Hi\n        - name: secret1\n          type: Secret\n          description: ""\n          value: account.JenkinsPassword\n        - name: number1\n          type: Number\n          description: ""\n          value: 10\n        - name: connector1\n          type: Connector\n          description: ""\n          value: testArtifactory\n        - name: stringRuntime\n          type: String\n          description: ""\n          value: <+input>\n        - name: secretRuntime\n          type: Secret\n          description: ""\n          value: <+input>\n        - name: numberRuntime\n          type: Number\n          description: ""\n          value: <+input>\n        - name: connectorRuntime\n          type: Connector\n          description: ""\n          value: <+input>\n        - name: stringExpression\n          type: String\n          description: ""\n          value: <+stage.spec.infrastructure.output.variables.string>\n        - name: secretExpression\n          type: Secret\n          description: ""\n          value: <+stage.spec.infrastructure.output.variables.secret>\n        - name: numberExpression\n          type: Number\n          description: ""\n          value: <+stage.spec.infrastructure.output.variables.number>\n        - name: connectorExpression\n          type: Connector\n          description: ""\n          value: test\n      fetchInstancesScript:\n        store:\n          type: Inline\n          spec:\n            content: fsdfdsf\n      instanceAttributes:\n        - name: hostname\n          jsonPath: dsf\n          description: dfsf\n      instancesListPath: dfdsf\n    execution:\n      stepTemplateRefs:\n        - templateRef: org.new_org_http\n          versionLabel: "1"\n        - templateRef: new_http_temp\n          versionLabel: "1"\n        - templateRef: new_shell_temp\n          versionLabel: "1"\n        - templateRef: account.accountSetup\n          versionLabel: "1"\n        - templateRef: custom_shell\n          versionLabel: "1"\n',
        versionLabel: '1',
        templateEntityType: 'CustomDeployment',
        templateScope: 'project',
        version: 6,
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
        lastUpdatedAt: 1664279690633,
        createdAt: 1663786495503,
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
  correlationId: '6c46fbb4-80f1-4b34-8690-05e8e06e4e07'
}
