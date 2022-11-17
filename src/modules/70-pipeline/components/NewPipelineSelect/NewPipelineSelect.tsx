/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import type { SelectOption } from '@harness/uicore'
import { DropDown } from '@harness/uicore'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetPipelineList } from 'services/pipeline-ng'
import { useStrings } from 'framework/strings'

export interface NewPipelineSelectProps {
  selectedPipeline?: string
  onPipelineSelect(id: string): void
  defaultSelect?: string
  className?: string
}

export default function NewPipelineSelect(props: NewPipelineSelectProps): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelineType<ProjectPathProps>>()
  const [query, setQuery] = React.useState('')
  const { getString } = useStrings()

  const { mutate: reloadPipelines } = useGetPipelineList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      searchTerm: query,
      size: 10
    }
  })

  function dummyPromise(): Promise<SelectOption[]> {
    return new Promise<SelectOption[]>(resolve => {
      reloadPipelines({ filterType: 'PipelineSetup' })
        .then(result => {
          const selectItems = result?.data?.content?.map(item => {
            return { label: item.name || '', value: item.identifier || '' }
          }) as SelectOption[]
          resolve(selectItems || [])
        })
        .catch(() => {
          resolve([])
        })
    })
  }

  return (
    <DropDown
      minWidth={120}
      buttonTestId="pipeline-select"
      onChange={option => {
        props.onPipelineSelect(option.value as string)
      }}
      value={props.selectedPipeline}
      items={dummyPromise}
      usePortal={true}
      addClearBtn={true}
      query={query}
      onQueryChange={setQuery}
      placeholder={getString('pipelines')}
    />
  )
}
