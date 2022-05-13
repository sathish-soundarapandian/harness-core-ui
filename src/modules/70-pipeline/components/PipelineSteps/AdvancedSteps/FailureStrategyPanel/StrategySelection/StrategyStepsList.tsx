/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikContextType } from 'formik'
import { ThumbnailSelect, ThumbnailSelectProps } from '@wings-software/uicore'

import { useStrings } from 'framework/strings'
import { Strategy, stringsMap, strategyIconMap } from '@pipeline/utils/FailureStrategyUtils'

import css from './StrategySelection.module.scss'

export interface StrategyStepsListProps {
  allowedStrategies: Strategy[]
  name: string
  formik: FormikContextType<Record<string, never>>
  disabled?: boolean
  onChange?(): void
}

export function StrategyStepsList(props: StrategyStepsListProps): React.ReactElement {
  const { name, allowedStrategies, onChange, disabled } = props
  const { getString } = useStrings()

  const items: ThumbnailSelectProps['items'] = React.useMemo(() => {
    return allowedStrategies.map(strategy => ({
      label: getString(stringsMap[strategy]),
      icon: strategyIconMap[strategy],
      value: strategy
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowedStrategies])

  return (
    <ThumbnailSelect
      name={name}
      items={items}
      thumbnailClassName={css.thumbnail}
      isReadonly={disabled}
      onChange={onChange}
    />
  )
}
