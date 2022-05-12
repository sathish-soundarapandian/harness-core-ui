/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Card, Container, FontVariation, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ChangesTableContentWrapper } from './ChangesTable.types'
import css from './ChangeTable.module.scss'

const ChangesTableWrapper: React.FC<ChangesTableContentWrapper> = ({
  children,
  isCardView,
  dataTooltipId,
  totalItems
}) => {
  const { getString } = useStrings()
  const ChildContainer = isCardView ? Card : Container

  return (
    <Container>
      {isCardView && (
        <Text font={{ variation: FontVariation.H6 }} padding={{ bottom: 'medium' }} tooltipProps={{ dataTooltipId }}>
          {getString('changes')}({totalItems})
        </Text>
      )}
      <ChildContainer className={cx(css.childContainer, { [css.cardContainer]: isCardView })}>
        {children}
      </ChildContainer>
    </Container>
  )
}

export default ChangesTableWrapper
