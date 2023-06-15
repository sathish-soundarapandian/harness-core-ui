/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color } from '@harness/design-system'
import { UserLabel } from '@common/exports'
import css from './BillingPage.module.scss'
interface UserLabelBillingProps {
  name: string
  email?: string
  address?: string
  profilePictureUrl?: string
}
export default function UserLabelBilling({ email, name, profilePictureUrl }: UserLabelBillingProps): JSX.Element {
  return (
    <>
      <UserLabel
        name={name}
        profilePictureUrl={profilePictureUrl}
        iconProps={{ size: 32 }}
        textProps={{ lineClamp: 1, width: 200, color: Color.BLACK, font: { weight: 'bold' } }}
        email={email}
        className={css.userLabel}
        showUsernameInitial={!profilePictureUrl}
      />
    </>
  )
}
