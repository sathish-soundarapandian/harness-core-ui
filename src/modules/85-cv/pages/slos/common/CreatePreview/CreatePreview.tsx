/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, SelectOption, MultiSelectOption, Container } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import {
  PeriodLengthTypes,
  PeriodTypes,
  SLIMetricTypes
} from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { KeyValuePair } from '@cv/pages/slos/CVSLODetailsPage/DetailsPanel/views/ServiceDetails'
import { CreateCompositeSLOSteps } from '../../components/CVCreateSLOV2/components/CreateCompositeSloForm/CreateCompositeSloForm.types'
import type { CreatePreviewProps, LabelValueProps, CalenderValuePreviewProps } from './CreatePreview.types'
import { CreateSimpleSLOSteps } from '../../components/CVCreateSLOV2/components/CreateSimpleSloForm/CreateSimpleSloForm.types'
import css from './CreatePreview.module.scss'

export const LabelAndValue = ({
  label,
  value,
  className,
  isLabelHeading = true,
  isValueHeading = false
}: LabelValueProps): JSX.Element => {
  const isStringValue = typeof value === 'string'
  return (
    <Layout.Horizontal
      spacing="medium"
      className={className}
      flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }}
    >
      <Text
        title={label}
        font={isLabelHeading ? { variation: FontVariation.FORM_HELP } : { variation: FontVariation.BODY }}
        color={Color.GREY_1000}
        width={isLabelHeading ? 100 : 300}
      >
        {label}
      </Text>
      {isStringValue ? (
        <Text
          font={isValueHeading ? { variation: FontVariation.FORM_HELP } : { variation: FontVariation.BODY }}
          color={Color.GREY_1000}
        >
          {value}
        </Text>
      ) : (
        <Container
          font={isValueHeading ? { variation: FontVariation.FORM_HELP } : { variation: FontVariation.BODY }}
          color={Color.GREY_1000}
        >
          {value}
        </Container>
      )}
    </Layout.Horizontal>
  )
}

export const CalenderValuePreview = ({ data, isPreview }: CalenderValuePreviewProps): JSX.Element => {
  let content = <></>
  const { getString } = useStrings()
  const Preview = isPreview ? LabelAndValue : KeyValuePair
  if (data.periodLengthType === PeriodLengthTypes.MONTHLY) {
    content = <Preview label={getString('cv.widowEnds')} value={data.dayOfMonth?.toString() || ''} />
  }
  if (data.periodLengthType === PeriodLengthTypes.WEEKLY) {
    content = <Preview label={getString('cv.widowEnds')} value={data.dayOfWeek?.toString() || ''} />
  }
  return (
    <>
      <Preview label={getString('cv.periodLength')} value={data.periodLengthType || ''} />
      {content}
    </>
  )
}

export const CreatePreview = ({ id, data }: CreatePreviewProps): JSX.Element => {
  const { getString } = useStrings()
  switch (id) {
    case CreateCompositeSLOSteps.Define_SLO_Identification:
      return (
        <Layout.Vertical spacing="small">
          <LabelAndValue label={getString('cv.slos.sloName')} value={data.name} />
          {data.description && <LabelAndValue label={getString('description')} value={data.description || ''} />}
          <LabelAndValue
            label={getString('cv.slos.userJourney')}
            value={(data.userJourneyRef as unknown as MultiSelectOption[])
              ?.map((userJourney: SelectOption) => userJourney.label || userJourney)
              .join(' , ')}
          />
          {data.monitoredServiceRef && (
            <LabelAndValue label={getString('cv.monitoredServices.heading')} value={data.monitoredServiceRef} />
          )}
        </Layout.Vertical>
      )
    case CreateSimpleSLOSteps.Set_SLO:
    case CreateCompositeSLOSteps.Set_SLO_Time_Window:
      return (
        <Layout.Vertical spacing="small">
          <LabelAndValue label={getString('cv.slos.sloTargetAndBudget.periodType')} value={data.periodType || ''} />
          {data.periodType === PeriodTypes.ROLLING && (
            <LabelAndValue label={getString('cv.periodLength')} value={data.periodLength || ''} />
          )}
          {data.periodType === PeriodTypes.CALENDAR && <CalenderValuePreview data={data} isPreview />}
          {id === CreateSimpleSLOSteps.Set_SLO && (
            <LabelAndValue
              label={`${getString('cv.SLOTarget')}`}
              value={`${data.SLOTargetPercentage.toString()}%` || ''}
            />
          )}
        </Layout.Vertical>
      )
    case CreateCompositeSLOSteps.Set_SLO_Target:
      return (
        <Layout.Vertical spacing="small">
          <LabelAndValue
            label={`${getString('cv.SLOTarget')}`}
            value={`${data.SLOTargetPercentage.toString()}%` || ''}
          />
        </Layout.Vertical>
      )
    case CreateCompositeSLOSteps.Add_SLOs:
      return (
        <Layout.Vertical spacing="small">
          <LabelAndValue
            isLabelHeading={true}
            isValueHeading={true}
            className={css.previewRows}
            label={getString('cv.SLO')}
            value={getString('cv.CompositeSLO.Weightage')}
          />
          {data?.serviceLevelObjectivesDetails?.map(slo => {
            const { name, serviceLevelObjectiveRef, weightagePercentage } = slo
            return (
              <LabelAndValue
                isLabelHeading={false}
                className={css.previewRows}
                key={serviceLevelObjectiveRef}
                label={name || serviceLevelObjectiveRef}
                value={`${weightagePercentage.toString()}%`}
              />
            )
          })}
        </Layout.Vertical>
      )
    case CreateSimpleSLOSteps.Configure_Service_Level_Indicatiors:
      return (
        <Layout.Vertical>
          <LabelAndValue label={getString('cv.slos.healthSource')} value={data.healthSourceRef || ''} />
          <LabelAndValue label={getString('cv.slos.sliType')} value={data.serviceLevelIndicatorType || ''} />
          <LabelAndValue label={getString('cv.slos.evaluationMethod')} value={data.SLIMetricType || ''} />
          <LabelAndValue
            label={'Definitions'}
            value={
              <Layout.Vertical>
                <Layout.Horizontal spacing={'small'}>
                  <Text font={{ variation: FontVariation.BODY }}>{getString('cv.slos.requestType')}: </Text>
                  <Text font={{ variation: FontVariation.BODY }}>{data.SLIMissingDataType}</Text>
                </Layout.Horizontal>
                {data.SLIMetricType === SLIMetricTypes.RATIO && (
                  <Layout.Horizontal spacing={'small'}>
                    <Text font={{ variation: FontVariation.BODY }}>{getString('cv.slos.goodRequestMetric')}: </Text>
                    <Text font={{ variation: FontVariation.BODY }}>{data.goodRequestMetric}</Text>
                  </Layout.Horizontal>
                )}
                <Layout.Horizontal spacing={'small'}>
                  <Text font={{ variation: FontVariation.BODY }}>{getString('cv.slos.validRequestMetric')}: </Text>
                  <Text font={{ variation: FontVariation.BODY }}>{data.validRequestMetric}</Text>
                </Layout.Horizontal>
              </Layout.Vertical>
            }
          />
          <LabelAndValue
            label={'Success criteria'}
            value={`Good requests must be ${data.objectiveComparator} ${data.objectiveValue} of valid requests`}
          />
        </Layout.Vertical>
      )
    default:
      return <></>
  }
}
