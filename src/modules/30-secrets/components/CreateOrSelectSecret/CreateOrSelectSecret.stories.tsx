/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Meta, Story } from '@storybook/react'

import { Container } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import CreateOrSelectSecret, { CreateOrSelectSecretProps } from './CreateOrSelectSecret'

export default {
  title: 'Secrets / CreateOrSelectSecret',
  component: CreateOrSelectSecret
} as Meta

export const Basic: Story<CreateOrSelectSecretProps> = args => (
  <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'dummy' }}>
    <Container width={400}>
      <CreateOrSelectSecret {...args} />
    </Container>
  </TestWrapper>
)

Basic.args = {
  type: 'SecretText'
}
