/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetReturnData } from '@common/utils/testUtils'
import type { ResponsePMSPipelineSummaryResponse, ResponsePMSPipelineResponseDTO } from 'services/pipeline-ng'

export const PipelineResponse: UseGetReturnData<ResponsePMSPipelineSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      name: 'testsdfsdf',
      identifier: 'testqqq',
      description: '',
      numOfStages: 3
      // numOfErrors: 2,
      // deployments: [0, 4, 0, 3, 4, 2, 1, 5, 2, 4]
    },
    correlationId: '537bada2-d369-443f-9827-7ca8008b576d'
  }
}

export const PipelineDetailsResponse: UseGetReturnData<ResponsePMSPipelineResponseDTO> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      entityValidityDetails: { valid: true },
      gitDetails: {},
      modules: ['pms'],
      yamlPipeline:
        'pipeline:\n  name: gitSync Branch\n  identifier: gitSync_Branch\n  projectIdentifier: project_One\n  orgIdentifier: default\n  tags: {}\n'
    },
    correlationId: '537bada2-d369-443f-9827-7ca8008b576d'
  }
}
