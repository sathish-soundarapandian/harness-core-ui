/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text, Icon } from '@harness/uicore'
import copy from 'copy-to-clipboard'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import css from './BuildTests.module.scss'

interface TestsCoverageItemProps {
  data: any
}

export function TestsCoverageItem({ data }: TestsCoverageItemProps): React.ReactElement {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()

  const copy2Clipboard = (text: string): void => {
    copy(`${text}`)
      ? showSuccess(getString('clipboardCopySuccess'))
      : showError(getString('clipboardCopyFail'), undefined, 'pipeline.copy.test.error')
  }

  return (
    <Container className={css.coverageItem} flex padding="medium">
      <Text className={css.name} font={{ weight: 'semi-bold' }} lineClamp={1} color={Color.GREY_800}>
        {data.name}
      </Text>
      <Container flex>
        {data.coverage === 'passed' ? (
          <Icon name="command-artifact-check" color={Color.GREEN_600} margin={{ right: 'large' }} />
        ) : (
          <Icon name="main-delete" color={Color.GREY_400} margin={{ right: 'large' }} />
        )}
        <Container
          className={css.commitHash}
          flex={{ justifyContent: 'flex-start' }}
          onClick={() => copy2Clipboard(data.commitId)}
        >
          <Icon size={12} name="clipboard" color={Color.GREY_500} />
          <Text inline>{data.commitId}</Text>
        </Container>
      </Container>
    </Container>
  )
}
