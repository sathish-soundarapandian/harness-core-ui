/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text, Color } from '@harness/uicore'
import { CompositeSLOFormInterface, CreateCompositeSLOSteps } from '../../CreateCompositeSloForm.types'

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

export const CreatePreview = ({
  id,
  data
}: {
  id: CreateCompositeSLOSteps
  data: CompositeSLOFormInterface
}): JSX.Element => {
  switch (id) {
    case CreateCompositeSLOSteps.Define_SLO_Identification:
      return (
        <Layout.Vertical spacing="medium">
          <LabelAndValue label={'SLO Name'} value={data.name} />
          {data.description && <LabelAndValue label={'Description'} value={data.description || ''} />}
          <LabelAndValue label={'User Journey'} value={data.userJourneyRef} />
        </Layout.Vertical>
      )
    case CreateCompositeSLOSteps.Set_SLO_Time_Window:
      return (
        <Layout.Vertical spacing="medium">
          <LabelAndValue label={'Period Type'} value={data.periodType || ''} />
          {data.periodLength && <LabelAndValue label={'Period Length'} value={data.periodLength || ''} />}
          {data.periodLengthType && <LabelAndValue label={'Window ends'} value={data.periodLengthType || ''} />}
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
          {data?.sloList?.map(slo => {
            return <LabelAndValue key={slo.identifier} label={slo.identifier} value={slo.name || ''} />
          })}
        </Layout.Vertical>
      )
    default:
      break
  }
  return <></>
}
