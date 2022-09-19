import React, { useEffect, useMemo } from 'react'
import { useFormikContext } from 'formik'
import { Classes } from '@blueprintjs/core'
import { Container, FormInput, Text, useToaster } from '@harness/uicore'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import useCustomMetricV2HelperContext from '@cv/pages/health-source/common/CustomMetricV2/hooks/useCustomMetricV2HelperContext'
import type { CommonCustomMetricPropertyType } from '@cv/pages/health-source/common/CustomMetricV2/CustomMetric.types'
import { getRiskCategoryOptions } from '@cv/pages/health-source/common/CustomMetricV2/CustomMetric.utils'
import css from '../../HealthSourceServicesV2.module.scss'

export default function MetricPackOptions<T extends CommonCustomMetricPropertyType>(): JSX.Element | null {
  const { metricPacksResponse } = useCustomMetricV2HelperContext()

  const { values: formikValues } = useFormikContext<T>()
  const { selectedCustomMetricIndex } = formikValues

  const { getString } = useStrings()

  const { error, loading, data } = metricPacksResponse

  const { showError, clear } = useToaster()

  useEffect(() => {
    if (error) {
      clear()
      showError(getErrorMessage(error), 7000)
    }
  }, [clear, error, showError])

  const metricPackOptions = useMemo(() => getRiskCategoryOptions(data?.resource), [data])

  if (loading) {
    return (
      <Container>
        <Text tooltipProps={{ dataTooltipId: 'riskProfileBaselineDeviation' }} className={css.groupLabel}>
          {getString('cv.monitoringSources.baselineDeviation')}
        </Text>
        {[1, 2, 3, 4].map(val => (
          <Container
            key={val}
            width={150}
            height={15}
            style={{ marginBottom: 'var(--spacing-small)' }}
            className={Classes.SKELETON}
          />
        ))}
      </Container>
    )
  }

  if (metricPackOptions?.length) {
    return (
      <FormInput.RadioGroup
        label={getString('cv.monitoringSources.riskCategoryLabel')}
        name={`customMetrics.${selectedCustomMetricIndex}.analysis.riskProfile.category`}
        items={metricPackOptions}
        key={selectedCustomMetricIndex}
      />
    )
  }

  return null
}
