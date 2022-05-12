/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { FormInput } from '@harness/uicore'
import type { Segment } from 'services/cf'
import { useStrings } from 'framework/strings'

export interface CheckboxCellProps {
  row: { original: Segment }
}

const CheckboxCell: FC<CheckboxCellProps> = ({
  row: {
    original: { name, identifier }
  }
}) => {
  const { getString } = useStrings()

  return (
    <FormInput.CheckBox
      name={`targetGroups.${identifier}`}
      label=""
      aria-label={getString('cf.targetDetail.addTargetToTargetGroup', { name })}
      // pointerEvent:none allows the row to trigger the change, rather than the form input to prevent a double toggle
      style={{ margin: 0, pointerEvents: 'none' }}
    />
  )
}

export default CheckboxCell
