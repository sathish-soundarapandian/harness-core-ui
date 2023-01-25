/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const prData = {
  __recast: 'io.harness.ci.plan.creator.execution.CIPipelineModuleInfo',
  branch: 'master',
  ciExecutionInfoDTO: {
    __recast: 'io.harness.ci.pipeline.executions.beans.CIWebhookInfoDTO',
    event: 'pullRequest',
    author: {
      __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildAuthor',
      id: 'ownerId',
      name: '',
      email: '',
      avatar: 'https://avatars.githubusercontent.com/u/65973712?v=4'
    },
    pullRequest: {
      __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildPRHook',
      id: 26625,
      link: 'https://github.com/wings-software/portal/pull/26625',
      title: '[CI-0]: Example changes for TI demo',
      body: '\n\n<!-- Reviewable:start -->\nThis change is [<img src="https://reviewable.io/review_button.svg" height="34" align="absmiddle" alt="Reviewable"/>](https://reviewable.io/reviews/wings-software/portal/26625)\n<!-- Reviewable:end -->\n',
      sourceRepo: null,
      sourceBranch: 'ownerId-patch-8',
      targetBranch: 'master',
      state: 'open',
      commits: [
        {
          __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildCommit',
          id: 'e3b377ac1bfdb432d5a6a496c53716e855f818d3',
          link: 'https://github.com/wings-software/portal/commit/e3b377ac1bfdb432d5a6a496c53716e855f818d3',
          message: 'Update ConnectorUtils.java',
          ownerName: 'ownerName',
          ownerId: 'ownerId',
          ownerEmail: 'admin@harness.io',
          timeStamp: 1629046742000
        },
        {
          __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildCommit',
          id: '680d059b190b6254211c52f616a61275cdcfbf3d',
          link: 'https://github.com/wings-software/portal/commit/680d059b190b6254211c52f616a61275cdcfbf3d',
          message: 'Example file changes for TI demo',
          ownerName: 'ownerName',
          ownerId: 'ownerId',
          ownerEmail: 'admin@harness.io',
          timeStamp: 1629046701000
        }
      ]
    }
  },
  repoName: 'portal'
}

export const branchData = {
  __recast: 'io.harness.ci.plan.creator.execution.CIPipelineModuleInfo',
  branch: 'main',
  buildType: 'branch',
  ciExecutionInfoDTO: {
    __recast: 'io.harness.ci.pipeline.executions.beans.CIWebhookInfoDTO',
    event: 'branch',
    branch: {
      __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildBranchHook',
      commits: [
        {
          __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildCommit',
          id: 'f79d5680f69d21248041ab55b5d8b05fdad673b1',
          link: 'https://github.com/wings-software/ti-ui/commit/f79d5680f69d21248041ab55b5d8b05fdad673b1',
          message: 'rebase',
          ownerName: 'user',
          ownerId: 'user',
          ownerEmail: 'michael.tran@harness.io',
          timeStamp: 1669676823000
        }
      ]
    }
  },
  imageDetailsList: [
    {
      __recast: 'io.harness.ci.pipeline.executions.beans.CIImageDetails',
      imageName: 'harness/drone-git',
      imageTag: '1.2.7-rootless'
    },
    { __recast: 'io.harness.ci.pipeline.executions.beans.CIImageDetails', imageName: 'node', imageTag: '' }
  ],
  infraDetailsList: [
    {
      __recast: 'io.harness.ci.pipeline.executions.beans.CIInfraDetails',
      infraType: 'KubernetesDirect',
      infraOSType: 'Linux',
      infraHostType: 'Self Hosted',
      infraArchType: 'Amd64'
    }
  ],
  isPrivateRepo: true,
  repoName: 'ti-ui',
  scmDetailsList: [
    {
      __recast: 'io.harness.ci.pipeline.executions.beans.CIScmDetails',
      scmUrl: 'https://github.com/wings-software/ti-ui',
      scmProvider: 'Github',
      scmAuthType: 'Http',
      scmHostType: 'SaaS'
    }
  ],
  tiBuildDetailsList: []
}

export const successNodeMapValue = {
  nodeType: 'CI',
  nodeGroup: 'STAGE',
  nodeIdentifier: 'ti3',
  name: 'boostrap3',
  nodeUuid: 'B_0CPXOkTDqp48_5HveraQ',
  status: 'Success',
  module: 'ci',
  moduleInfo: {
    ci: {
      __recast: 'io.harness.ci.plan.creator.execution.CIStageModuleInfo'
    }
  },
  startTs: 1629047239336,
  endTs: 1629048426722,
  edgeLayoutList: {
    currentNodeChildren: [],
    nextIds: []
  },
  nodeRunInfo: {
    whenCondition: '<+OnPipelineSuccess>',
    evaluatedCondition: true,
    expressions: [
      {
        expression: 'OnPipelineSuccess',
        expressionValue: 'true',
        count: 1
      }
    ]
  }
}

export const failedToInitializeData = {
  __recast: 'io.harness.ci.plan.creator.execution.CIPipelineModuleInfo',
  branch: 'master',
  ciExecutionInfoDTO: {
    __recast: 'io.harness.ci.pipeline.executions.beans.CIWebhookInfoDTO',
    event: 'pullRequest',
    author: {
      __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildAuthor',
      id: 'aman-harness',
      name: '',
      email: '',
      avatar: 'https://avatars.githubusercontent.com/u/10278482?v=4'
    },
    pullRequest: {
      __recast: 'io.harness.ci.pipeline.executions.beans.CIBuildPRHook',
      id: 164,
      link: 'https://github.com/wings-software/jhttp/pull/164',
      title: '[CI-0]: Create tests cases for running in Bazel / maven',
      body: '',
      sourceRepo: null,
      sourceBranch: 'aman/fix-sanity',
      targetBranch: 'master',
      state: 'open',
      commits: []
    }
  },
  repoName: 'jhttp'
}

export const failedToInitializeNodeMapValue = {
  nodeType: 'CI',
  nodeGroup: 'STAGE',
  nodeIdentifier: 'ti',
  name: 'ti',
  nodeUuid: 'i29zaDnZS7S5vJJnxTnsaQ',
  status: 'Failed',
  module: 'ci',
  moduleInfo: {
    ci: {
      __recast: 'io.harness.ci.plan.creator.execution.CIStageModuleInfo'
    }
  },
  startTs: 1631537867677,
  endTs: 1631537878510,
  edgeLayoutList: {
    currentNodeChildren: [],
    nextIds: []
  },
  nodeRunInfo: {
    whenCondition: '<+OnPipelineSuccess>',
    evaluatedCondition: true,
    expressions: [
      {
        expression: 'OnPipelineSuccess',
        expressionValue: 'true',
        count: 1
      }
    ]
  },
  failureInfo: {
    message: 'io.kubernetes.client.openapi.ApiException: Conflict'
  },
  failureInfoDTO: {
    message: 'io.kubernetes.client.openapi.ApiException: Conflict',
    failureTypeList: [],
    responseMessages: []
  }
}
