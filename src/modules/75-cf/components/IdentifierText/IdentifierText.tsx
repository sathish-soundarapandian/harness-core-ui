/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, Icon, Layout, Text, useToaster, Utils } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './IdentifierText.module.scss'

export interface IdentifierTextProps {
  identifier?: string
  allowCopy?: boolean
  hideLabel?: boolean
}

export const IdentifierText: React.FC<IdentifierTextProps> = ({ identifier, allowCopy = false, hideLabel = false }) => {
  const { getString } = useStrings()
  const { showSuccess, clear } = useToaster()

  return (
    <Layout.Horizontal
      className={css.containerBorder}
      background={Color.PRIMARY_1}
      padding={{ top: 'xsmall', right: 'small', bottom: 'xsmall', left: 'small' }}
      spacing="xsmall"
    >
      {!hideLabel && (
        <Text inline font={{ variation: FontVariation.SMALL }}>
          {getString('idLabel')}
        </Text>
      )}
      <Text inline font={{ variation: FontVariation.SMALL }} lineClamp={1}>
        {identifier}
      </Text>
      {allowCopy && (
        <Button
          noStyling
          className={css.copyButton}
          title={getString('clickToCopy')}
          onClick={() =>
            Utils.copy(identifier as string).then(() => {
              clear()
              showSuccess(getString('copiedToClipboard'))
            })
          }
        >
          <Icon name="duplicate" size={12} color={Color.GREY_350} />
        </Button>
      )}
    </Layout.Horizontal>
  )
}
