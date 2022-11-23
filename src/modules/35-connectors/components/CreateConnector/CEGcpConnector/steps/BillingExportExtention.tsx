/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from '../CreateCeGcpConnector.module.scss'

const BillingExportExtention: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Container className={css.extention}>
      <Layout.Vertical spacing="medium">
        <h2>{getString('connectors.ceGcp.billingExtention.heading')}</h2>
        <div>
          <span className={css.prereq}>{getString('connectors.ceGcp.billingExtention.prerequisite')}</span>{' '}
          <a>{getString('connectors.readMore')}</a>{' '}
        </div>
        <ol>
          <li>{getString('connectors.ceGcp.billingExtention.step1')}</li>
          <li>{getString('connectors.ceGcp.billingExtention.step2')}</li>
          <li>
            {getString('connectors.ceGcp.billingExtention.step3.p1')}{' '}
            <span className={css.gray}>{getString('connectors.ceGcp.billingExtention.step3.p2')}</span>
            {getString('connectors.ceGcp.billingExtention.step3.p3')}
          </li>
          <li>{getString('connectors.ceGcp.billingExtention.step4')}</li>
          <li>{getString('connectors.ceGcp.billingExtention.step5')}</li>
          <li>{getString('connectors.ceGcp.billingExtention.step6')}</li>
          <li>{getString('connectors.ceGcp.billingExtention.step7')}</li>
        </ol>
        <div>
          <div> {getString('connectors.ceGcp.billingExtention.otherLinks')}</div>
          <ul>
            <li>
              <a>{getString('connectors.ceGcp.billingExtention.link1')}</a>
            </li>
            <li>
              <a>{getString('connectors.ceGcp.billingExtention.link2')}</a>
            </li>
          </ul>
        </div>
      </Layout.Vertical>
    </Container>
  )
}

export default BillingExportExtention
