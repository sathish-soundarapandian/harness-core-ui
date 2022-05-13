/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type {
  ResponseString,
  ResponsePageTemplateSummaryResponse,
  ResponseTemplateResponse,
  TemplateResponse
} from 'services/template-ng'
import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'

export const stageTemplateVersion1: ResponseTemplateResponse = {
  status: 'SUCCESS',
  data: {
    accountId: 'px7xd_BFRCi-pfWPYXVjvw',
    childType: 'Deployment',
    description: '',
    identifier: 'Test_Stage_Template',
    lastUpdatedAt: 1643962532126,
    name: 'Test Stage Template',
    orgIdentifier: 'default',
    projectIdentifier: 'Yogesh_Test',
    stableTemplate: true,
    tags: {},
    templateEntityType: 'Stage',
    templateScope: 'project',
    version: 0,
    versionLabel: 'Version1',
    yaml:
      'template:' +
      '\n    name: Test Stage Template' +
      '\n    identifier: Test_Stage_Template' +
      '\n    versionLabel: Version1' +
      '\n    type: Stage' +
      '\n    projectIdentifier: Yogesh_Test' +
      '\n    orgIdentifier: default' +
      '\n    tags: {}' +
      '\n    spec:' +
      '\n        type: Deployment' +
      '\n        spec:' +
      '\n            serviceConfig:' +
      '\n                serviceRef: <+input>' +
      '\n                serviceDefinition:' +
      '\n                    type: Kubernetes' +
      '\n                    spec:' +
      '\n                        variables: []' +
      '\n            infrastructure:' +
      '\n                environmentRef: Some_Environment' +
      '\n                infrastructureDefinition:' +
      '\n                    type: KubernetesDirect' +
      '\n                    spec:' +
      '\n                        connectorRef: account.test_k8' +
      '\n                        namespace: <+input>' +
      '\n                        releaseName: release-<+INFRA_KEY>' +
      '\n                allowSimultaneousDeployments: false' +
      '\n            execution:' +
      '\n                steps:' +
      '\n                    - step:' +
      '\n                          type: ShellScript' +
      '\n                          name: Step 1' +
      '\n                          identifier: Step_1' +
      '\n                          spec:' +
      '\n                              shell: Bash' +
      '\n                              onDelegate: true' +
      '\n                              source:' +
      '\n                                  type: Inline' +
      '\n                                  spec:' +
      '\n                                      script: <+input>' +
      '\n                              environmentVariables: []' +
      '\n                              outputVariables: []' +
      '\n                              executionTarget: {}' +
      '\n                          timeout: 10m' +
      '\n                rollbackSteps: []' +
      '\n        failureStrategies:' +
      '\n            - onFailure:' +
      '\n                  errors:' +
      '\n                      - AllErrors' +
      '\n                  action:' +
      '\n                      type: StageRollback' +
      '\n'
  }
}

export const stageMockTemplateVersion1InputYaml: ResponseString = {
  status: 'SUCCESS',
  data:
    'type: "Deployment"' +
    '\nspec:' +
    '\n  serviceConfig:' +
    '\n    serviceRef: "<+input>"' +
    '\n  infrastructure:' +
    '\n    infrastructureDefinition:' +
    '\n      type: "KubernetesDirect"' +
    '\n      spec:' +
    '\n        namespace: "<+input>"' +
    '\n'
}

