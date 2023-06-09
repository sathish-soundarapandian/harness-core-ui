/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getMockFor_useGetPipeline = (): any => ({
  data: {
    data: {
      resolvedTemplatesPipelineYaml: `pipeline:
  name: TestPipeline
  identifier: First
  tags: {}
  stages:
    - stage:
      name: Stage1
      identifier: Stage1
      description: ""
      type: Approval
      spec:
        execution:
          steps:
            - step:
                name: Approval
                identifier: approval
                type: HarnessApproval
                timeout: 1d
                spec:
                  includePipelineExecutionHistory: true
                  approvers:
                    disallowPipelineExecutor: false
                    minimumCount: 2
                    userGroups:
                      - Chirag
                  approverInputs: []
                  approvalMessage: ABC
      tags: {}
      variables: []
  projectIdentifier: Chirag
  orgIdentifier: harness
  variables:
    - name: checkVariable1
      type: String
      value: <+input>
      required: true
    - name: checkVariable2
      type: String
      value: <+input>
      required: false`,
      yamlPipeline: `pipeline:
  name: TestPipeline
  identifier: First
  tags: {}
  stages:
    - stage:
        name: Stage1
        identifier: Stage1
        description: ""
        type: Approval
        spec:
          execution:
            steps:
              - step:
                  name: Approval
                  identifier: approval
                  type: HarnessApproval
                  timeout: 1d
                  spec:
                    includePipelineExecutionHistory: true
                    approvers:
                      disallowPipelineExecutor: false
                      minimumCount: 2
                      userGroups:
                        - Chirag
                    approverInputs: []
                    approvalMessage: ABC
        tags: {}
        variables: []
  projectIdentifier: Chirag
  orgIdentifier: harness
  variables:
    - name: checkVariable1
      type: String
      value: <+input>
      required: true
    - name: checkVariable2
      type: String
      value: <+input>
      required: false`
    }
  }
})

export const getMockFor_useGetInputSetsListForPipeline = (): any => ({
  refetch: jest.fn(),
  data: {
    data: {
      content: [
        {
          identifier: 'inputset1',
          inputSetType: 'INPUT_SET',
          name: 'is1',
          pipelineIdentifier: 'PipelineId',
          inputSetErrorDetails: {
            uuidToErrorResponseMap: {
              a: {
                errors: [{ fieldName: 'a', message: 'a field invalid' }]
              }
            }
          }
        },
        {
          identifier: 'inputset2',
          inputSetType: 'INPUT_SET',
          name: 'is2',
          pipelineIdentifier: 'PipelineId'
        },
        {
          identifier: 'inputset3',
          inputSetType: 'INPUT_SET',
          name: 'is3',
          pipelineIdentifier: 'PipelineId'
        },
        {
          identifier: 'overlay1',
          inputSetType: 'OVERLAY_INPUT_SET',
          name: 'ov1',
          pipelineIdentifier: 'PipelineId',
          overlaySetErrorDetails: {
            b: 'overlay field invalid'
          }
        }
      ]
    }
  }
})

export const getMockFor_Generic_useMutate = (mutateMock?: jest.Mock): any => ({
  loading: false,
  refetch: jest.fn(),
  mutate:
    mutateMock ||
    jest.fn().mockResolvedValue({
      data: {
        correlationId: '',
        status: 'SUCCESS',
        metaData: null,
        data: {}
      }
    })
})

export const getMockFor_useGetTemplateFromPipeline = (): any => ({
  mutate: jest.fn().mockResolvedValue({
    data: {
      hasInputSets: true,
      inputSetTemplateYaml: `pipeline:
  identifier: "First"
  variables:
    - name: "checkVariable1"
      type: "String"
      value: "<+input>"
    - name: "checkVariable2"
      type: "String"
      value: "<+input>"`
    }
  })
})

export const getMockFor_useGetMergeInputSetFromPipelineTemplateWithListInput = (): any => ({
  mutate: jest.fn().mockResolvedValue({
    data: {
      pipelineYaml:
        'pipeline:\n  identifier: "First"\n  variables:\n  - name: "checkVariable1"\n    type: "String"\n    value: "valuefrominputsetsmerge"\n  - name: "checkVariable2"\n    type: "String"\n    value: "value2frominputsetsmerge"\n'
    }
  })
})
