/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Heading, Layout, Container, Text, Button } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import bgImage from '@et/images/cet.svg'
import css from './ETTrialPage.module.scss'

const ETTrialPage: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Container className={css.body} style={{ background: `transparent url(${bgImage}) no-repeat` }}>
      <Heading className={css.heading} font={{ weight: 'bold', size: 'large' }} color={Color.BLACK_100}>
        {getString('et.continuous')}
      </Heading>
      <Layout.Vertical spacing="small">
        <Text padding={{ bottom: 'xxlarge' }} width={500}>
          {getString('et.homepage.slogan')}
        </Text>
        <a href="https://developer.harness.io/docs/category/continuous-error-tracking" rel="noreferrer" target="_blank">
          {getString('et.homepage.learnMore')}
        </a>
        <Button
          style={{ cursor: 'default' }}
          width={300}
          height={45}
          text={getString('common.trialCommingSoon')}
          disabled
        />
        <Button
          width={300}
          height={45}
          intent="primary"
          target="_blank"
          href="https://www.harness.io/company/contact-sales?utm_source=Website&utm_medium=internal&utm_content=Contact-Sales-STO-Pricing"
          text={getString('common.banners.trial.contactSales')}
        />
      </Layout.Vertical>
    </Container>
  )
}
export default ETTrialPage