export const stageTemplateVersion2: ResponseTemplateResponse = {
  ...stageTemplateVersion1,
  data: {
    ...(stageTemplateVersion1.data as TemplateResponse),
    versionLabel: 'Version2',
    yaml:
      'template:' +
      '\n    name: Test Stage Template' +
      '\n    identifier: Test_Stage_Template' +
      '\n    versionLabel: Version2' +
      '\n    type: Stage' +
      '\n    projectIdentifier: Yogesh_Test' +
      '\n    orgIdentifier: default' +
      '\n    tags: {}' +
      '\n    spec:' +
      '\n        type: Deployment' +
      '\n        spec:' +
      '\n            serviceConfig:' +
      '\n                serviceDefinition:' +
      '\n                    type: Kubernetes' +
      '\n                    spec:' +
      '\n                        variables: []' +
      '\n                serviceRef: Some_Service' +
      '\n            infrastructure:' +
      '\n                environmentRef: Some_Environment' +
      '\n                infrastructureDefinition:' +
      '\n                    type: KubernetesDirect' +
      '\n                    spec:' +
      '\n                        connectorRef: account.test_k8' +
      '\n                        namespace: default' +
      '\n                        releaseName: release-<+INFRA_KEY>' +
      '\n                allowSimultaneousDeployments: false' +
      '\n            execution:' +
      '\n                steps:' +
      '\n                    - step:' +
      '\n                          type: ShellScript' +
      '\n                          name: Step 1' +
      '\n                          identifier: Step_1' +
      '\n                          spec:' +
      '\n                              shell: Bash' +
      '\n                              onDelegate: true' +
      '\n                              source:' +
      '\n                                  type: Inline' +
      '\n                                  spec:' +
      '\n                                      script: echo 1' +
      '\n                              environmentVariables: []' +
      '\n                              outputVariables: []' +
      '\n                              executionTarget: {}' +
      '\n                          timeout: 10m' +
      '\n                rollbackSteps: []' +
      '\n            serviceDependencies: []' +
      '\n'
  }
}

export const stageMockTemplateVersion2InputYaml: ResponseString = {
  status: 'SUCCESS'
}

export const pipelineTemplate: ResponseTemplateResponse = {
  status: 'SUCCESS',
  data: {
    accountId: 'px7xd_BFRCi-pfWPYXVjvw',
    description: '',
    identifier: 'Test_Pipeline_Template',
    lastUpdatedAt: 1637668359934,
    name: 'Test Pipeline Template',
    orgIdentifier: 'default',
    projectIdentifier: 'Yogesh_Test',
    stableTemplate: true,
    tags: {},
    templateEntityType: 'Pipeline',
    templateScope: 'project',
    version: 3,
    versionLabel: 'v1',
    yaml:
      'template:' +
      '\n    name: New Pipeline Template Name' +
      '\n    identifier: new_pipeline_template_name' +
      '\n    versionLabel: v2' +
      '\n    type: Pipeline' +
      '\n    projectIdentifier: Yogesh_Test' +
      '\n    orgIdentifier: default' +
      '\n    spec:' +
      '\n        stages:' +
      '\n            - stage:' +
      '\n                  name: Stage 1' +
      '\n                  identifier: Stage_1' +
      '\n                  description: ""' +
      '\n                  type: Deployment' +
      '\n                  spec:' +
      '\n                      serviceConfig:' +
      '\n                          serviceRef: <+input>' +
      '\n                          serviceDefinition:' +
      '\n                              type: Kubernetes' +
      '\n                              spec:' +
      '\n                                  variables:' +
      '\n                                      - name: var' +
      '\n                                        type: String' +
      '\n                                        value: <+input>' +
      '\n                      infrastructure:' +
      '\n                          environmentRef: Some_Environment' +
      '\n                          infrastructureDefinition:' +
      '\n                              type: KubernetesDirect' +
      '\n                              spec:' +
      '\n                                  connectorRef: account.testarpit' +
      '\n                                  namespace: default' +
      '\n                                  releaseName: release-<+INFRA_KEY>' +
      '\n                          allowSimultaneousDeployments: false' +
      '\n                      execution:' +
      '\n                          steps:' +
      '\n                              - step:' +
      '\n                                    type: ShellScript' +
      '\n                                    name: Step 1' +
      '\n                                    identifier: Step_1' +
      '\n                                    spec:' +
      '\n                                        shell: Bash' +
      '\n                                        onDelegate: true' +
      '\n                                        source:' +
      '\n                                            type: Inline' +
      '\n                                            spec:' +
      '\n                                                script: <+input>' +
      '\n                                        environmentVariables: []' +
      '\n                                        outputVariables: []' +
      '\n                                        executionTarget: {}' +
      '\n                                    timeout: 10m' +
      '\n                          rollbackSteps: []' +
      '\n                  tags: {}' +
      '\n                  failureStrategies:' +
      '\n                      - onFailure:' +
      '\n                            errors:' +
      '\n                                - AllErrors' +
      '\n                            action:' +
      '\n                                type: StageRollback' +
      '\n'
  }
}

