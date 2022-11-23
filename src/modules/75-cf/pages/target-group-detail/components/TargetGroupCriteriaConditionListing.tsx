/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { Clause } from 'services/cf'
import FormatClause from '@cf/components/FormatClause/FormatClause'

import css from './TargetGroupCriteriaConditionListing.module.scss'

export interface TargetGroupCriteriaConditionListingProps {
  rules?: Clause[]
}

const TargetGroupCriteriaConditionListing: FC<TargetGroupCriteriaConditionListingProps> = ({ rules = [] }) => {
  const { getString } = useStrings()

  if (!rules || rules.length < 1) {
    return <Text color={Color.GREY_400}>{getString('cf.segmentDetail.noConditionDefined')}</Text>
  }

  return (
    <ul className={css.listing}>
      {rules.map(clause => (
        <li key={clause.id}>
          <FormatClause clause={clause} />
        </li>
      ))}
    </ul>
  )
}

export default TargetGroupCriteriaConditionListing
