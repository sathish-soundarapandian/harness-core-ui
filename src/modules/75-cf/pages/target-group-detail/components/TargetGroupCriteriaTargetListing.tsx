/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Tag, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { Target } from 'services/cf'
import { useStrings } from 'framework/strings'

import css from './TargetGroupCriteriaTargetListing.module.scss'

export interface TargetGroupCriteriaTargetListingProps {
  targets?: Target[]
}

const TargetGroupCriteriaTargetListing: FC<TargetGroupCriteriaTargetListingProps> = ({ targets = [] }) => {
  const { getString } = useStrings()

  if (!targets || targets.length < 1) {
    return <Text color={Color.GREY_400}>{getString('cf.segmentDetail.noTargetDefined')}</Text>
  }

  return (
    <ul className={css.listing}>
      {targets.map(({ name, identifier }) => (
        <li key={identifier}>
          <Tag>{name}</Tag>
        </li>
      ))}
    </ul>
  )
}

export default TargetGroupCriteriaTargetListing
