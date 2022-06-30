/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { FontVariation, Text } from '@harness/uicore'
import { defaultTo } from 'lodash-es'
import cx from 'classnames'
import { useCache } from '@common/hooks/useCache'
import type { ServiceDefinition } from 'services/cd-ng'
import type { AllNGVariables as Variable } from '@pipeline/utils/types'
import { useStrings } from 'framework/strings'
import { usePipelineContext } from '../PipelineStudio/PipelineContext/PipelineContext'
import css from './VariableList.module.scss'

function VariableListReadOnlyView(): React.ReactElement | null {
  const {
    state: {
      pipeline,
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()
  const { getString } = useStrings()

  const getServiceCacheId = `${pipeline.identifier}-${selectedStageId}-service`
  const { getCache } = useCache([getServiceCacheId])
  const serviceInfo = getCache<ServiceDefinition>(getServiceCacheId)
  const variableListData = defaultTo(serviceInfo?.spec.variables, []) as Variable[]

  if (!variableListData.length) {
    return null
  }
  return (
    <>
      <div className={cx(css.variabletList, css.listHeader)}>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('name')}</Text>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('typeLabel')}</Text>
        <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('valueLabel')}</Text>
      </div>
      {variableListData.map(variable => (
        <div key={variable.name} className={cx(css.variabletList, css.rowValue)}>
          <Text>{variable.name}</Text>
          <Text>{variable.type}</Text>
          <Text>{variable.value}</Text>
        </div>
      ))}
    </>
  )
}

export default VariableListReadOnlyView
