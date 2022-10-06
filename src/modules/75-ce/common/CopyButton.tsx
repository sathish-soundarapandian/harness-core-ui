/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, ButtonProps } from '@harness/uicore'
import copy from 'clipboard-copy'
import { useStrings } from 'framework/strings'

interface CopyButtonProps extends ButtonProps {
  textToCopy: string
}

const CopyButton: React.FC<CopyButtonProps> = ({ textToCopy, ...rest }) => {
  const { getString } = useStrings()
  const [openTooltip, setOpenTooltip] = useState(false)

  const showCopySuccess = () => {
    setOpenTooltip(true)
    setTimeout(
      /* istanbul ignore next */ () => {
        setOpenTooltip(false)
      },
      1000
    )
  }

  return (
    <Button
      minimal
      icon="duplicate"
      onClick={() => {
        copy(textToCopy)
        showCopySuccess()
      }}
      tooltip={getString('ce.common.copied')}
      tooltipProps={{ isOpen: openTooltip, isDark: true }}
      {...rest}
    />
  )
}

export default CopyButton