export const stepTemplate: ResponseTemplateResponse = {
  status: 'SUCCESS',
  data: {
    accountId: 'px7xd_BFRCi-pfWPYXVjvw',
    childType: 'Http',
    description: '',
    identifier: 'Test_Http_Template',
    lastUpdatedAt: 1637668359934,
    name: 'Test Http Template',
    orgIdentifier: 'default',
    projectIdentifier: 'Yogesh_Test',
    stableTemplate: true,
    tags: {},
    templateEntityType: 'Step',
    templateScope: 'project',
    version: 3,
    versionLabel: 'v1',
    yaml:
      'template:' +
      '\n    name: Test Http Template' +
      '\n    identifier: Test_Http_Template' +
      '\n    versionLabel: v1' +
      '\n    type: Step' +
      '\n    projectIdentifier: Yogesh_Test' +
      '\n    orgIdentifier: default' +
      '\n    description: null' +
      '\n    tags: {}' +
      '\n    spec:' +
      '\n        type: Http' +
      '\n        timeout: 1m 40s' +
      '\n        spec:' +
      '\n            url: <+input>' +
      '\n            method: GET' +
      '\n            headers: []' +
      '\n            outputVariables: []' +
      '\n            requestBody: <+input>' +
      '\n'
  }
}

export const stepMockTemplatesInputYaml: ResponseString = {
  status: 'SUCCESS',
  data: 'type: "Http"' + '\nspec:' + '\n  url: "<+input>"' + '\n  requestBody: "<+input>"' + '\n'
}

export const mockTemplates: ResponsePageTemplateSummaryResponse = {
  status: 'SUCCESS',
  data: {
    content: [
      {
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'default',
        projectIdentifier: 'Templateproject',
        identifier: 'manjutesttemplate',
        name: 'manju-test-template-qq-12344',
        description:
          'Flink is a versatile framework, supporting many different deployment scenarios in a mix and match fashion.',
        tags: { QAR: '', 'Internal 1': '', 'Canary 1': '', BLUE: '', 'Tag A': '' },
        yaml:
          'template:' +
          '\n    name: manju-test-template-qq-12344' +
          '\n    identifier: manjutesttemplate' +
          '\n    versionLabel: v4' +
          '\n    type: Step' +
          '\n    projectIdentifier: Templateproject' +
          '\n    orgIdentifier: defaults' +
          '\n    description: Flink is a versatile framework, supporting many different deployment scenarios in a mix and match fashion.' +
          '\n    tags:' +
          '\n        QAR: ""' +
          '\n        Internal 1: ""' +
          '\n        Canary 1: ""' +
          '\n        BLUE: ""' +
          '\n        Tag A: ""' +
          '\n    spec:' +
          '\n        type: HarnessApproval' +
          '\n        timeout: <+input>' +
          '\n        spec:' +
          '\n            approvalMessage: <+input>' +
          '\n            includePipelineExecutionHistory: true' +
          '\n            approvers:' +
          '\n                userGroups: <+input>' +
          '\n                minimumCount: <+input>' +
          '\n                disallowPipelineExecutor: false' +
          '\n            approverInputs:' +
          '\n                - name: "1"' +
          '\n                  defaultValue: "1"' +
          '\n                - name: ttt' +
          '\n                  defaultValue: ttt' +
          '\n        failureStrategies:' +
          '\n            - onFailure:' +
          '\n                  errors:' +
          '\n                      - Timeout' +
          '\n                  action:' +
          '\n                      type: MarkAsSuccess' +
          '\n',
        versionLabel: 'v4',
        templateEntityType: 'Step',
        childType: 'HarnessApproval',
        templateScope: 'project',
        version: 8,
        gitDetails: {},
        lastUpdatedAt: 1635626311830,
        stableTemplate: true
      }
    ],
    pageable: {
      sort: { sorted: true, unsorted: false, empty: false },
      pageSize: 20,
      pageNumber: 0,
      offset: 0,
      paged: true,
      unpaged: false
    },
    last: true,
    totalPages: 1,
    totalElements: 1,
    sort: { sorted: true, unsorted: false, empty: false },
    first: true,
    numberOfElements: 5,
    size: 20,
    number: 0,
    empty: false
  }
}

export const mockTemplatesSuccessResponse: UseGetMockDataWithMutateAndRefetch<ResponsePageTemplateSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  cancel: jest.fn(),
  data: mockTemplates
}
