/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Text, Container, FormInput, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useFormikContext } from 'formik'
import { SLOV2Form, SLOV2FormFields } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { useStrings } from 'framework/strings'
import { EmptySelectOption, consecutiveStartTimeOption, getInputGroupProps } from './OptionalConfig.constants'

const OptionalConfig = (): JSX.Element => {
  const { getString } = useStrings()
  const inputGroupProps = useMemo(() => getInputGroupProps(getString), [])
  const options = consecutiveStartTimeOption(getString)
  const { values } = useFormikContext<SLOV2Form>()
  const { considerAllConsecutiveMinutesFromStartAsBad } = values
  const dropdownValue =
    options.find(item => (item.value as unknown as boolean) === considerAllConsecutiveMinutesFromStartAsBad) ||
    EmptySelectOption

  return (
    <Container margin={{ top: 'medium' }}>
      <Text
        color={Color.PRIMARY_10}
        font={{ size: 'normal', weight: 'semi-bold' }}
        margin={{ bottom: 'small', top: 'small' }}
      >
        {getString('common.optionalConfig')}
      </Text>
      <Container width={320}>
        <Layout.Vertical>
          <FormInput.Text
            label={getString('cv.slos.slis.optionalConfig.consecutiveDuration')}
            name={SLOV2FormFields.CONSIDER_CONSECUTIVE_MINUTES}
            inputGroup={inputGroupProps}
          />
          <FormInput.Select
            name={SLOV2FormFields.CONSIDER_ALL_CONSECUTIVE_MINUTES_FROM_START_AS_BAD}
            label={getString('cv.slos.slis.optionalConfig.consecutiveMinutesFromTheStartAs')}
            items={options}
            value={dropdownValue}
            addClearButton
          />
        </Layout.Vertical>
      </Container>
    </Container>
  )
}

export default OptionalConfig
