/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFormikContext } from 'formik'
import { Layout, FormInput, FormError, Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import CustomMetricsSectionHeader from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CustomMetricsSectionHeader'
import { CustomMetricFormFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'

export default function Deviation(): JSX.Element {
  const { getString } = useStrings()
  const { errors, touched } = useFormikContext<CommonCustomMetricFormikInterface>()
  const showFieldError = Boolean(Object.keys(touched).length)
  return (
    <Container margin={{ bottom: 'xlarge' }}>
      <CustomMetricsSectionHeader
        sectionTitle={getString('cv.monitoringSources.commonHealthSource.assign.deviation.title')}
        sectionSubTitle={getString('cv.monitoringSources.commonHealthSource.assign.deviation.helptext')}
      />
      <Layout.Horizontal spacing={'medium'} margin={{ top: 'small' }}>
        <FormInput.CheckBox
          label={getString('cv.monitoringSources.commonHealthSource.assign.serviceInstance.higherLabel')}
          name={CustomMetricFormFieldNames.HIGHER_BASELINE_DEVIATION}
        />
        <FormInput.CheckBox
          label={getString('cv.monitoringSources.commonHealthSource.assign.serviceInstance.lowerLabel')}
          name={CustomMetricFormFieldNames.LOWER_BASELINE_DEVIATION}
        />
      </Layout.Horizontal>
      {errors.lowerBaselineDeviation && showFieldError && (
        <Container margin={{ top: 'small', bottom: 'small' }}>
          <FormError name={CustomMetricFormFieldNames.SLI} errorMessage={errors.lowerBaselineDeviation} />
        </Container>
      )}
    </Container>
  )
}
