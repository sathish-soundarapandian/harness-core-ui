/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFormikContext } from 'formik'
import { Text, FormInput, MultiTypeInputType } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import {
  getLabelByName,
  getNestedRuntimeInputs
} from '@cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.utils'
import { spacingMedium } from '@cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/MonitoredServiceInputSetsTemplate.constants'

interface MetricDefinitionInptsetFormInterface {
  path: string
  metricDefinitions: any
}

export default function MetricDefinitionInptsetForm({
  metricDefinitions,
  path
}: MetricDefinitionInptsetFormInterface): JSX.Element {
  const { getString } = useStrings()
  const { setFieldValue: onChange } = useFormikContext()
  const runtimeMetricDefinitions = metricDefinitions.filter(
    (metricDefinition: any, index: number) => getNestedRuntimeInputs(metricDefinition, [], `${path}.${index}`)?.length
  )

  return runtimeMetricDefinitions?.map((item: any, idx: number) => {
    const runtimeItems = getNestedRuntimeInputs(item, [], `${path}.${idx}`)
    return (
      <div key={item?.metricName}>
        <Text font={'normal'} color={Color.BLACK} style={{ paddingBottom: spacingMedium }}>
          {getString('cv.monitoringSources.metricLabel')}: {item?.metricName || item?.name}
        </Text>
        {runtimeItems.map(input => {
          if (input.name === 'indexes') {
            return (
              <FormInput.MultiTextInput
                key={input.name}
                name={input.path}
                label={getLabelByName(input.name, getString)}
                onChange={value => {
                  onChange?.(input.path, value?.toString()?.split(','))
                }}
                multiTextInputProps={{ allowableTypes: [MultiTypeInputType.FIXED] }}
              />
            )
          }
          return (
            <FormInput.MultiTextInput
              key={input.name}
              name={input.path}
              label={getLabelByName(input.name, getString)}
              multiTextInputProps={{ allowableTypes: [MultiTypeInputType.FIXED] }}
            />
          )
        })}
      </div>
    )
  })
}
