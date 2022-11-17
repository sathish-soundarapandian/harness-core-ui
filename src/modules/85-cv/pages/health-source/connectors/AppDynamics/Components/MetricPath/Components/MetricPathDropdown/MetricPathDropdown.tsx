/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Icon, Text, FormInput, Container, SelectOption } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useGetAppdynamicsMetricStructure } from 'services/cv'
import { useStrings } from 'framework/strings'
import { getIconByType } from './MetricPathDropdown.utils'
import css from './MetricPathDropdown.module.scss'

export default function MetricPathDropdown({
  baseFolder,
  selectedValue,
  connectorIdentifier,
  appName,
  tier,
  onChange,
  metricPath
}: {
  connectorIdentifier: string
  appName: string
  tier: string
  baseFolder: string
  metricPath: string
  selectedValue: string
  onChange: (value: SelectOption) => void
}): JSX.Element {
  const { getString } = useStrings()
  const { data, refetch, error, loading } = useGetAppdynamicsMetricStructure({ lazy: true })
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  useEffect(() => {
    refetch({
      queryParams: {
        accountId,
        orgIdentifier,
        projectIdentifier,
        connectorIdentifier,
        appName,
        baseFolder,
        tier,
        metricPath
      }
    })
  }, [appName, tier, metricPath, baseFolder])

  const options: SelectOption[] =
    data?.data?.map(item => {
      return { label: item.name || '', value: item.name || '', icon: { name: getIconByType(item.type) } }
    }) || []

  return error ? (
    <Text padding={{ bottom: 'medium' }} font={{ variation: FontVariation.FORM_MESSAGE_DANGER }}>
      {getErrorMessage(error)}
    </Text>
  ) : loading ? (
    <Container>
      <Icon name="spinner" margin={{ bottom: 'medium' }} size={24} />
    </Container>
  ) : (
    <div>
      {options.length ? (
        <FormInput.Select
          name={'metricPathDropdown'}
          placeholder={getString('cv.monitoringSources.appD.metricPathPlaceholder')}
          value={options.find(item => item.value === selectedValue) || { label: '', value: '' }}
          className={css.metricPathDropdown}
          items={loading ? [{ label: getString('loading'), value: getString('loading') }] : options}
          onChange={item => {
            onChange(item as SelectOption)
          }}
          addClearButton
        />
      ) : (
        <Text>{getString('cv.monitoringSources.appD.noValueMetricPath')}</Text>
      )}
    </div>
  )
}
