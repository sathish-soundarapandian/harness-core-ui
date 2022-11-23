/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color } from '@harness/design-system'
import { Container, Heading, Text } from '@harness/uicore'
import css from './AWSCOConnector.module.scss'

const AWSConnectorExtension: React.FC = () => {
  return (
    <Container className={css.awsConnectorExtension}>
      <Heading level={2} color={Color.GREY_500} className={css.header}>
        Create cross-account IAM role using AWS CloudFormation template
      </Heading>
      <ol type={'1'}>
        <li>
          <Text>Log in to your master account to launch Cloudformation template</Text>
          <Text style={{ marginTop: 'var(--spacing-large)' }}>
            You can <span>Preview Template</span> to understand all the permissions involved.
          </Text>
        </li>
        <li>
          <Text>On the console:</Text>
          <ul>
            <li>Click the checkbox to acknowledge the IAM role creation</li>
            <li>
              Click <span className={css.codeText}>Create stack</span>
            </li>
          </ul>
        </li>
        <li>
          <Text>
            On stack details page click on <span className={css.codeText}>Outputs</span> tab and copy{' '}
            <span className={css.codeText}>IAM ARN</span>.
          </Text>
        </li>
        <li>
          <Text>Provide that IAM ARN in Harness UI.</Text>
        </li>
        <li>
          <Text>External ID is a random unique value to provide additional secure authentication.</Text>
        </li>
      </ol>
    </Container>
  )
}

export default AWSConnectorExtension
