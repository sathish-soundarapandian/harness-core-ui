/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useEffect } from 'react'
import { useFormikContext } from 'formik'
import { Classes } from '@blueprintjs/core'
import { Text, Container, FormInput, FormError } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { useGetRiskCategoryForCustomHealthMetric } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import CustomMetricsSectionHeader from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CustomMetricsSectionHeader'
import { CustomMetricFormFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import { getRiskCategoryOptionsV2 } from '../../RiskProfile.utils'
import css from './RiskProfileCategeory.module.scss'

interface RiskProfileCategeoryProps {
  riskCategory?: string
  riskProfileResponse?: ReturnType<typeof useGetRiskCategoryForCustomHealthMetric>
}

export default function RiskProfileCategeory({
  riskCategory,
  riskProfileResponse
}: RiskProfileCategeoryProps): JSX.Element {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { errors, touched } = useFormikContext<CommonCustomMetricFormikInterface>()
  const showFieldError = Boolean(Object.keys(touched).length)
  const { error: riskProfileError, loading: riskProfileLoading, data: riskProfileData } = riskProfileResponse || {}

  useEffect(() => {
    if (riskProfileError) {
      clear()
      showError(getErrorMessage(riskProfileError), 7000)
    }
  }, [riskProfileError])

  const riskCategoryItems = useMemo(() => {
    if (riskProfileData) {
      return getRiskCategoryOptionsV2(riskProfileData?.resource)
    }

    return []
  }, [riskProfileData])

  let metricPackContent: React.ReactNode = <Container />
  if (riskProfileLoading) {
    metricPackContent = (
      <Container data-testid="metricPackOptions-loading">
        <CustomMetricsSectionHeader sectionTitle={getString('cv.monitoringSources.riskCategoryLabel')} />
        <div className={css.loadingContainer}>
          {[1, 2, 3, 4].map(val => (
            <Container key={val} width={150} height={15} className={Classes.SKELETON} />
          ))}
        </div>
      </Container>
    )
  } else if (riskCategoryItems?.length) {
    metricPackContent = (
      <FormInput.RadioGroup
        label={
          <Text
            font={{ variation: FontVariation.CARD_TITLE }}
            tooltipProps={{
              dataTooltipId: 'riskProfileBaselineDeviation'
            }}
          >
            {getString('cv.monitoringSources.riskCategoryLabel')}
          </Text>
        }
        key={riskCategory}
        radioGroup={{ inline: true }}
        name={CustomMetricFormFieldNames.RISK_CATEGORY}
        items={riskCategoryItems}
        className={css.riskProfileRadioGroup}
      />
    )
  }
  return (
    <Container margin={{ bottom: 'xlarge' }}>
      {metricPackContent}
      {errors.riskCategory && showFieldError && (
        <FormError name={CustomMetricFormFieldNames.SLI} errorMessage={errors.riskCategory} />
      )}
    </Container>
  )
}
