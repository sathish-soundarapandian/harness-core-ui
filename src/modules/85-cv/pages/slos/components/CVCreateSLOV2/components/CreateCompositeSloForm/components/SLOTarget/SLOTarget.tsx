/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { FormikContextType } from 'formik'
import { Layout, Icon, Container, FormInput } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { SLOV2Form, SLOV2FormFields } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { PeriodTypes } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import { CalenderValuePreview, LabelAndValue } from '../CreatePreview/CreatePreview'

interface SLOTargetProps {
  formikProps: FormikContextType<SLOV2Form>
}

const SLOTarget = ({ formikProps }: SLOTargetProps): JSX.Element => {
  const { getString } = useStrings()
  return (
    <>
      <Layout.Horizontal spacing="medium" margin={{ bottom: 'small' }}>
        <LabelAndValue
          label={getString('cv.slos.sloTargetAndBudget.periodType')}
          value={formikProps.values.periodType || ''}
        />
        {formikProps.values.periodType === PeriodTypes.ROLLING && (
          <LabelAndValue label={getString('cv.periodLength')} value={formikProps.values.periodLength || ''} />
        )}
        {formikProps.values.periodType === PeriodTypes.CALENDAR && <CalenderValuePreview data={formikProps.values} />}
      </Layout.Horizontal>
      <Container width={250} margin={{ top: 'medium' }}>
        <FormInput.Text
          name={SLOV2FormFields.SLO_TARGET_PERCENTAGE}
          label={getString('cv.SLOTarget')}
          inputGroup={{
            type: 'number',
            min: 0,
            max: 100,
            step: 'any',
            rightElement: <Icon name="percentage" padding="small" />
          }}
        />
      </Container>
    </>
  )
}

export default SLOTarget
