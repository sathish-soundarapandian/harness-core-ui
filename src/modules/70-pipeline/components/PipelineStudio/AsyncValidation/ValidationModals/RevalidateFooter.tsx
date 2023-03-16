/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from '../ValidationBadge.module.scss'

interface RevalidateFooterProps {
  onClose: () => void
  onRevalidate: () => Promise<void>
}

export function RevalidateFooter({ onClose, onRevalidate }: RevalidateFooterProps): JSX.Element {
  const { getString } = useStrings()

  return (
    <div className={css.revalidateFooter}>
      <Button
        text={getString('pipeline.validation.revalidate')}
        onClick={onRevalidate}
        variation={ButtonVariation.SECONDARY}
      />
      <Button onClick={onClose} text={getString('close')} variation={ButtonVariation.TERTIARY} />
    </div>
  )
}
