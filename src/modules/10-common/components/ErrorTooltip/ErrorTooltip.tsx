/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Position } from '@blueprintjs/core'
import { Popover, Layout, Text, Container, Button, ButtonVariation } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { ErrorTooltipProps } from './ErrorTooltip.types'
import css from './ErrorTooltip.module.scss'

const ErrorTooltip: React.FC<ErrorTooltipProps> = ({ children, message, onRetry, width = 250 }) => {
  const { getString } = useStrings()

  return (
    <Popover
      interactionKind="click"
      position={Position.BOTTOM_LEFT}
      content={
        <Layout.Vertical width={width} padding="medium" spacing="small">
          <Text color={Color.RED_600} font={{ variation: FontVariation.SMALL }}>
            {`${getString('common.friendlyMessage')}: ${message ?? getString('somethingWentWrong')}`}
          </Text>
          <Container>
            <Text inline color={Color.BLACK} font={{ variation: FontVariation.SMALL }}>
              {getString('common.suggestionsLabel')}
            </Text>
            <Button
              inline
              onClick={onRetry}
              text={getString('retry')}
              variation={ButtonVariation.LINK}
              className={css.buttonLink}
            />
          </Container>
        </Layout.Vertical>
      }
    >
      {children}
    </Popover>
  )
}

export default ErrorTooltip
