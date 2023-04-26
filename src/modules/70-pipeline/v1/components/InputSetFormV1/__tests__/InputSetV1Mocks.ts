/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import type {
  ResponseInputSetResponse,
  ResponsePageInputSetSummaryResponse,
  ResponsePMSPipelineResponseDTO
} from 'services/pipeline-ng'

export const PipelineResponse: UseGetReturnData<ResponsePMSPipelineResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      yamlPipeline:
        'version: 1\nname: Yaml Simp Inline\ninputs:\n  image:\n    type: string\n    desc: image name\n    default: golang\n    required: true\n  repo:\n    type: string\n    desc: repository name\n    required: true\n    prompt: true\nrepository:\n  connector: gitconnector\n  name: <+inputs.repo>\nstages:\n  - name: output variable\n    type: ci\n    spec:\n      steps:\n        - name: one test\n          type: script\n          spec:\n            image: <+inputs.image>\n            run: export foo=bar\n            shell: sh\n            outputs:\n              - foo\n        - name: two\n          type: script\n          spec:\n            image: alpine\n            run: echo <+steps.one_test.output.outputVariables.foo>\n            pull: always\n',
      entityValidityDetails: { valid: true, invalidYaml: '' },
      modules: [],
      storeType: 'INLINE'
    },
    metaData: {},
    correlationId: 'f5ef40a6-c5bd-42d6-ba8c-340198373680'
  }
}

export const MergedPipelineResponse: UseGetReturnData<ResponsePMSPipelineResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      ngPipeline: {
        pipeline: {
          name: 'testsdfsdf',
          identifier: 'testqqq',
          description: '',
          tags: null,
          variables: null,
          metadata: null
        }
      },
      executionsPlaceHolder: [],
      mergedPipelineYaml:
        'name: testsdfsdf\nidentifier: testqqq\ndescription: ""\nstages:\n  - stage:\n      name: asd\n      identifier: asd\n      description: ""\n      type: Deployment\n      spec:\n        service:\n          identifier: asd\n          name: asd\n          description: ""\n          serviceDefinition:\n            type: Kubernetes\n            spec:\n              artifacts:\n                sidecars: []\n                primary:\n                  type: Dockerhub\n                  spec:\n                    connectorRef: org.docker\n                    imagePath: asd\n              manifests: []\n              artifactOverrideSets: []\n              manifestOverrideSets: []\n        execution:\n          steps:\n            - step:\n                name: Rollout Deployment\n                identifier: rolloutDeployment\n                type: K8sRollingDeploy\n                spec:\n                  timeout: 10m\n                  skipDryRun: false\n          rollbackSteps:\n            - step:\n                name: Rollback Rollout Deployment\n                identifier: rollbackRolloutDeployment\n                type: K8sRollingRollback\n                spec:\n                  timeout: 10m\n        infrastructure:\n          environment:\n            name: qa\n            identifier: qa\n            description: ""\n            type: PreProduction\n          infrastructureDefinition:\n            type: KubernetesDirect\n            spec:\n              connectorRef: <+input>\n              namespace: <+input>\n              releaseName: <+input>\n'
    } as any,
    correlationId: '7a84d477-4549-4026-8113-a02730b4f7c5'
  }
}

export const ConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'tesa1',
        identifier: 'tesa1',
        description: '',
        orgIdentifier: 'Harness11',
        tags: {},
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'asd',
              auth: { type: 'UsernamePassword', spec: { username: 'asd', passwordRef: 'account.test1111' } }
            }
          }
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}

export const GetInputSetsResponse: UseGetReturnData<ResponsePageInputSetSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      totalPages: 1,
      totalItems: 2,
      pageItemCount: 2,
      pageSize: 100,
      content: [
        {
          identifier: 'asd',
          name: 'asd',
          pipelineIdentifier: 'testqqq',
          description: 'asd',
          inputSetType: 'INPUT_SET'
        },
        {
          identifier: 'test',
          name: 'test',
          pipelineIdentifier: 'testqqq',
          description: 'sdf',
          inputSetType: 'INPUT_SET'
        }
      ],
      pageIndex: 0,
      empty: false
    },
    correlationId: 'dbc7238c-380f-4fe0-b160-a29510cfe0c8'
  }
}

export const GetInputSetEdit: UseGetReturnData<ResponseInputSetResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      accountId: 'n0zDK8DRTv2kcwuGq3Y_nA',
      orgIdentifier: 'default',
      projectIdentifier: 'default_project',
      pipelineIdentifier: 'Yaml_Simp_Inline',
      identifier: 'asv',
      inputSetYaml:
        'name: asv\ndata:\n  inputs:\n    image: golang\n    repo: "asdgvbasvb "\n  repository:\n    reference:\n      type: branch\n      value: main\nversion: 1\nidentifier: asv\norgIdentifier: default\nprojectIdentifier: default_project\n',
      name: 'asv',
      tags: {},
      entityValidityDetails: { valid: true, invalidYaml: undefined },
      storeType: 'INLINE',
      outdated: false,
      errorResponse: false
    },
    metaData: undefined,
    correlationId: 'cb85879c-3d38-40ea-af1b-e744f7e53815'
  }
}
