/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseGetMockDataWithMutateAndRefetch } from '@common/utils/testUtils'
import type { ResponsePageInputSetSummaryResponse } from 'services/pipeline-ng'
import type { InputSetValue } from '../utils'

export const multipleSelectedInputSets: InputSetValue[] = [
  {
    type: 'INPUT_SET',
    value: 'inputset1',
    label: 'is1'
  },
  {
    type: 'INPUT_SET',
    value: 'inputset2',
    label: 'is2'
  }
]

export const multipleSelectedInputSetsWithGitDetails: InputSetValue[] = [
  {
    type: 'INPUT_SET',
    value: 'inputsetwithgit1',
    label: 'inputsetwithgit1',
    gitDetails: {
      repoIdentifier: 'gitSyncRepoTest',
      branch: 'master'
    }
  },
  {
    type: 'INPUT_SET',
    value: 'inputsetwithgit2',
    label: 'inputsetwithgit2',
    gitDetails: {
      repoIdentifier: 'gitSyncRepo',
      branch: 'feature'
    }
  }
]

export const mockInputSetsList: UseGetMockDataWithMutateAndRefetch<ResponsePageInputSetSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: {
      content: [
        {
          identifier: 'inputset1',
          inputSetType: 'INPUT_SET',
          name: 'is1',
          pipelineIdentifier: 'PipelineId'
        },
        {
          identifier: 'inputset2',
          inputSetType: 'INPUT_SET',
          name: 'is2',
          pipelineIdentifier: 'PipelineId'
        },
        {
          identifier: 'overlay1',
          inputSetType: 'OVERLAY_INPUT_SET',
          name: 'ol1',
          pipelineIdentifier: 'PipelineId'
        }
      ]
    }
  }
}

export const mockInputSetsListEmpty: UseGetMockDataWithMutateAndRefetch<ResponsePageInputSetSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  data: {
    correlationId: '',
    status: 'SUCCESS',
    metaData: null as unknown as undefined,
    data: { content: [] }
  }
}

export const mockInputSetsListError: UseGetMockDataWithMutateAndRefetch<ResponsePageInputSetSummaryResponse> = {
  loading: false,
  refetch: jest.fn(),
  mutate: jest.fn(),
  // eslint-disable-next-line
  // @ts-ignore
  error: {
    message: 'error message'
  },
  data: {}
}

export const mockInputSetsListWithGitDetails: UseGetMockDataWithMutateAndRefetch<ResponsePageInputSetSummaryResponse> =
  {
    loading: false,
    refetch: jest.fn(),
    mutate: jest.fn(),
    data: {
      correlationId: '',
      status: 'SUCCESS',
      metaData: null as unknown as undefined,
      data: {
        content: [
          {
            identifier: 'inputsetwithgit1',
            inputSetType: 'INPUT_SET',
            name: 'inputsetwithgit1',
            pipelineIdentifier: 'PipelineId',
            gitDetails: {
              repoIdentifier: 'gitSyncRepoTest',
              branch: 'master'
            }
          },
          {
            identifier: 'inputsetwithgit2',
            inputSetType: 'INPUT_SET',
            name: 'inputsetwithgit2',
            pipelineIdentifier: 'PipelineId',
            gitDetails: {
              repoIdentifier: 'gitSyncRepo',
              branch: 'feature'
            }
          },
          {
            identifier: 'overlay1',
            inputSetType: 'OVERLAY_INPUT_SET',
            name: 'ol1',
            pipelineIdentifier: 'PipelineId',
            gitDetails: {
              repoIdentifier: 'gitSyncRepo',
              branch: 'feature'
            }
          }
        ]
      }
    }
  }

export const paginatedInputSetsResponse: ResponsePageInputSetSummaryResponse = {
  status: 'SUCCESS',
  data: {
    totalPages: 5,
    totalItems: 23,
    pageItemCount: 5,
    pageSize: 5,
    content: [
      {
        identifier: 'inputSet23',
        name: 'inputSet23',
        pipelineIdentifier: 'Triggers_2',
        inputSetType: 'INPUT_SET',
        tags: {},
        createdAt: 1685717843503,
        lastUpdatedAt: 1685717843503,
        entityValidityDetails: {
          valid: true
        },
        storeType: 'INLINE'
      },
      {
        identifier: 'inputSet22',
        name: 'inputSet22',
        pipelineIdentifier: 'Triggers_2',
        inputSetType: 'INPUT_SET',
        tags: {},
        createdAt: 1685717831418,
        lastUpdatedAt: 1685717831418,
        entityValidityDetails: {
          valid: true
        },
        storeType: 'INLINE'
      },
      {
        identifier: 'inputSet21',
        name: 'inputSet21',
        pipelineIdentifier: 'Triggers_2',
        inputSetType: 'INPUT_SET',
        tags: {},
        createdAt: 1685717794214,
        lastUpdatedAt: 1685717794214,
        entityValidityDetails: {
          valid: true
        },
        storeType: 'INLINE'
      },
      {
        identifier: 'inputSet20',
        name: 'inputSet20',
        pipelineIdentifier: 'Triggers_2',
        inputSetType: 'INPUT_SET',
        tags: {},
        createdAt: 1685717772083,
        lastUpdatedAt: 1685717772083,
        entityValidityDetails: {
          valid: true
        },
        storeType: 'INLINE'
      },
      {
        identifier: 'inputSet19',
        name: 'inputSet19',
        pipelineIdentifier: 'Triggers_2',
        inputSetType: 'INPUT_SET',
        tags: {},
        createdAt: 1685717756591,
        lastUpdatedAt: 1685717756591,
        entityValidityDetails: {
          valid: true
        },
        storeType: 'INLINE'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  correlationId: 'correlationId'
}
