import React from 'react'
import { Container } from '@harness/uicore'
import CustomMetricSideNav from './components/CustomMetricSideNav'
import CustomMetricDetails from './components/CustomMetricDetails'
import css from './CustomMetricV2.module.scss'

export interface CustomMetricV2Props {
  headingText: string
  subHeading?: string
}

export default function CustomMetricV2(props: CustomMetricV2Props): JSX.Element {
  const { headingText, subHeading } = props
  return (
    <Container className={css.customMetricV2}>
      <CustomMetricSideNav />
      <CustomMetricDetails headingText={headingText} subHeading={subHeading} />
    </Container>
  )
}
