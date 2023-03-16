/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Container, FormInput, Layout, Text, useToaster, SelectOption, ButtonVariation, Card } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { RadioButtonProps } from '@harness/uicore/dist/components/RadioButton/RadioButton'
import { ResponseMonitoredServiceResponse, useGetSloMetrics } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import CVRadioLabelTextAndDescription from '@cv/components/CVRadioLabelTextAndDescription'
import {
  getEventTypeOptions,
  getMissingDataTypeOptions
} from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.constants'
import {
  SLIProps,
  SLIMetricTypes,
  SLOV2FormFields,
  SLIEventTypes
} from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { getSLOMetricOptions } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.utils'
import { defaultOption } from '../SLI.constants'
import { ObjectiveStatementBlock } from './ObjectiveStatementBlock'
import css from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.module.scss'

export interface PickMetricProps
  extends Omit<SLIProps, 'children' | 'monitoredServicesLoading' | 'monitoredServicesData'> {
  onAddNewMetric: () => void
  monitoredServiceData: ResponseMonitoredServiceResponse | null
}

const PickMetric: React.FC<PickMetricProps> = props => {
  const { formikProps, onAddNewMetric, monitoredServiceData, metricsNames, setMetricsNames } = props
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & { identifier?: string }>()
  const { monitoredServiceRef, healthSourceRef, eventType, goodRequestMetric, validRequestMetric, SLIMetricType } =
    formikProps?.values || {}
  const isRatioBasedMetric = SLIMetricType === SLIMetricTypes.RATIO

  const {
    data: SLOMetricsData,
    loading: SLOMetricsLoading,
    error: SLOMetricsError,
    refetch: refetchSLOMetrics
  } = useGetSloMetrics({
    monitoredServiceIdentifier: monitoredServiceRef ?? '',
    healthSourceIdentifier: healthSourceRef ?? '',
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (monitoredServiceRef && healthSourceRef && monitoredServiceData) {
      refetchSLOMetrics()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monitoredServiceRef, healthSourceRef, monitoredServiceData])

  useEffect(() => {
    if (SLOMetricsError) {
      showError(getErrorMessage(SLOMetricsError))
    }
  }, [SLOMetricsError, showError])

  const SLOMetricOptions = getSLOMetricOptions(SLOMetricsData?.resource)

  const activeGoodMetric: SelectOption = useMemo(
    () => SLOMetricOptions.find(metric => metric.value === goodRequestMetric) ?? defaultOption,
    [SLOMetricOptions, goodRequestMetric]
  )

  const activeValidMetric: SelectOption = useMemo(
    () => SLOMetricOptions.find(metric => metric.value === validRequestMetric) ?? defaultOption,
    [SLOMetricOptions, validRequestMetric]
  )

  useEffect(() => {
    const { activeValidMetric: validMetricName, activeGoodMetric: goodMetricName } = metricsNames || {}
    if (activeValidMetric.label !== validMetricName?.label || activeGoodMetric.label !== goodMetricName?.label) {
      setMetricsNames?.({ activeValidMetric, activeGoodMetric })
    }
  }, [activeValidMetric.label, activeGoodMetric.label])

  const radioItems: Pick<RadioButtonProps, 'label' | 'value'>[] = useMemo(() => {
    const { THRESHOLD, RATIO } = SLIMetricTypes
    return [
      {
        label: (
          <CVRadioLabelTextAndDescription
            label="cv.slos.slis.metricOptions.thresholdBased"
            description="cv.slos.contextualHelp.sli.thresholdDescription"
          />
        ),
        value: THRESHOLD
      },
      {
        label: (
          <CVRadioLabelTextAndDescription
            label="cv.slos.slis.metricOptions.ratioBased"
            description="cv.slos.contextualHelp.sli.ratioBasedDescription"
          />
        ),
        value: RATIO
      }
    ]
  }, [])

  const goodOrBadRequestMetricLabel =
    eventType === SLIEventTypes.BAD
      ? getString('cv.slos.slis.ratioMetricType.badRequestsMetrics')
      : getString('cv.slos.slis.ratioMetricType.goodRequestsMetrics')

  return (
    <>
      <Container className={css.cardPickMetric} border padding={'xlarge'}>
        <Layout.Vertical margin={{ bottom: 'medium' }} spacing="tiny">
          <Text color={Color.PRIMARY_10} font={{ size: 'normal', weight: 'semi-bold' }}>
            {getString('cv.slos.evaluationMethod')}
          </Text>
          <Text font={{ size: 'normal', weight: 'light' }}>{getString('cv.slos.evaluationMethodSubtitle')}</Text>
        </Layout.Vertical>
        <Layout.Vertical width="80%">
          <Card className={css.noShadow}>
            <FormInput.RadioGroup
              name={SLOV2FormFields.SLI_METRIC_TYPE}
              className={css.radioGroup}
              items={radioItems}
              onChange={(e: FormEvent<HTMLInputElement>) => {
                formikProps.setFieldValue(SLOV2FormFields.SLI_METRIC_TYPE, e.currentTarget.value)
                formikProps.setFieldValue(SLOV2FormFields.OBJECTIVE_VALUE, undefined)
              }}
            />
          </Card>
        </Layout.Vertical>
        <Layout.Vertical spacing="small">
          {isRatioBasedMetric && (
            <Layout.Vertical>
              <FormInput.Select
                name={SLOV2FormFields.EVENT_TYPE}
                label={getString('cv.slos.slis.ratioMetricType.eventType')}
                items={getEventTypeOptions(getString)}
                className={css.metricSelect}
              />
              <Layout.Horizontal spacing="medium">
                <FormInput.Select
                  name={SLOV2FormFields.GOOD_REQUEST_METRIC}
                  label={goodOrBadRequestMetricLabel}
                  placeholder={SLOMetricsLoading ? getString('loading') : undefined}
                  disabled={!healthSourceRef}
                  items={SLOMetricOptions}
                  className={css.metricSelect}
                  value={activeGoodMetric}
                  onChange={metric => formikProps.setFieldValue(SLOV2FormFields.GOOD_REQUEST_METRIC, metric.value)}
                />
                <RbacButton
                  icon="plus"
                  text={getString('cv.newMetric')}
                  variation={ButtonVariation.SECONDARY}
                  disabled={!healthSourceRef}
                  onClick={onAddNewMetric}
                  margin={{ top: 'xlarge' }}
                  permission={{
                    permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
                    resource: {
                      resourceType: ResourceType.MONITOREDSERVICE,
                      resourceIdentifier: projectIdentifier
                    }
                  }}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          )}
          <Layout.Horizontal spacing="medium">
            <FormInput.Select
              name={SLOV2FormFields.VALID_REQUEST_METRIC}
              label={getString('cv.slos.slis.ratioMetricType.validRequestsMetrics')}
              placeholder={SLOMetricsLoading ? getString('loading') : undefined}
              disabled={!healthSourceRef}
              items={SLOMetricOptions}
              className={css.metricSelect}
              value={activeValidMetric}
              onChange={metric => formikProps.setFieldValue(SLOV2FormFields.VALID_REQUEST_METRIC, metric.value)}
            />
            <RbacButton
              icon="plus"
              text={getString('cv.newMetric')}
              variation={ButtonVariation.SECONDARY}
              disabled={!healthSourceRef}
              margin={{ top: 'xlarge' }}
              onClick={onAddNewMetric}
              className={css.addMetricButton}
              permission={{
                permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
                resource: {
                  resourceType: ResourceType.MONITOREDSERVICE,
                  resourceIdentifier: projectIdentifier
                }
              }}
            />
          </Layout.Horizontal>

          <ObjectiveStatementBlock
            isRatioBasedMetric={isRatioBasedMetric}
            validRequestMetric={validRequestMetric}
            goodRequestMetric={goodRequestMetric}
            formikProps={formikProps}
          />

          <Card className={css.noShadow}>
            <FormInput.RadioGroup
              radioGroup={{ inline: true }}
              name={SLOV2FormFields.SLI_MISSING_DATA_TYPE}
              label={getString('cv.considerMissingMetricDataAs')}
              items={getMissingDataTypeOptions(getString)}
              className={css.metricSelect}
            />
          </Card>
        </Layout.Vertical>
      </Container>
    </>
  )
}

export default PickMetric
