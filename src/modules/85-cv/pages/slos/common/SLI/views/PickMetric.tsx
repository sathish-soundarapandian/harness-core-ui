/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  Container,
  FormInput,
  Layout,
  Text,
  useToaster,
  SelectOption,
  Icon,
  ButtonVariation,
  Card
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
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
  comparatorOptions,
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
import css from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.module.scss'

interface PickMetricProps extends Omit<SLIProps, 'children' | 'monitoredServicesLoading' | 'monitoredServicesData'> {
  onAddNewMetric: () => void
  monitoredServiceData: ResponseMonitoredServiceResponse | null
}

const PickMetric: React.FC<PickMetricProps> = props => {
  const { formikProps, onAddNewMetric, monitoredServiceData } = props
  const FLEX_START = 'flex-start'
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

          <Layout.Horizontal flex={{ justifyContent: FLEX_START, alignItems: 'baseline' }} spacing="small">
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
              {SLIMetricType === SLIMetricTypes.RATIO
                ? getString('cv.SLIValueIsGoodIf')
                : getString('cv.ThresholdSLIValueGoodIf')}
            </Text>
            <FormInput.Select
              name={SLOV2FormFields.OBJECTIVE_COMPARATOR}
              items={comparatorOptions}
              onChange={option => {
                formikProps.setFieldValue(SLOV2FormFields.OBJECTIVE_COMPARATOR, option.value)
              }}
              className={css.comparatorOptions}
              disabled={isRatioBasedMetric ? !validRequestMetric || !goodRequestMetric : !validRequestMetric}
            />
            <FormInput.Text
              name={SLOV2FormFields.OBJECTIVE_VALUE}
              placeholder={SLIMetricType === SLIMetricTypes.RATIO ? '1 to 99' : ''}
              inputGroup={{
                type: 'number',
                min: 0,
                max: SLIMetricType === SLIMetricTypes.RATIO ? 100 : undefined,
                step: 'any',
                rightElement:
                  SLIMetricType === SLIMetricTypes.RATIO ? <Icon name="percentage" padding="small" /> : undefined
              }}
              className={css.objectiveValue}
              disabled={isRatioBasedMetric ? !validRequestMetric || !goodRequestMetric : !validRequestMetric}
            />
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
              {SLIMetricType === SLIMetricTypes.RATIO
                ? getString('cv.percentageValidrequests')
                : getString('cv.ThresholdValidrequests')}
            </Text>
          </Layout.Horizontal>

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
