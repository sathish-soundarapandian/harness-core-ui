/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import UserGroupsInput, { FormikUserGroupsInput } from '@common/components/UserGroupsInput/UserGroupsInput'
import { useStrings } from 'framework/strings'
import { ConfigureOptions, ConfigureOptionsProps } from '../ConfigureOptions'

interface UserGroupConfigureOptionsProps extends ConfigureOptionsProps {
  userGroupsInputProps: Partial<Omit<FormikUserGroupsInput, 'formik'>>
}

export const UserGroupConfigureOptions: FC<UserGroupConfigureOptionsProps> = props => {
  const { userGroupsInputProps, ...configureOptionsProps } = props
  const { getString } = useStrings()

  const renderUserGroupAllowedValuesField: ConfigureOptionsProps['getAllowedValuesCustomComponent'] = () => {
    return <UserGroupsInput {...userGroupsInputProps} name="allowedValues" label={getString('allowedValues')} />
  }

  return (
    <ConfigureOptions {...configureOptionsProps} getAllowedValuesCustomComponent={renderUserGroupAllowedValuesField} />
  )
}
