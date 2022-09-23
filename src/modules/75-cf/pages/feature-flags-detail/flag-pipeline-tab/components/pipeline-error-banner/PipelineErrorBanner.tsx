/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FontVariation, Color } from '@harness/design-system'
import { Container, ButtonVariation, Button, Text } from '@harness/uicore'
import React, { FC, useState } from 'react'
import { useStrings } from 'framework/strings'
import css from './PipelineErrorBanner.module.scss'

interface PipelineErrorBannerProps {
  message: string
}

const PipelineErrorBanner: FC<PipelineErrorBannerProps> = ({ message }) => {
  const { getString } = useStrings()

  const [isOpen, setIsOpen] = useState(true)

  return (
    <>
      {isOpen && (
        <Container
          className={css.banner}
          padding={{ top: 'small', right: 'xxlarge', bottom: 'small', left: 'xxlarge' }}
          flex={{ justifyContent: 'space-between' }}
          border={{ bottom: true }}
        >
          <Text font={{ variation: FontVariation.BODY2 }} icon="warning-icon" color={Color.ORANGE_900}>
            {message}
          </Text>
          <Button
            icon="cross"
            variation={ButtonVariation.ICON}
            onClick={() => setIsOpen(false)}
            data-testid="close-banner-button"
            aria-label={getString('close')}
          />
        </Container>
      )}
    </>
  )
}

export default PipelineErrorBanner
