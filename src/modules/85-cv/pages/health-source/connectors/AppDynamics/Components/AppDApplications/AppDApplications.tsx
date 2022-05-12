/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { SelectOption, FormInput } from '@wings-software/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { getPlaceholder, setAppDynamicsApplication } from '../../AppDHealthSource.utils'
import { getInputGroupProps } from '../../../MonitoredServiceConnector.utils'
import css from '../../AppDHealthSource.module.scss'

interface AppDApplicationsInterface {
  applicationOptions: any
  applicationLoading: boolean
  connectorIdentifier: string
  formikSetFieldValue: (key: string, value: string) => void
  formikAppDynamicsValue: any
  refetchTier: any
  setCustomFieldAndValidation: any
  isTemplate?: boolean
}

export default function AppDApplications({
  applicationOptions,
  applicationLoading,
  connectorIdentifier,
  formikSetFieldValue,
  formikAppDynamicsValue,
  refetchTier,
  setCustomFieldAndValidation,
  isTemplate
}: AppDApplicationsInterface): JSX.Element {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const queryParams = useMemo(() => {
    return {
      accountId,
      connectorIdentifier,
      orgIdentifier,
      projectIdentifier,
      offset: 0,
      pageSize: 10000
    }
  }, [])

  return isTemplate ? (
    <FormInput.MultiTypeInput
      className={css.applicationDropdown}
      name={'appdApplication'}
      label={getString('cv.healthSource.connectors.AppDynamics.applicationLabel')}
      selectItems={applicationOptions}
      placeholder={getPlaceholder(
        applicationLoading,
        'cv.healthSource.connectors.AppDynamics.applicationPlaceholder',
        getString
      )}
      multiTypeInputProps={{
        onChange: item => {
          const selectedItem = item as string | SelectOption
          const selectedValue = typeof selectedItem === 'string' ? selectedItem : selectedItem?.label?.toString()
          if (selectedValue && selectedValue !== '<+input>') {
            refetchTier({
              queryParams: {
                appName: selectedValue,
                ...queryParams
              }
            })
          } else {
            formikSetFieldValue('appDTier', '<+input>')
          }
          setCustomFieldAndValidation(selectedValue, true)
        },
        value: setAppDynamicsApplication(formikAppDynamicsValue, applicationOptions)
      }}
    />
  ) : (
    <FormInput.Select
      className={css.applicationDropdown}
      onChange={item => {
        refetchTier({
          queryParams: {
            appName: item.label.toString(),
            ...queryParams
          }
        })
        setCustomFieldAndValidation(item.label, true)
      }}
      value={setAppDynamicsApplication(formikAppDynamicsValue, applicationOptions)}
      name={'appdApplication'}
      placeholder={getPlaceholder(
        applicationLoading,
        'cv.healthSource.connectors.AppDynamics.applicationPlaceholder',
        getString
      )}
      items={applicationOptions}
      label={getString('cv.healthSource.connectors.AppDynamics.applicationLabel')}
      {...getInputGroupProps(() => setCustomFieldAndValidation(''))}
    />
  )
}
