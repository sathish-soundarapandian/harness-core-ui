/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, Color, SelectOption, MultiSelectOption } from '@harness/uicore'
import type { SLOV2Form } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { PeriodLengthTypes, PeriodTypes } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import { CreateCompositeSLOSteps } from '../../CreateCompositeSloForm.types'

export const LabelAndValue = ({ label, value }: { label: string; value: string }) => {
  return (
    <Layout.Horizontal spacing="medium">
      <Text font={{ weight: 'semi-bold' }} color={Color.GREY_1000}>
        {label}
      </Text>
      <Text color={Color.GREY_1000}>{value}</Text>
    </Layout.Horizontal>
  )
}

export const CalenderValuePreview = ({ data }: { data: SLOV2Form }): JSX.Element => {
  let content = <></>
  if (data.periodLengthType === PeriodLengthTypes.MONTHLY) {
    content = <LabelAndValue label={'Window ends'} value={data.dayOfMonth?.toString() || ''} />
  }
  if (data.periodLengthType === PeriodLengthTypes.WEEKLY) {
    content = <LabelAndValue label={'Window ends'} value={data.dayOfWeek?.toString() || ''} />
  }
  return (
    <>
      <LabelAndValue label={'Period Length'} value={data.periodLengthType || ''} />
      {content}
    </>
  )
}

export const CreatePreview = ({ id, data }: { id: CreateCompositeSLOSteps; data: SLOV2Form }): JSX.Element => {
  switch (id) {
    case CreateCompositeSLOSteps.Define_SLO_Identification:
      return (
        <Layout.Vertical spacing="medium">
          <LabelAndValue label={'SLO Name'} value={data.name} />
          {data.description && <LabelAndValue label={'Description'} value={data.description || ''} />}
          <LabelAndValue
            label={'User Journey'}
            value={(data.userJourneyRef as unknown as MultiSelectOption[])
              ?.map((userJourney: SelectOption) => userJourney.label || userJourney)
              .join(',')}
          />
        </Layout.Vertical>
      )
    case CreateCompositeSLOSteps.Set_SLO_Time_Window:
      return (
        <Layout.Vertical spacing="medium">
          <LabelAndValue label={'Period Type'} value={data.periodType || ''} />
          {data.periodType === PeriodTypes.ROLLING && (
            <LabelAndValue label={'Period Length'} value={data.periodLength || ''} />
          )}
          {data.periodType === PeriodTypes.CALENDAR && <CalenderValuePreview data={data} />}
        </Layout.Vertical>
      )
    case CreateCompositeSLOSteps.Set_SLO_Target:
      return (
        <Layout.Vertical spacing="medium">
          <LabelAndValue label={'SLO Target Percentage'} value={data.SLOTargetPercentage.toString() || ''} />
        </Layout.Vertical>
      )
    case CreateCompositeSLOSteps.Add_SLOs:
      return (
        <Layout.Vertical spacing="medium">
          {data?.serviceLevelObjectivesDetails?.map(slo => {
            return (
              <LabelAndValue
                key={slo.serviceLevelObjectiveRef}
                label={slo.serviceLevelObjectiveRef}
                value={slo.weightagePercentage.toString()}
              />
            )
          })}
        </Layout.Vertical>
      )
    default:
      break
  }
  return <></>
}
