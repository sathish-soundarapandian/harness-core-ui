/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { Clause } from 'services/cf'
import { useOperatorsFromYaml } from '@cf/constants'

export interface FormatClauseProps {
  clause: Clause
}

const FormatClause: FC<FormatClauseProps> = ({ clause }) => {
  const [operators] = useOperatorsFromYaml()

  const operation = operators.find(({ value }) => clause.op === value)?.label || 'NO_OP'

  return (
    <Text font={{ variation: FontVariation.FORM_LABEL }} lineClamp={1}>
      <strong>{clause.attribute}</strong> {operation} <strong>{clause.values.join(', ')}</strong>
    </Text>
  )
}

export default FormatClause
