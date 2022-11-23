/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, SelectOption, MultiSelectOption } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { KeyValuePair } from '@cv/pages/slos/CVSLODetailsPage/DetailsPanel/views/ServiceDetails'
import { PeriodLengthTypes, PeriodTypes } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import { CreateCompositeSLOSteps } from '../../CreateCompositeSloForm.types'
import type { CreatePreviewProps, LabelValueProps, CalenderValuePreviewProps } from './CreatePreview.types'
import css from './CreatePreview.module.scss'

export const LabelAndValue = ({
  label,
  value,
  className,
  isLabelHeading = true,
  isValueHeading = false
}: LabelValueProps): JSX.Element => {
  return (
    <Layout.Horizontal spacing="medium" className={className}>
      <Text
        title={label}
        font={isLabelHeading ? { weight: 'semi-bold' } : { weight: 'light' }}
        color={Color.GREY_1000}
        width={100}
      >
        {label}
      </Text>
      <Text font={isValueHeading ? { weight: 'semi-bold' } : { weight: 'light' }} color={Color.GREY_1000}>
        {value}
      </Text>
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
        <Layout.Vertical spacing="medium">
          <LabelAndValue label={getString('cv.slos.sloName')} value={data.name} />
          {data.description && <LabelAndValue label={getString('description')} value={data.description || ''} />}
          <LabelAndValue
            label={getString('cv.slos.userJourney')}
            value={(data.userJourneyRef as unknown as MultiSelectOption[])
              ?.map((userJourney: SelectOption) => userJourney.label || userJourney)
              .join(',')}
          />
        </Layout.Vertical>
      )
    case CreateCompositeSLOSteps.Set_SLO_Time_Window:
      return (
        <Layout.Vertical spacing="medium">
          <LabelAndValue label={getString('cv.slos.sloTargetAndBudget.periodType')} value={data.periodType || ''} />
          {data.periodType === PeriodTypes.ROLLING && (
            <LabelAndValue label={getString('cv.periodLength')} value={data.periodLength || ''} />
          )}
          {data.periodType === PeriodTypes.CALENDAR && <CalenderValuePreview data={data} isPreview />}
        </Layout.Vertical>
      )
    case CreateCompositeSLOSteps.Set_SLO_Target:
      return (
        <Layout.Vertical spacing="medium">
          <LabelAndValue
            label={`${getString('cv.SLOTarget')}`}
            value={`${data.SLOTargetPercentage.toString()}%` || ''}
          />
        </Layout.Vertical>
      )
    case CreateCompositeSLOSteps.Add_SLOs:
      return (
        <Layout.Vertical spacing="medium">
          <LabelAndValue
            isLabelHeading={true}
            isValueHeading={true}
            className={css.previewRows}
            label={getString('cv.SLO')}
            value={getString('cv.CompositeSLO.Weightage')}
          />
          {data?.serviceLevelObjectivesDetails?.map(slo => {
            return (
              <LabelAndValue
                isLabelHeading={false}
                className={css.previewRows}
                key={slo.serviceLevelObjectiveRef}
                label={slo.serviceLevelObjectiveRef}
                value={`${slo.weightagePercentage.toString()}%`}
              />
            )
          })}
        </Layout.Vertical>
      )
    default:
      return <></>
  }
}
