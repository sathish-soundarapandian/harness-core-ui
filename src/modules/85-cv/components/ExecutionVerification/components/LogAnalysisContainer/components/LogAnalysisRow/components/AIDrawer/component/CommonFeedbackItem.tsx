import { Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React from 'react'
import css from '../UpdateEventPreferenceDrawer.module.scss'

interface CommonFeedbackItemProps {
  label: string
  value?: string
}

export default function CommonFeedbackItem({ label, value }: CommonFeedbackItemProps): JSX.Element | null {
  if (!label || !value) {
    return null
  }

  return (
    <Layout.Horizontal className={css.feedbackData}>
      <Text className={css.feedbackDataLabel}>{label}</Text>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_700}>
        {value}
      </Text>
    </Layout.Horizontal>
  )
}
