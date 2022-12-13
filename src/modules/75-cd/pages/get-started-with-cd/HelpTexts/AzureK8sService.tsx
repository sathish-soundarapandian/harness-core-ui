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

export const AzureK8sService = (): JSX.Element => {
  const { getString } = useStrings()
  return (
    <ol className={css.listItemCss}>
      <li>
        <Text font={{ weight: 'semi-bold' }}>{getString('cd.azureCli')}</Text>
      </li>
      <li>
        <Text className={css.listContainerCss} font={{ weight: 'semi-bold' }}>
          {getString('cd.kubectl')}
        </Text>
        <CommandWithCopyField label={'cd.azureCliCmd'} />
      </li>
      <li>
        <Text className={css.listContainerCss} font={{ weight: 'semi-bold' }}>
          {getString('cd.clusterVerify')}
        </Text>
        <CommandWithCopyField label={'cd.azureCmd'} />
        <CommandWithCopyField label={'cd.kubectlNodes'} />
      </li>
    </ol>
  )
}
