/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiTypeInputType, getMultiTypeFromValue, FormInput, Container, AllowedTypes } from '@harness/uicore'
import { produce } from 'immer'
import { set, unset } from 'lodash-es'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'

import MultiTypeSelectorButton from '@common/components/MultiTypeSelectorButton/MultiTypeSelectorButton'
import { isMultiTypeRuntime } from '@common/utils/utils'
import SkipInstances from './SkipInstances'

import css from './SkipInstances.module.scss'

export interface MultiTypeSkipInstancesProps {
  name?: string
  disableTypeSelection?: boolean
  allowedTypes?: AllowedTypes
  disableMultiSelectBtn?: boolean
  value?: string | boolean
  changed?: boolean
  path?: string
}

export function MultiTypeSkipInstances(props: MultiTypeSkipInstancesProps): React.ReactElement | null {
  const {
    allowedTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME],
    disableTypeSelection = false,
    value,
    disableMultiSelectBtn = false,
    path = 'stage.skipInstances',
    name = 'skipInstances'
  } = props

  const { getString } = useStrings()

  const {
    state: {
      selectionState: { selectedStageId = '' }
    },
    isReadonly,
    getStageFromPipeline,
    updateStage
  } = usePipelineContext()
  const { stage } = getStageFromPipeline(selectedStageId)

  const [type, setType] = React.useState(getMultiTypeFromValue(value, allowedTypes))

  React.useEffect(() => {
    setType(getMultiTypeFromValue(value, allowedTypes))
  }, [value, allowedTypes])

  function handleChange(newType: MultiTypeInputType): void {
    if (newType === type) {
      return
    }
    const { stage: pipelineStage } = getStageFromPipeline(selectedStageId)
    if (pipelineStage?.stage) {
      let stageData

      if (isMultiTypeRuntime(newType)) {
        stageData = produce(pipelineStage, draft => {
          set(draft, path, '<+input>')
        })
      } else {
        stageData = produce(pipelineStage, draft => {
          unset(draft, path)
        })
      }
      if (stageData.stage) {
        updateStage(stageData.stage)
      }
    }
    setType(newType)
  }

  return (
    <Container flex={{ justifyContent: 'flex-start', alignItems: 'flex-end' }} className={css.skipInstancesContainer}>
      {disableTypeSelection || type === MultiTypeInputType.FIXED ? (
        <SkipInstances
          value={value}
          name={name}
          selectedStage={stage?.stage}
          isReadonly={isReadonly}
          onUpdate={checked => {
            const { stage: pipelineStage } = getStageFromPipeline(selectedStageId)
            if (pipelineStage?.stage) {
              const stageData = produce(pipelineStage, draft => {
                if (!checked) {
                  unset(draft, path)
                } else {
                  set(draft, path, checked)
                }
              })
              if (stageData.stage) {
                updateStage(stageData.stage)
              }
            }
          }}
        />
      ) : (
        <FormInput.Text
          label={getString('pipeline.skipInstances.title')}
          name={name}
          className={css.runtimeDisabledSkipInstances}
          disabled
          placeholder={`${value}`}
          data-testid="skip-instances-runtime"
        />
      )}
      {disableTypeSelection ? null : (
        <MultiTypeSelectorButton
          allowedTypes={allowedTypes}
          type={type}
          onChange={handleChange}
          disabled={disableMultiSelectBtn}
          data-testid="skip-multi-btn"
        />
      )}
    </Container>
  )
}

export default MultiTypeSkipInstances
