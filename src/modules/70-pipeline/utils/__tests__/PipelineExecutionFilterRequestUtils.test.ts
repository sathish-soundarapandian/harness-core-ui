/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { BUILD_TYPE, getCIModuleProperties, getValidFilterArguments } from '../PipelineExecutionFilterRequestUtils'

describe('Test util methods', () => {
  test('Test getCIModuleProperties method', () => {
    expect(
      getCIModuleProperties(BUILD_TYPE.PULL_OR_MERGE_REQUEST, {
        buildType: BUILD_TYPE.PULL_OR_MERGE_REQUEST,
        repositoryName: 'harness-core-ui',
        sourceBranch: 'feature-branch',
        targetBranch: 'develop'
      })
    ).toEqual({
      ciExecutionInfoDTO: {
        event: 'pullRequest',
        pullRequest: { sourceBranch: 'feature-branch', targetBranch: 'develop' }
      },
      repoName: 'harness-core-ui'
    })

    expect(
      getCIModuleProperties(BUILD_TYPE.BRANCH, {
        branch: 'develop'
      })
    ).toEqual({ branch: 'develop' })

    expect(
      getCIModuleProperties(BUILD_TYPE.TAG, {
        tag: 'release'
      })
    ).toEqual({
      tag: 'release'
    })
  })

  test('Test method getValidFilterArguments', () => {
    expect(
      getValidFilterArguments({
        pipelineName: 'test-pipeline',
        repositoryName: 'harness-core-ui',
        sourceBranch: 'develop',
        targetBranch: 'master',
        buildType: 'PULL_OR_MERGE_REQUEST'
      })
    ).toEqual({
      pipelineName: 'test-pipeline',
      pipelineTags: [],
      moduleProperties: {
        ci: {
          ciExecutionInfoDTO: {
            event: 'pullRequest',
            pullRequest: { sourceBranch: 'develop', targetBranch: 'master' }
          },
          repoName: 'harness-core-ui'
        },
        cd: {}
      }
    })
  })
})
