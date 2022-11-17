/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Heading } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from '../CreateCeAwsConnector.module.scss'

const CrossAccountRoleExtension = (props: { previewTemplateLink?: string }) => {
  const { getString } = useStrings()
  const { previewTemplateLink } = props
  return (
    <Container className={css.extention}>
      <Heading level={2} className={css.header}>
        {getString('connectors.ceAws.crossAccountRoleExtention.heading')}
      </Heading>
      <p>{getString('connectors.ceAws.crossAccountRoleExtention.subHeading')}</p>
      <ol>
        <li>
          {getString('connectors.ceAws.crossAccountRoleExtention.step1.p1')}
          <a href={previewTemplateLink || ''} target="_blank" rel="noreferrer">
            {getString('connectors.ceAws.crossAccountRoleExtention.step1.p2')}
          </a>{' '}
          {getString('connectors.ceAws.crossAccountRoleExtention.step1.p3')}
        </li>
        <li>
          {getString('connectors.ceAws.crossAccountRoleExtention.step2.heading')}
          <ul>
            <li>{getString('connectors.ceAws.crossAccountRoleExtention.step2.subStep1')}</li>
            <li>
              {getString('connectors.ceAws.crossAccountRoleExtention.step2.subStep2.p1')}
              <span className={css.gray}>
                {getString('connectors.ceAws.crossAccountRoleExtention.step2.subStep2.p2')}
              </span>
            </li>
          </ul>
        </li>
        <li>
          {getString('connectors.ceAws.crossAccountRoleExtention.step3.p1')}{' '}
          <span className={css.gray}>{getString('connectors.ceAws.crossAccountRoleExtention.step3.p2')}</span>{' '}
          {getString('connectors.ceAws.crossAccountRoleExtention.step3.p3')}
          <span className={css.gray}>{getString('connectors.ceAws.crossAccountRoleExtention.step3.p4')}</span>.
        </li>
        <li>{getString('connectors.ceAws.crossAccountRoleExtention.step4')}</li>
        <li>{getString('connectors.ceAws.crossAccountRoleExtention.step5')}</li>
      </ol>
      <p>{getString('connectors.ceAws.curExtention.moreHelp.heading')}</p>
      <ul>
        <li>
          <a
            href="https://docs.harness.io/article/5ql31pdjcm-enable-continuous-efficiency-for-aws"
            target="_blank"
            rel="noreferrer"
          >
            {getString('connectors.ceAws.curExtention.moreHelp.step2')}
          </a>
        </li>
      </ul>
    </Container>
  )
}

export default CrossAccountRoleExtension
