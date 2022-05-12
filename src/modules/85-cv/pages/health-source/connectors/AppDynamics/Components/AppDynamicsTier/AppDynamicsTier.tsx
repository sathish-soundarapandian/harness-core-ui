/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { SelectOption, FormInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { getPlaceholder, setAppDynamicsTier } from '../../AppDHealthSource.utils'
import { getInputGroupProps } from '../../../MonitoredServiceConnector.utils'
import css from '../../AppDHealthSource.module.scss'

interface AppDynamicsTierInterface {
  isTemplate?: boolean
  tierOptions: SelectOption[]
  tierLoading: boolean
  formikValues: any
  onValidate: (
    appName: string,
    tierName: string,
    metricObject: {
      [key: string]: any
    }
  ) => Promise<void>
  setCustomField: (tierValue: string) => void
}

export default function AppDynamicsTier({
  isTemplate,
  tierOptions,
  tierLoading,
  formikValues,
  onValidate,
  setCustomField
}: AppDynamicsTierInterface): JSX.Element {
  const { getString } = useStrings()

  return isTemplate ? (
    <FormInput.MultiTypeInput
      className={css.tierDropdown}
      name={'appDTier'}
      label={getString('cv.healthSource.connectors.AppDynamics.trierLabel')}
      selectItems={tierOptions}
      placeholder={getPlaceholder(tierLoading, 'cv.healthSource.connectors.AppDynamics.tierPlaceholder', getString)}
      multiTypeInputProps={{
        onChange: async item => {
          const selectedItem = item as string | SelectOption
          const selectedValue = typeof selectedItem === 'string' ? selectedItem : selectedItem?.label?.toString()
          setCustomField(selectedValue)
          if (!(formikValues?.appdApplication === '<+input>' || formikValues?.appDTier === '<+input>')) {
            await onValidate(formikValues.appdApplication, selectedValue, formikValues.metricData)
          }
        },
        value: setAppDynamicsTier(tierLoading, formikValues?.appDTier, tierOptions)
      }}
    />
  ) : (
    <FormInput.Select
      className={css.tierDropdown}
      name={'appDTier'}
      placeholder={getPlaceholder(tierLoading, 'cv.healthSource.connectors.AppDynamics.tierPlaceholder', getString)}
      value={setAppDynamicsTier(tierLoading, formikValues?.appDTier, tierOptions)}
      onChange={async item => {
        setCustomField(item.label)
        if (!(formikValues?.appdApplication === '<+input>' || formikValues?.appDTier === '<+input>')) {
          await onValidate(formikValues.appdApplication, item.label as string, formikValues.metricData)
        }
      }}
      items={tierOptions}
      label={getString('cv.healthSource.connectors.AppDynamics.trierLabel')}
      {...getInputGroupProps(() => setCustomField(''))}
    />
  )
}
