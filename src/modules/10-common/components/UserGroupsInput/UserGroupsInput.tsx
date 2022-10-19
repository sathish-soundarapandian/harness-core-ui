/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { connect, FormikContextType } from 'formik'
import { Layout, Text, FormError, DataTooltipInterface, FormikTooltipContext } from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'

import { get } from 'lodash-es'
import { FormGroup, Intent } from '@blueprintjs/core'
import type { UserGroupDTO } from 'services/cd-ng'
import useSelectUserGroupsModal from '@common/modals/SelectUserGroups/useSelectUserGroupsModal'
import { useStrings } from 'framework/strings'
import { getReference } from '@common/utils/utils'
import { errorCheck } from '@common/utils/formikHelpers'
import type { ScopeAndIdentifier } from '@common/components/MultiSelectEntityReference/MultiSelectEntityReference'
import { getScopeFromValue, getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'
import { MultiReferenceSelectPlaceholder } from '../ReferenceSelect/ReferenceSelect'

export interface UserGroupsInputProps {
  name: string
  label?: string
  placeholder?: string
  onSuccess?: (userGroups: string[]) => void
  userGroupsMockData?: UserGroupDTO
  identifierFilter?: string[]
}

export interface FormikUserGroupsInput extends UserGroupsInputProps {
  formik: FormikContextType<any>
  tooltipProps?: DataTooltipInterface
  disabled?: boolean
  formGroupClass?: string
  onlyCurrentScope?: boolean
}

const UserGroupsInput: React.FC<FormikUserGroupsInput> = props => {
  const { getString } = useStrings()
  const {
    formik,
    label,
    name,
    onSuccess,
    placeholder,
    tooltipProps,
    disabled,
    formGroupClass = '',
    onlyCurrentScope,
    identifierFilter
  } = props
  const userGroupsReference: string[] = get(formik?.values, name)

  const { openSelectUserGroupsModal } = useSelectUserGroupsModal({
    onSuccess: data => {
      const scopeObjToStringArry = data.map((el: ScopeAndIdentifier) => getReference(el.scope, el.identifier) || '')
      formik.setFieldValue(name, scopeObjToStringArry)
      onSuccess?.(scopeObjToStringArry)
    },
    onlyCurrentScope,
    identifierFilter
  })

  const userGroupsScopeAndIndentifier = useMemo(() => {
    if (!Array.isArray(userGroupsReference)) return []
    return userGroupsReference
      .filter(userGroupStr => !!userGroupStr)
      .map(el => {
        return { scope: getScopeFromValue(el), identifier: getIdentifierFromValue(el) }
      })
  }, [userGroupsReference])

  const clearSelectedItems = (): void => {
    formik.setFieldValue(name, [])
  }

  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId =
    tooltipProps?.dataTooltipId || (tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : '')

  return (
    <FormGroup
      helperText={errorCheck(name, formik) ? <FormError name={name} errorMessage={get(formik?.errors, name)} /> : null}
      intent={errorCheck(name, formik) ? Intent.DANGER : Intent.NONE}
      className={formGroupClass}
    >
      <Layout.Vertical spacing="xsmall">
        {label ? (
          <Text tooltipProps={{ dataTooltipId }} font={{ variation: FontVariation.FORM_LABEL }}>
            {label}
          </Text>
        ) : null}
        <MultiReferenceSelectPlaceholder
          selected={userGroupsScopeAndIndentifier ?? []}
          placeholder={placeholder || getString('common.selectUserGroups')}
          disabled={!!disabled}
          onClear={clearSelectedItems}
          onClick={scope => {
            if (scope) {
              openSelectUserGroupsModal(userGroupsScopeAndIndentifier, scope)
            } else {
              openSelectUserGroupsModal()
            }
          }}
        />
      </Layout.Vertical>
    </FormGroup>
  )
}

export default connect<Omit<FormikUserGroupsInput, 'formik'>>(UserGroupsInput)
