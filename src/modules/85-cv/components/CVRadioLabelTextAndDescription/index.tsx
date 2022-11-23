/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'

interface CVRadioLabelTextAndDescriptionProps {
  label: keyof StringsMap
  description: keyof StringsMap
}

const CVRadioLabelTextAndDescription: React.FC<CVRadioLabelTextAndDescriptionProps> = ({ label, description }) => {
  const { getString } = useStrings()

  return (
    <>
      <Text color={Color.GREY_700}>{getString(label)}</Text>
      <Text color={Color.GREY_350} font={{ size: 'small' }}>
        {getString(description)}
      </Text>
    </>
  )
}

export default CVRadioLabelTextAndDescription
