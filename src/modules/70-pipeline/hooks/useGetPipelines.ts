/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useMutateAsGet } from '@common/hooks/useMutateAsGet'
import { useGetPipelineList } from 'services/pipeline-ng'

interface GetPipelinesProps {
  accountIdentifier: string
  orgIdentifier: string
  projectIdentifier: string
  lazy: boolean
  size?: number
}

export function useGetPipelines({
  accountIdentifier,
  projectIdentifier,
  orgIdentifier,
  lazy,
  size
}: GetPipelinesProps) {
  const { data, loading, refetch, error } = useMutateAsGet(useGetPipelineList, {
    queryParams: {
      accountIdentifier,
      projectIdentifier,
      orgIdentifier,
      size
    },
    body: { filterType: 'PipelineSetup' },
    lazy: lazy || /* istanbul ignore next */ false
  })

  return {
    data,
    loading,
    refetch,
    error
  }
}
