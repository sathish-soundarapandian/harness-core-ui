/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { Button } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import css from './NewPolicySetButton.module.scss'

export function NewPolicySetButton({ onClick }: { onClick: () => void }): JSX.Element {
  const { getString } = useStrings()

  return (
    <Button
      minimal
      icon="plus"
      className={css.newPolicySetBtn}
      text={getString('common.policiesSets.newPolicyset')}
      margin={{ bottom: 'small' }}
      onClick={onClick}
    />
  )
}
