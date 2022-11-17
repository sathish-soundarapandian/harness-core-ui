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
import type { SLOV2Form } from '@cv/pages/slos/components/CVCreateSLOV2/CVCreateSLOV2.types'
import { PeriodLengthTypes, PeriodTypes } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import { CreateCompositeSLOSteps } from '../../CreateCompositeSloForm.types'

export const LabelAndValue = ({ label, value }: { label: string; value: string }): JSX.Element => {
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
  const { getString } = useStrings()
  if (data.periodLengthType === PeriodLengthTypes.MONTHLY) {
    content = <LabelAndValue label={getString('cv.widowEnds')} value={data.dayOfMonth?.toString() || ''} />
  }
  if (data.periodLengthType === PeriodLengthTypes.WEEKLY) {
    content = <LabelAndValue label={getString('cv.widowEnds')} value={data.dayOfWeek?.toString() || ''} />
  }
  return (
    <>
      <LabelAndValue label={getString('cv.periodLength')} value={data.periodLengthType || ''} />
      {content}
    </>
  )
}

export const CreatePreview = ({ id, data }: { id: CreateCompositeSLOSteps; data: SLOV2Form }): JSX.Element => {
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
          {data.periodType === PeriodTypes.CALENDAR && <CalenderValuePreview data={data} />}
        </Layout.Vertical>
      )
    case CreateCompositeSLOSteps.Set_SLO_Target:
      return (
        <Layout.Vertical spacing="medium">
          <LabelAndValue
            label={`${getString('cv.SLOTarget')} ${getString('instanceFieldOptions.percentage')}`}
            value={data.SLOTargetPercentage.toString() || ''}
          />
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
      return <></>
  }
}
