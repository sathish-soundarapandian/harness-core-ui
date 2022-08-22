/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'

import { FormInput } from '@harness/uicore'
import { mockOperators } from '../Triggers/utils'

import css from './AddConditions.module.scss'

interface AddConditionRowInterface {
  fieldId: string
  index: number
  attributePlaceholder: string
  operatorPlaceholder: string
  valuePlaceholder: string
}

const AddConditionRow: React.FC<AddConditionRowInterface> = ({
  fieldId,
  index,
  attributePlaceholder,
  operatorPlaceholder,
  valuePlaceholder
}) => (
  <div className={cx(css.conditionsRow)}>
    <FormInput.Text
      className={css.textContainer}
      placeholder={attributePlaceholder}
      name={`${fieldId}.${[index]}.key`}
      label=""
    />
    <FormInput.Select
      className={css.operatorContainer}
      placeholder={operatorPlaceholder}
      items={mockOperators}
      name={`${fieldId}.${[index]}.operator`}
      label=""
    />
    <FormInput.Text
      className={css.textContainer}
      name={`${fieldId}.${[index]}.value`}
      label=""
      placeholder={valuePlaceholder}
    />
  </div>
)

export default AddConditionRow
