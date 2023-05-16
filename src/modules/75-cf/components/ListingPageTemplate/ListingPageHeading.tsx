/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FC } from 'react';
import React from 'react'
import { Heading, HarnessDocTooltip } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
export interface ListingPageHeadingProps {
  tooltipId?: string
}

const ListingPageHeading: FC<ListingPageHeadingProps> = ({ tooltipId, children }) => {
  if (tooltipId) {
    return (
      <Heading level={3} font={{ variation: FontVariation.H4 }} data-tooltip-id={tooltipId}>
        {children}
        <HarnessDocTooltip tooltipId={tooltipId} useStandAlone />
      </Heading>
    )
  }

  return (
    <Heading level={3} font={{ variation: FontVariation.H4 }}>
      {children}
    </Heading>
  )
}

export default ListingPageHeading
