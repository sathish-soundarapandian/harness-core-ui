/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  Button,
  Formik,
  FormikForm as Form,
  Layout,
  ModalErrorHandlerBinding,
  SelectOption,
  ModalErrorHandler,
  ButtonVariation
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { useToaster } from '@common/components'
import { usePostRoleAssignments, RoleAssignment as RBACRoleAssignment } from 'services/rbac'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getScopeBasedDefaultAssignment, isNewRoleAssignment, PrincipalType } from '@rbac/utils/utils'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getPrincipalScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import UserGroupsInput from '@common/components/UserGroupsInput/UserGroupsInput'
import { isCommunityPlan } from '@common/utils/utils'
import RoleAssignmentForm from './RoleAssignmentForm'

interface UserGroupRoleAssignmentData {
  onSubmit?: () => void
  onSuccess?: () => void
  onCancel?: () => void
}

interface FormData {
  title: string
  handleSubmit: (values: UserGroupRoleAssignmentValues) => Promise<void>
  label: string
  userGroupField?: React.ReactElement
}

export interface RoleOption extends SelectOption {
  managed: boolean
  managedRoleAssignment: boolean
  assignmentIdentifier?: string
}

export interface ResourceGroupOption extends SelectOption {
  managedRoleAssignment: boolean
  assignmentIdentifier?: string
}

export interface Assignment {
  role: RoleOption
  resourceGroup: ResourceGroupOption
}

export interface UserGroupRoleAssignmentValues {
  assignments: Assignment[]
  userGroups: string[]
}

const UserRoleAssignment: React.FC<UserGroupRoleAssignmentData> = props => {
  const { onSubmit, onSuccess, onCancel } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const scope = getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
  const { getString } = useStrings()
  const isCommunity = isCommunityPlan()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { mutate: createRoleAssignment, loading: saving } = usePostRoleAssignments({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const assignments: Assignment[] = getScopeBasedDefaultAssignment(scope, getString, isCommunity)

  const handleRoleAssignment = async (values: UserGroupRoleAssignmentValues): Promise<void> => {
    if (values.assignments.length === 0) {
      modalErrorHandler?.showDanger(getString('rbac.UserGroupRoleAssignmentForm.assignmentValidation'))
      return
    }
    const dataToSubmit: RBACRoleAssignment[] = values.assignments
      .filter(value => isNewRoleAssignment(value))
      .map(value => {
        return values.userGroups.map(usergroup => {
          return {
            resourceGroupIdentifier: value.resourceGroup.value.toString(),
            roleIdentifier: value.role.value.toString(),
            principal: {
              identifier: getIdentifierFromValue(usergroup),
              type: PrincipalType.USER_GROUP,
              scopeLevel: getPrincipalScopeFromValue(usergroup)
            }
          }
        })
      })
      .flat()

    try {
      await createRoleAssignment({ roleAssignments: dataToSubmit })
      showSuccess(getString('rbac.userGroupPage.roleAssignSuccess'))
      onSubmit?.()
    } catch (err) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(defaultTo(err?.data?.message, err?.message))
    }
  }

  const formValues: FormData = {
    title: getString('rbac.userGroupPage.assignRoles'),
    handleSubmit: handleRoleAssignment,
    label: getString('rbac.userGroupPage.assignRoles'),
    userGroupField: (
      <UserGroupsInput
        name="userGroups"
        label={getString('rbac.usersPage.userForm.userGroupLabel')}
        onlyCurrentScope={false}
      />
    )
  }

  return (
    <Formik<UserGroupRoleAssignmentValues>
      initialValues={{
        assignments: assignments,
        userGroups: []
      }}
      formName="UserGroupRoleAssignmentForm"
      validationSchema={Yup.object().shape({
        userGroups: Yup.array().min(1, getString('rbac.userGroupRequired')),
        // assignments: Yup.array().min(1, getString()),
        ...(isCommunity
          ? {}
          : {
              assignments: Yup.array().of(
                Yup.object().shape({
                  role: Yup.object().nullable().required(),
                  resourceGroup: Yup.object().nullable().required()
                })
              )
            })
      })}
      onSubmit={values => {
        modalErrorHandler?.hide()
        formValues.handleSubmit(values)
      }}
    >
      {formik => {
        return (
          <Form>
            <ModalErrorHandler bind={setModalErrorHandler} />
            {formValues.userGroupField}
            {!isCommunity && (
              <RoleAssignmentForm
                noRoleAssignmentsText={getString('rbac.usersPage.noDataText')}
                formik={formik}
                onSuccess={onSuccess}
              />
            )}
            <Layout.Horizontal spacing="small" padding={{ top: 'large' }}>
              <Button
                variation={ButtonVariation.PRIMARY}
                text={getString('common.apply')}
                type="submit"
                disabled={saving}
              />
              <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={onCancel} />
            </Layout.Horizontal>
          </Form>
        )
      }}
    </Formik>
  )
}

export default UserRoleAssignment
