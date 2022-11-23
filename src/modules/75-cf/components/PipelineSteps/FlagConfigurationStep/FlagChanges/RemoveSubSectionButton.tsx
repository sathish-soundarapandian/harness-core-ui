/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, MouseEvent } from 'react'
import { Button, ButtonSize, ButtonVariation } from '@harness/uicore'

export interface RemoveSubSectionButtonProps {
  onClick: () => void
}

const RemoveSubSectionButton: FC<RemoveSubSectionButtonProps> = ({ onClick }) => (
  <Button
    minimal
    size={ButtonSize.SMALL}
    onClick={(e: MouseEvent) => {
      e.preventDefault()
      onClick()
    }}
    variation={ButtonVariation.ICON}
    icon="trash"
    data-testid="flagChanges-removeSubSection"
  />
)

export default RemoveSubSectionButton
