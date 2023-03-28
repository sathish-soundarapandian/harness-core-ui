/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { DropDown, Select } from '@harness/uicore'
import qs from 'qs'
import React, { useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import css from './ExecutionArtifactsView.module.scss'

export function StageSelector(props: {
  layoutNodeMap?: PipelineExecutionSummary['layoutNodeMap']
}): React.ReactElement {
  const { updateQueryParams } = useUpdateQueryParams<{ stage?: string }>()
  const history = useHistory()
  const params = useParams<any>()
  const query = useQueryParams<any>()
  const setupIds = Object.keys(props?.layoutNodeMap ?? {})
  const options = [
    { label: 'All stages', value: '' },
    ...setupIds.map(value => ({
      value,
      label: props.layoutNodeMap![value].name!
    }))
  ]
  const selectedOption = options.find(option => option.value === query.stage)?.value

  useEffect(() => {
    if (query.stage) {
      // By default keep All stages
      updateQueryParams({
        stage: undefined
      })
    }
  }, [])

  return (
    <DropDown
      value={selectedOption}
      onChange={({ value }) => {
        updateQueryParams({
          stage: value ? value.toString() : undefined
        })
      }}
      items={options}
      filterable={false}
      addClearBtn={true}
      placeholder="All stages"
      className={css.stageSelector}
    />
  )
}
