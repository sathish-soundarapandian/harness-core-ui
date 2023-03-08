/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useEffect } from 'react'
import { RadioGroup, Radio } from '@blueprintjs/core'

import { get } from 'lodash-es'
import { ExpressionInput } from '@harness/uicore'

import { useStrings } from 'framework/strings'

import { ExpressionsListInput } from '@common/components/ExpressionsListInput/ExpressionsListInput'
import { isValueExpression } from '@common/utils/utils'

import type { Extended } from './FormMultitypeUserGroupInput'

export enum ExpressionTypes {
  'Single' = 'Single',
  'Combined' = 'Combined'
}

const UserGroupExpressionInput: React.FC<Extended> = props => {
  const { disabled, name, formik, expressions } = props
  const value = get(formik.values, name, '')
  const userGroupExpression = get(formik.values, 'userGroupExpression', '')
  const { getString } = useStrings()

  useEffect(() => {
    if (value && Array.isArray(value)) {
      formik.setFieldValue('userGroupExpression', ExpressionTypes.Single)
    } else if (isValueExpression(value)) {
      formik.setFieldValue('userGroupExpression', ExpressionTypes.Combined)
    }
  }, [])
  return (
    <>
      <RadioGroup
        name="userGroupExpression"
        inline={true}
        onChange={(event: FormEvent<HTMLInputElement>) => {
          formik.setFieldValue('userGroupExpression', event?.currentTarget?.value)
          if (event.currentTarget.checked) {
            if (event?.currentTarget?.value === ExpressionTypes.Single) {
              formik.setFieldValue(name, [])
            } else {
              formik.setFieldValue(name, '')
            }
          }
        }}
        selectedValue={formik?.values['userGroupExpression']}
      >
        <Radio label={getString('common.single')} value={ExpressionTypes.Single} />
        <Radio label={getString('common.combined')} value={ExpressionTypes.Combined} />
      </RadioGroup>

      {userGroupExpression === ExpressionTypes.Single ? (
        <ExpressionsListInput name={name} value={value} readOnly={disabled} expressions={expressions} />
      ) : (
        <div style={{ marginBottom: 15 }}>
          <ExpressionInput
            name={name}
            value={value}
            inputProps={{
              placeholder: '( <+pipeline.variables.group1> + "," + <+pipeline.variables.group2>).split(",")'
            }}
            disabled={disabled}
            items={expressions}
            onChange={val =>
              /* istanbul ignore next */
              formik?.setFieldValue(name, val)
            }
          />
        </div>
      )}
    </>
  )
}

export default UserGroupExpressionInput
