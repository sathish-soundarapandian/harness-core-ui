/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Text, Container, Heading, Button, Layout, ButtonVariation } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import tiUpgrade from './images/ti_upgrade.svg'
import css from './BuildTests.module.scss'

export interface TICallToActionProps {
  type?: string
}

const setUpTIDocs = 'https://docs.harness.io/article/428cs02e6u'

export function TICallToAction(_props: TICallToActionProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <div className={cx(css.widgetWrapper, css.tiCallToActionWrapper)}>
      <Container style={{ paddingTop: 'var(--spacing-3)' }} className={css.widget} height="100%">
        <Layout.Horizontal spacing="medium">
          <Container className={css.tiUpgradeImage}>
            <img height={123} width={90} src={tiUpgrade} />
          </Container>
          <Layout.Vertical style={{ justifyContent: 'space-between', height: '170px' }} width={378}>
            <Container width={334}>
              <Heading width={314} color={Color.BLACK} level={5}>
                {getString('pipeline.testsReports.tiCallToAction.header')}
              </Heading>
              <Text color={Color.BLACK} className={css.subText}>
                {getString('pipeline.testsReports.tiCallToAction.utilizeTISubText')}
              </Text>
              <Text color={Color.GREY_500}>Support for Python coming soon!</Text>
            </Container>
            <Layout.Horizontal spacing="medium" className={css.actionsContainer}>
              <a rel="noreferrer" target="_blank" href={setUpTIDocs}>
                <Button className={css.findOutMoreBtn} variation={ButtonVariation.PRIMARY}>
                  {getString('common.findOutMore')}
                </Button>
              </a>
              <Text style={{ fontSize: '13px' }} color={Color.PRIMARY_7}>
                {getString('pipeline.testsReports.tiCallToAction.addRunTestsStep')}
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
        </Layout.Horizontal>
      </Container>
    </div>
  )
}
