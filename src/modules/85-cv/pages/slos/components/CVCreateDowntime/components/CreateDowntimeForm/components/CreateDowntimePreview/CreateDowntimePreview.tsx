/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { getDowntimeCategoryLabel } from '@cv/pages/slos/components/CVCreateDowntime/CVCreateDowntime.utils'
import { CreateDowntimeSteps } from '../../CreateDowntimeForm.types'
import type { CreateDowntimePreviewProps, LabelValueProps } from './CreateDowntimePreview.types'
import { getSummaryData } from './CreateDowntimePreview.utils'

export const LabelAndValue = ({ label, value, recurrenceText }: LabelValueProps): JSX.Element => {
  return (
    <Layout.Horizontal spacing="small">
      <Text title={label} font={{ weight: 'semi-bold' }} color={Color.GREY_1000} width={120}>
        {label}
      </Text>
      <Layout.Vertical spacing={'xsmall'}>
        <Text font={{ weight: 'light' }} color={Color.GREY_1000}>
          {value}
        </Text>
        {recurrenceText && (
          <Text font={{ weight: 'light' }} color={Color.GREY_1000}>
            {recurrenceText}
          </Text>
        )}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export const CreateDowntimePreview = ({ id, data }: CreateDowntimePreviewProps): JSX.Element => {
  const { getString } = useStrings()
  switch (id) {
    case CreateDowntimeSteps.DEFINE_DOWNTIME:
      return (
        <Layout.Vertical spacing="small">
          <LabelAndValue label={getString('cv.sloDowntime.downtimeName')} value={data.name} />
          {data.description && <LabelAndValue label={getString('description')} value={data.description} />}
          <LabelAndValue
            label={getString('cv.sloDowntime.category')}
            value={getDowntimeCategoryLabel(data.category, getString)}
          />
        </Layout.Vertical>
      )
    case CreateDowntimeSteps.SELECT_DOWNTIME_WINDOW: {
      const [value, recurrenceText] = getSummaryData(data)
      return (
        <Layout.Vertical spacing="small">
          <LabelAndValue label={getString('summary')} value={value} recurrenceText={recurrenceText} />
        </Layout.Vertical>
      )
    }
    default:
      return <></>
  }
}
