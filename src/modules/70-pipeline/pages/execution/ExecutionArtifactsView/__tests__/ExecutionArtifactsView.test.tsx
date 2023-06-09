/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import executionMock from './mocks/execution-mock-old-view.json'

import ExecutionArtifactsView, {
  getStageSetupIds,
  getStageNodesWithArtifacts,
  getArtifactGroups
} from '../ExecutionArtifactsView'

jest.mock('@pipeline/context/ExecutionContext', () => ({
  useExecutionContext: () => ({
    pipelineExecutionDetail: {
      pipelineExecutionSummary: executionMock.data.pipelineExecutionSummary as any,
      executionGraph: executionMock.data.executionGraph as any
    },
    allNodeMap: {},
    pipelineStagesMap: new Map(),
    selectedStageId: '',
    selectedStepId: '',
    loading: false,
    isDataLoadedForSelectedStage: true,
    queryParams: {},
    logsToken: '',
    setLogsToken: () => void 0,
    refetch: undefined,
    addNewNodeToMap: () => void 0
  })
}))

describe('<ExecutionArtifactsView /> tests', () => {
  test('getStageSetupIds() test', () => {
    const ids = getStageSetupIds(executionMock.data.pipelineExecutionSummary as any)
    expect(ids).toEqual(['8PKMDSMyRdih_aJp8p3f6w', 'UkROwkBmS-2QpiHgvc6CLA'])
  })
  test('getStageNodesWithArtifacts() test', () => {
    const stageNodes = getStageNodesWithArtifacts(executionMock.data.executionGraph as any, [
      '8PKMDSMyRdih_aJp8p3f6w',
      'UkROwkBmS-2QpiHgvc6CLA'
    ])
    expect(stageNodes).toEqual([
      {
        baseFqn: 'pipeline.stages.docker-buildPush-success',
        delegateInfoList: [],
        endTs: 1619650654250,
        executableResponses: [
          {
            child: {
              childNodeId: 'E3Kq8iITQ8-ruvrOQK2K2g'
            }
          }
        ],
        failureInfo: {
          failureTypeList: [],
          message: '',
          responseMessages: []
        },
        identifier: 'docker-buildPush-success',
        interruptHistories: [],
        name: 'docker build push',
        nodeRunInfo: {
          evaluatedCondition: true,
          whenCondition: '<+OnPipelineSuccess>'
        },
        outcomes: [
          {
            fileArtifacts: [],
            imageArtifacts: [
              {
                imageName: 'harness/ci-automation',
                tag: '1.2',
                url: 'https://hub.docker.com/layers/harness/ci-automation/1.2/images/sha256-e4069d8aa9b2825630ba28674526544967dfc9fd6d832b002df00c534e8de6e0/'
              },
              {
                imageName: 'harness/ci-automation',
                tag: '1',
                url: 'https://hub.docker.com/layers/harness/ci-automation/1/images/sha256-e4069d8aa9b2825630ba28674526544967dfc9fd6d832b002df00c534e8de6e0/'
              }
            ]
          }
        ],
        setupId: '8PKMDSMyRdih_aJp8p3f6w',
        skipInfo: null,
        startTs: 1619650562121,
        status: 'Success',
        stepParameters: {
          childNodeID: 'E3Kq8iITQ8-ruvrOQK2K2g',
          dependencies: null,
          description: null,
          enableCloneRepo: false,
          identifier: 'docker-buildPush-success',
          infrastructure: {
            spec: {
              annotations: null,
              connectorRef: 'account.testK8sConnectorWXRr',
              labels: null,
              namespace: 'harness-delegate'
            },
            type: 'KUBERNETES_DIRECT'
          },
          name: 'docker build push',
          originalVariables: null,
          sharedPaths: null,
          skipCondition: null,
          stepIdentifiers: ['createDockerFile', 'dockerBuildPush'],
          type: 'CI'
        },
        stepType: 'IntegrationStageStepPMS',
        taskIdToProgressDataMap: {},
        unitProgresses: [],
        uuid: 'pLisAB7sT0Woi6I3PomP-w'
      }
    ])
  })
  test('getArtifactGroups() test', () => {
    const stageNodes = getStageNodesWithArtifacts(executionMock.data.executionGraph as any, [
      '8PKMDSMyRdih_aJp8p3f6w',
      'UkROwkBmS-2QpiHgvc6CLA'
    ])
    const groups = getArtifactGroups(stageNodes)
    expect(groups).toEqual([
      {
        artifacts: [
          {
            image: 'harness/ci-automation',
            tag: '1.2',
            type: 'Image',
            url: 'https://hub.docker.com/layers/harness/ci-automation/1.2/images/sha256-e4069d8aa9b2825630ba28674526544967dfc9fd6d832b002df00c534e8de6e0/'
          },
          {
            image: 'harness/ci-automation',
            tag: '1',
            type: 'Image',
            url: 'https://hub.docker.com/layers/harness/ci-automation/1/images/sha256-e4069d8aa9b2825630ba28674526544967dfc9fd6d832b002df00c534e8de6e0/'
          }
        ],
        icon: 'pipeline-deploy',
        name: 'docker build push'
      }
    ])
  })
  test('renders ok', () => {
    render(
      <TestWrapper>
        <ExecutionArtifactsView />
      </TestWrapper>
    )
    expect(screen.getByText('Not Found')).toBeInTheDocument()
  })
})
