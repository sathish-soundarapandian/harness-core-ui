/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useEffect } from 'react'
import { defaultTo } from 'lodash-es'
import {
  SelectOption,
  FormInput,
  MultiTypeInputType,
  MultiTypeInput,
  Text,
  FormError,
  RUNTIME_INPUT_VALUE,
  AllowedTypes,
  getMultiTypeFromValue
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { getPlaceholder, setAppDynamicsTier } from '../../AppDHealthSource.utils'
import { getInputGroupProps } from '../../../MonitoredServiceConnector.utils'
import css from '../../AppDHealthSource.module.scss'

interface AppDynamicsTierInterface {
  isTemplate?: boolean
  expressions?: string[]
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
  setAppDTierCustomField: (tierValue: string) => void
  tierError?: string
  appdMultiType?: MultiTypeInputType
  tierMultiType?: MultiTypeInputType
  setTierMultiType?: Dispatch<SetStateAction<MultiTypeInputType>>
}

export default function AppDynamicsTier({
  isTemplate,
  expressions,
  tierOptions,
  tierLoading,
  formikValues,
  onValidate,
  setAppDTierCustomField,
  tierError,
  appdMultiType,
  tierMultiType: multitypeInputValue,
  setTierMultiType: setMultitypeInputValue
}: AppDynamicsTierInterface): JSX.Element {
  const { getString } = useStrings()
  const isApplicationRuntimeOrExpression = appdMultiType !== MultiTypeInputType.FIXED
  const allowedTypes: AllowedTypes = isApplicationRuntimeOrExpression
    ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
    : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]

  useEffect(() => {
    if (getMultiTypeFromValue(formikValues?.appDTier) === MultiTypeInputType.RUNTIME) {
      setMultitypeInputValue?.(MultiTypeInputType.RUNTIME)
    }
  }, [formikValues.appDTier])

  return isTemplate ? (
    <>
      <Text color={Color.BLACK} margin={{ bottom: 'small' }}>
        {getString('cv.healthSource.connectors.AppDynamics.trierLabel')}
      </Text>
      <MultiTypeInput
        key={`${multitypeInputValue}  ${appdMultiType}`}
        name={'appDTier'}
        data-testid="appDTier"
        placeholder={getPlaceholder(tierLoading, 'cv.healthSource.connectors.AppDynamics.tierPlaceholder', getString)}
        selectProps={{
          items: isApplicationRuntimeOrExpression ? [] : tierOptions
        }}
        allowableTypes={allowedTypes}
        value={setAppDynamicsTier(tierLoading, formikValues?.appDTier, tierOptions, multitypeInputValue)}
        style={{ width: '300px' }}
        expressions={expressions}
        multitypeInputValue={multitypeInputValue}
        onChange={async (item, _valueType, multiType) => {
          if (multitypeInputValue !== multiType) {
            setMultitypeInputValue?.(multiType)
          }
          const selectedItem = item as string | SelectOption
          const selectedValue =
            typeof selectedItem === 'string' ? selectedItem : defaultTo(selectedItem?.label?.toString(), '')
          setAppDTierCustomField(selectedValue as string)
          if (
            !(formikValues?.appdApplication === RUNTIME_INPUT_VALUE || formikValues?.appDTier === RUNTIME_INPUT_VALUE)
          ) {
            await onValidate(formikValues?.appdApplication, selectedValue, formikValues.metricData)
          }
        }}
      />
      {tierError && <FormError name="appDTier" errorMessage={tierError} />}
    </>
  ) : (
    <FormInput.Select
      className={css.tierDropdown}
      name={'appDTier'}
      placeholder={getPlaceholder(tierLoading, 'cv.healthSource.connectors.AppDynamics.tierPlaceholder', getString)}
      value={setAppDynamicsTier(tierLoading, formikValues?.appDTier, tierOptions) as SelectOption}
      onChange={async item => {
        setAppDTierCustomField(item.label)
        if (!(isApplicationRuntimeOrExpression || formikValues?.appDTier === RUNTIME_INPUT_VALUE)) {
          await onValidate(formikValues.appdApplication, item.label as string, formikValues.metricData)
        }
      }}
      items={tierOptions}
      label={getString('cv.healthSource.connectors.AppDynamics.trierLabel')}
      {...getInputGroupProps(() => setAppDTierCustomField(''))}
    />
  )
}
