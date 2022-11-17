/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { CardSelect, CardSelectType, Text } from '@harness/uicore'
import React from 'react'
import { FontVariation, Color } from '@harness/design-system'
import type { FilterCardProps } from './FilterCard.types'
import css from './FilterCard.module.scss'

const FilterCard: React.FC<FilterCardProps> = ({ data, cardClassName, selected, onChange }) => {
  return (
    <CardSelect
      type={CardSelectType.CardView}
      data={data}
      cardClassName={cardClassName}
      renderItem={({ title, icon, iconSize = 24, count }) => (
        <>
          <Text
            color={Color.GREY_900}
            font={{ variation: FontVariation.SMALL_SEMI }}
            rightIcon={icon}
            rightIconProps={{ color: Color.GREY_700, size: iconSize }}
            height={24}
          >
            {title}
          </Text>
          <Text color={Color.BLACK} font={{ variation: FontVariation.H2 }} className={css.lineHeight}>
            {count ?? 0}
          </Text>
        </>
      )}
      selected={selected}
      onChange={onChange}
    />
  )
}

export default FilterCard
