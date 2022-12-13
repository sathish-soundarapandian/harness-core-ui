/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import CommandWithCopyField from '../DelegateSelectorWizard/CommandWithCopyField'
import css from '../GetStartedWithCD.module.scss'

export const Minikube = (): JSX.Element => {
  const { getString } = useStrings()
  return (
    <ol className={css.listItemCss}>
      <li>
        <Text className={css.listContainerCss} font={{ weight: 'semi-bold' }}>
          {getString('cd.miniKube')}
        </Text>
        <CommandWithCopyField label={'cd.miniKubeCmd1'} />
        <CommandWithCopyField label={'cd.miniKubeCmd2'} />
        <CommandWithCopyField label={'cd.miniKubeCmd3'} />
      </li>
      <li>
        <Text className={css.listContainerCss} font={{ weight: 'semi-bold' }}>
          {getString('cd.clusterVerify')}
        </Text>
        <CommandWithCopyField label={'cd.miniKubeCmd4'} />
      </li>
    </ol>
  )
}
