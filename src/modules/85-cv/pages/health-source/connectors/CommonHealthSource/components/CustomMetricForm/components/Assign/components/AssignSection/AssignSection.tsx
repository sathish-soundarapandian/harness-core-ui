/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFormikContext } from 'formik'
import { Container, FormInput, FormError } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { CustomMetricFormFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import CustomMetricsSectionHeader from '../../../CustomMetricsSectionHeader'
import css from './AssignSection.module.scss'

interface AssignSectionProps {
  hideCV?: boolean
  showOnlySLI?: boolean
  hideSLIAndHealthScore?: boolean
}
export default function AssignSection({ hideCV, showOnlySLI, hideSLIAndHealthScore }: AssignSectionProps): JSX.Element {
  const { getString } = useStrings()
  const { errors, touched } = useFormikContext<CommonCustomMetricFormikInterface>()
  const showFieldError = Boolean(Object.keys(touched).length)
  return (
    <Container className={css.assignSection}>
      <CustomMetricsSectionHeader
        sectionTitle={getString('cv.monitoringSources.assign')}
        sectionSubTitle={getString('cv.monitoringSources.commonHealthSource.assign.subHeader')}
      />
      {!hideCV ? (
        <Container margin={{ top: 'large', bottom: 'large' }}>
          <FormInput.CheckBox
            name={CustomMetricFormFieldNames.CONTINUOUS_VERIFICATION}
            label={getString('cv.monitoringSources.commonHealthSource.assign.continuousVerification.title')}
            helperText={getString('cv.monitoringSources.commonHealthSource.assign.continuousVerification.helptext')}
          />
        </Container>
      ) : null}
      {!hideSLIAndHealthScore ? (
        <>
          <Container margin={{ top: 'large', bottom: 'large' }}>
            <FormInput.CheckBox
              name={CustomMetricFormFieldNames.HEALTH_SCORE}
              label={getString('cv.monitoredServices.monitoredServiceTabs.serviceHealth')}
              helperText={getString('cv.monitoringSources.commonHealthSource.assign.serviceHealth.helptext')}
            />
          </Container>
          <Container margin={{ top: 'large', bottom: 'large' }}>
            <FormInput.CheckBox
              name={CustomMetricFormFieldNames.SLI}
              label={getString('cv.monitoringSources.commonHealthSource.assign.serviceLevelIndicator.title')}
              helperText={getString('cv.monitoringSources.commonHealthSource.assign.serviceLevelIndicator.helptext')}
            />
          </Container>
        </>
      ) : null}
      {showOnlySLI && <FormInput.CheckBox label={getString('cv.slos.sli')} name={CustomMetricFormFieldNames.SLI} />}
      {errors.sli && showFieldError && (
        <Container margin={{ top: 'large', bottom: 'large' }}>
          <FormError name={CustomMetricFormFieldNames.SLI} errorMessage={errors.sli} />
        </Container>
      )}
    </Container>
  )
}
