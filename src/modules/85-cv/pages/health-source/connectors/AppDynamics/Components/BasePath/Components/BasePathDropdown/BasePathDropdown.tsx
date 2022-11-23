/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, Text, FormInput, Icon } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useGetAppdynamicsBaseFolders } from 'services/cv'
import { useStrings } from 'framework/strings'
import css from './BasePathDropdown.module.scss'

export default function BasePathDropdown({
  connectorIdentifier,
  appName,
  path,
  onChange,
  selectedValue,
  name
}: {
  connectorIdentifier: string
  appName: string
  path: string
  onChange: (val: string) => void
  selectedValue: string
  name: string
}): JSX.Element {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const {
    data: baseFoldersData,
    loading: baseFoldersLoading,
    error: baseFoldersError,
    refetch
  } = useGetAppdynamicsBaseFolders({
    lazy: true
  })

  useEffect(() => {
    refetch({
      queryParams: {
        accountId,
        connectorIdentifier,
        orgIdentifier,
        projectIdentifier,
        appName,
        path
      }
    })
  }, [path, appName])

  const options =
    baseFoldersData?.data?.map(item => {
      return {
        value: item,
        label: item
      }
    }) || []

  return baseFoldersError ? (
    <Text padding={{ bottom: 'medium' }} font={{ variation: FontVariation.FORM_MESSAGE_DANGER }}>
      {getErrorMessage(baseFoldersError)}
    </Text>
  ) : baseFoldersLoading ? (
    <Container>
      <Icon name="spinner" margin={{ bottom: 'medium' }} size={24} />
    </Container>
  ) : (
    <>
      {options.length ? (
        <FormInput.Select
          addClearButton
          placeholder={getString('cv.monitoringSources.appD.basePathPlaceholder')}
          value={options.find(item => item.value === selectedValue) || { label: '', value: '' }}
          className={css.basePathDropdown}
          items={baseFoldersLoading ? [{ label: getString('loading'), value: getString('loading') }] : options}
          name={name}
          onChange={item => {
            onChange(item.value as string)
          }}
        />
      ) : (
        <Text>{getString('cv.monitoringSources.appD.noValueBasePath')}</Text>
      )}
    </>
  )
}
