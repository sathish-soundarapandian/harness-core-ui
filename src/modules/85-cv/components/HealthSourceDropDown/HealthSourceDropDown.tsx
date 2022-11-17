/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Select, SelectOption } from '@harness/uicore'
import { useParams } from 'react-router-dom'
import classNames from 'classnames'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetAllHealthSourcesForMonitoredServiceIdentifier } from 'services/cv'
import type { HealthSourceDropDownProps } from './HealthSourceDropDown.types'
import { VerificationType } from './HealthSourceDropDown.constants'
import { getDropdownOptions } from './HealthSourceDropDown.utils'
import css from './HealthSourceDropDown.module.scss'

export function HealthSourceDropDown(props: HealthSourceDropDownProps): JSX.Element {
  const { onChange, monitoredServiceIdentifier, className, verificationType = VerificationType.TIME_SERIES } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const { data, error, loading } = useGetAllHealthSourcesForMonitoredServiceIdentifier({
    monitoredServiceIdentifier,
    queryParams: { accountId, projectIdentifier, orgIdentifier }
  })

  const healthSources: SelectOption[] = useMemo(() => {
    return getDropdownOptions({ loading, error, data, verificationType }, getString)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, error, loading, verificationType])

  return (
    <Select
      name="healthsources-select"
      items={healthSources}
      className={classNames(css.maxDropDownWidth, className)}
      defaultSelectedItem={healthSources?.[0]}
      key={healthSources?.[0]?.value as string}
      inputProps={{ placeholder: getString('pipeline.verification.healthSourcePlaceholder') }}
      onChange={item => {
        onChange(item?.value === 'all' ? '' : (item.value as string))
      }}
    />
  )
}
