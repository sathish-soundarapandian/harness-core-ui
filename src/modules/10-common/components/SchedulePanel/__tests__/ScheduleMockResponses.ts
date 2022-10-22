/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const GetTriggerScheduleResponse = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      name: 'test-cron',
      identifier: 'testcron',
      description: 'desc',
      type: 'Scheduled',
      accountIdentifier: 'accountIdentifier',
      orgIdentifier: 'default',
      projectIdentifier: 'project1',
      targetIdentifier: 'pipeline1',
      yaml: 'trigger:\n    name: test-cron\n    identifier: testcron\n    enabled: true\n    description: desc\n    tags:\n        tag1: value1\n    orgIdentifier: default\n    projectIdentifier: project1\n    pipelineIdentifier: pipeline1\n    source:\n        type: Scheduled\n        spec:\n            type: Cron\n            spec:\n                expression: 0/5 * * * *\n    inputYaml: |\n        pipeline:\n            identifier: pipeline1\n            stages:\n                - stage:\n                      identifier: stage1\n                      type: Deployment\n                      spec:\n                          infrastructure:\n                              environmentRef: ""\n                              infrastructureDefinition:\n                                  type: KubernetesDirect\n                                  spec:\n                                      namespace: ""\n',
      version: 2,
      enabled: true
    },
    metaData: null,
    correlationId: '09316b20-103c-424d-9412-61ca785a754a'
  }
}

export const GetTriggerCronResponse = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      name: 'All Values Cron',
      identifier: 'All_Values_Cron',
      description: 'desc',
      type: 'Scheduled',
      accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: 'default',
      projectIdentifier: 'project1',
      targetIdentifier: 'noinputspipeline1',
      yaml: 'trigger:\n    name: All Values Cron\n    identifier: All_Values_Cron\n    enabled: true\n    description: desc\n    tags:\n        tag1: ""\n    orgIdentifier: default\n    projectIdentifier: project1\n    pipelineIdentifier: noinputspipeline1\n    source:\n        type: Scheduled\n        spec:\n            type: Cron\n            spec:\n                expression: 4 3 * * *\n    inputYaml: ""\n',
      version: 0,
      enabled: true
    },
    metaData: null,
    correlationId: '09316b20-103c-424d-9412-61ca785a754a'
  }
}

export const updateCronTrigger =
  'trigger:\n    name: test-cron\n    identifier: testcron\n    enabled: true\n    description: desc\n    tags:\n        tag1: value1\n    orgIdentifier: default\n    projectIdentifier: project1\n    pipelineIdentifier: pipeline1\n    source:\n        type: Scheduled\n        spec:\n            type: Cron\n            spec:\n                expression: 4 3 * * MON\n    inputYaml: |\n        pipeline:\n            identifier: pipeline1\n            stages:\n                - stage:\n                      identifier: stage1\n                      type: Deployment\n                      spec:\n                          infrastructure:\n                              environmentRef: ""\n                              infrastructureDefinition:\n                                  type: KubernetesDirect\n                                  spec:\n                                      namespace: ""\n'

// also removed orgIdentifier, projectIdentifier, pipelineIdentifier as useParams is empty and cannot be mocked
export const updateCronTriggerReplaceOnlyTwoSpace =
  'trigger:\n  name: All Values Cron\n  identifier: All_Values_Cron\n  enabled: true\n  description: desc\n  tags:\n    tag1: ""\n  source:\n    type: Scheduled\n    spec:\n      type: Cron\n      spec:\n        expression: 4 3 * * MON\n  inputYaml: |\n    pipeline:\n      identifier: noinputspipeline1\n      variables:\n        - name: newVar\n          type: String\n          value: ""\n'

export const updateTriggerScheduleResponseYaml =
  'trigger:\n    name: test-schedule\n    identifier: testschedule\n    enabled: true\n    description: desc\n    tags:\n        tag1: ""\n    target:\n        targetIdentifier: pipeline1\n        type: Pipeline\n        spec:\n            runtimeInputYaml: |\n                pipeline:\n                    identifier: pipeline1\n                    stages:\n                        - stage:\n                              identifier: s1\n                              type: Deployment\n                              spec:\n                                  serviceConfig:\n                                      serviceDefinition:\n                                          type: Kubernetes\n                                          spec:\n                                              artifacts:\n                                                  primary:\n                                                      type: Ecr\n                                                      spec:\n                                                          tag: ""\n                                      serviceRef: ""\n                                  infrastructure:\n                                      environmentRef: ""\n    source:\n        type: Scheduled\n        spec:\n            type: Cron\n            spec:\n                expression: 4 3 * * MON\n'
