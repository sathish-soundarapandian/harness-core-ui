/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect } from 'react'
import { useFormikContext } from 'formik'
import { Container } from '@harness/uicore'
import { PeriodTypes } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import { SLOV2Form, SLOV2FormFields } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { SloPeriodLength } from '@cv/pages/slos/components/CVCreateSLO/components/CreateSLOForm/components/SLOTargetAndBudgetPolicy/SLOTargetAndBudgetPolicy'

interface PeriodInterface {
  periodType?: string
  periodLengthType?: string
}

export default function PeriodLength({ periodType, periodLengthType }: PeriodInterface) {
  const formikProps = useFormikContext<SLOV2Form>()
  useEffect(() => {
    if (periodType === PeriodTypes.ROLLING) {
      formikProps.setValues({
        ...formikProps.values,
        [SLOV2FormFields.DAY_OF_WEEK]: undefined,
        [SLOV2FormFields.DAY_OF_MONTH]: undefined,
        [SLOV2FormFields.PERIOD_LENGTH_TYPE]: undefined
      })
    } else if (periodType === PeriodTypes.CALENDAR) {
      formikProps.setValues({
        ...formikProps.values,
        [SLOV2FormFields.PERIOD_LENGTH]: undefined
      })
    }
  }, [periodType])

  return (
    <Container width={200}>
      <SloPeriodLength periodType={periodType} periodLengthType={periodLengthType} verticalOrientation />
    </Container>
  )
}
