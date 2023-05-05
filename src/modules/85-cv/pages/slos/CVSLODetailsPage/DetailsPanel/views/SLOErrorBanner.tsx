/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { SLOError } from 'services/cv'

const SLOErrorBanner = ({ sloError }: { sloError?: SLOError }) => {
  const { getString } = useStrings()
  return (
    <Text
      color={Color.BLACK}
      background={Color.YELLOW_100}
      font={{ variation: FontVariation.FORM_MESSAGE_WARNING }}
      padding={{ right: 'xlarge', left: 'xlarge', top: 'medium', bottom: 'medium' }}
    >
      {sloError?.errorMessage ?? getString('cv.slos.sloErrorBanner')}
    </Text>
  )
}

export default SLOErrorBanner
