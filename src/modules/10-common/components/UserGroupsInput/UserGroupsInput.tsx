/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import cx from 'classnames'
import { connect, FormikContextType } from 'formik'
import {
  Layout,
  Container,
  Text,
  Icon,
  FormError,
  DataTooltipInterface,
  FormikTooltipContext
} from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'

import { get, isArray } from 'lodash-es'
import { FormGroup, Intent } from '@blueprintjs/core'
import type { UserGroupDTO } from 'services/cd-ng'
import { Scope } from '@common/interfaces/SecretsInterface'
import useSelectUserGroupsModal from '@common/modals/SelectUserGroups/useSelectUserGroupsModal'
import { useStrings } from 'framework/strings'
import { getReference } from '@common/utils/utils'
import { errorCheck } from '@common/utils/formikHelpers'
import type { ScopeAndIdentifier } from '@common/components/MultiSelectEntityReference/MultiSelectEntityReference'
import { getScopeFromValue, getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'
import css from './UserGroupsInput.module.scss'

export interface UserGroupsInputProps {
  name: string
  label?: string
  placeholder?: string
  onSuccess?: (userGroups: string[]) => void
  userGroupsMockData?: UserGroupDTO
}
interface MappedUserGroupData {
  name: Scope
  userGroupsCount: number
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
    onlyCurrentScope
  } = props
  const userGroupsReference: string[] = get(formik?.values, name)

  const { openSelectUserGroupsModal } = useSelectUserGroupsModal({
    onSuccess: data => {
      const scopeObjToStringArry = data.map((el: ScopeAndIdentifier) => getReference(el.scope, el.identifier) || '')
      formik.setFieldValue(name, scopeObjToStringArry)
      setUserGroupsScopeAndIndentifier(data)
      onSuccess?.(scopeObjToStringArry)
    },
    onlyCurrentScope
  })

  const [userGroupsScopeAndIndentifier, setUserGroupsScopeAndIndentifier] = useState<ScopeAndIdentifier[]>()

  useEffect(() => {
    if (isArray(userGroupsReference) && userGroupsReference.length > 0) {
      setUserGroupsScopeAndIndentifier(
        userGroupsReference
          .filter(userGroupStr => !!userGroupStr)
          .map(el => {
            return { scope: getScopeFromValue(el), identifier: getIdentifierFromValue(el) }
          })
      )
    }
  }, [userGroupsReference])

  const [mappedUserGroups, setMappedUserGroups] = useState<MappedUserGroupData[]>()
  useEffect(() => {
    if (userGroupsScopeAndIndentifier && userGroupsScopeAndIndentifier.length > 0) {
      const tempMappedUserGroups = userGroupsScopeAndIndentifier.reduce(
        (retObjArray, ele) => {
          switch (ele.scope) {
            case Scope.ORG:
              retObjArray[`${Scope.ORG}`].userGroupsCount += 1
              break
            case Scope.ACCOUNT:
              retObjArray[`${Scope.ACCOUNT}`].userGroupsCount += 1
              break
            case Scope.PROJECT:
              retObjArray[`${Scope.PROJECT}`].userGroupsCount += 1
              break
          }
          return retObjArray
        },
        {
          [`${Scope.PROJECT}`]: { name: Scope.PROJECT, userGroupsCount: 0 },
          [`${Scope.ORG}`]: { name: Scope.ORG, userGroupsCount: 0 },
          [`${Scope.ACCOUNT}`]: { name: Scope.ACCOUNT, userGroupsCount: 0 }
        }
      )

      setMappedUserGroups(Object.values(tempMappedUserGroups))
    }
  }, [userGroupsScopeAndIndentifier])
  const clearSelectedItems = () => {
    formik.setFieldValue(name, [])
    setMappedUserGroups([])
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
      <Layout.Vertical>
        {label ? (
          <Text tooltipProps={{ dataTooltipId }} font={{ variation: FontVariation.FORM_LABEL }}>
            {label}
          </Text>
        ) : null}
        <Container
          border
          padding="xsmall"
          className={cx('bp3-input', disabled ? 'bp3-disabled' : '', css.userGroupInputContainer)}
        >
          {mappedUserGroups?.length ? (
            <Layout.Horizontal
              spacing="xsmall"
              flex={{ alignItems: 'center', justifyContent: 'space-between' }}
              className={css.layoutHeight}
            >
              <Layout.Horizontal
                width={'95%'}
                spacing="xsmall"
                flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
              >
                {mappedUserGroups
                  .filter(el => el.userGroupsCount)
                  .map(scope => {
                    return (
                      <Container
                        padding={{ top: 'xsmall', right: 'small', bottom: 'xsmall', left: 'small' }}
                        width={'33%'}
                        background={Color.PRIMARY_2}
                        key={scope.name}
                        onClick={() => {
                          openSelectUserGroupsModal(userGroupsScopeAndIndentifier, scope.name)
                        }}
                        border={{ radius: 100 }}
                        className={css.pointer}
                      >
                        <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text font={{ size: 'small' }} color={Color.BLACK}>
                            {scope.name.toUpperCase()}
                          </Text>
                          <Text
                            font={{ size: 'small' }}
                            padding={{ left: 'xsmall', right: 'xsmall' }}
                            flex={{ align: 'center-center' }}
                            background={Color.PRIMARY_7}
                            color={Color.WHITE}
                            border={{ radius: 100 }}
                          >
                            {scope.userGroupsCount}
                          </Text>
                        </Layout.Horizontal>
                      </Container>
                    )
                  })}
              </Layout.Horizontal>
              <Icon
                className={css.pointer}
                margin={{ left: 'medium' }}
                name="cross"
                color={Color.GREY_500}
                size={14}
                onClick={clearSelectedItems}
              />
            </Layout.Horizontal>
          ) : (
            <Container
              className={css.pointer}
              onClick={() => {
                openSelectUserGroupsModal()
              }}
            >
              <Text
                color={Color.PRIMARY_7}
                className={css.selectBtn}
                flex={{ alignItems: 'center', justifyContent: 'flex-start', inline: false }}
                padding="xsmall"
              >
                {placeholder || getString('common.selectUserGroups')}
              </Text>
            </Container>
          )}
        </Container>
      </Layout.Vertical>
    </FormGroup>
  )
}

export default connect<Omit<FormikUserGroupsInput, 'formik'>>(UserGroupsInput)
