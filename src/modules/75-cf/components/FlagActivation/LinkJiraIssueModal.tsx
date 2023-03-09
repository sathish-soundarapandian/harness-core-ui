/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useCallback, useMemo, useState } from 'react'
import {
  Button,
  ButtonVariation,
  Layout,
  ModalDialog,
  SelectOption,
  ButtonSize,
  FormInput,
  Formik,
  FormikForm,
  useToaster
} from '@harness/uicore'

import { useParams } from 'react-router-dom'
import * as yup from 'yup'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { useGetJiraIssues, usePatchFeature } from 'services/cf'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import patch from '../../utils/instructions'

export interface LinkJiraIssueModalProps {
  featureIdentifier: string
  refetchFlag: () => void
}

const LinkJiraIssueModal: FC<LinkJiraIssueModalProps> = ({ featureIdentifier, refetchFlag }) => {
  const { showError, showSuccess } = useToaster()

  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { getString } = useStrings()
  const { activeEnvironment } = useActiveEnvironment()

  const [isModalDisplayed, setIsModelDisplayed] = useState<boolean>(false)
  const hideModal = useCallback(() => setIsModelDisplayed(false), [])
  const openModal = useCallback(() => setIsModelDisplayed(true), [])

  const queryParams = {
    projectIdentifier,
    environmentIdentifier: activeEnvironment,
    accountIdentifier,
    orgIdentifier
  }

  const { mutate, loading: patchLoading } = usePatchFeature({
    identifier: featureIdentifier,
    queryParams
  })

  const {
    data,
    loading: jiraIssuesLoading,
    refetch
  } = useGetJiraIssues({
    lazy: true,
    debounce: 700
  })

  const jiraItems = useMemo<SelectOption[]>(() => {
    if (data?.issues?.length) {
      return data.issues.map(issue => ({ label: issue.key as string, value: issue.key as string }))
    }
    return []
  }, [data?.issues])

  const handleSubmit = (jiraIssueKey: string): void => {
    patch.feature.addInstruction({
      kind: 'addJiraIssueToFlag',
      parameters: {
        issueKey: jiraIssueKey as string
      }
    })

    patch.feature.onPatchAvailable(async instructions => {
      try {
        await mutate(instructions)
        hideModal()
        refetchFlag()
        showSuccess(getString('cf.featureFlags.jira.successMessage'))
      } catch (e) {
        showError(getErrorMessage(e), undefined, 'cf.featureFlags.jira.errorMessage')
      } finally {
        patch.feature.reset
      }
    })
  }

  return (
    <>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
        <RbacButton
          data-testid="add-jira-issue-modal"
          minimal
          icon="small-plus"
          size={ButtonSize.SMALL}
          font={{ size: 'small' }}
          style={{ padding: 0 }}
          text={getString('cf.featureFlags.jira.newJiraIssueButton')}
          onClick={() => openModal()}
          permission={{
            resource: { resourceType: ResourceType.FEATUREFLAG },
            permission: PermissionIdentifier.EDIT_FF_FEATUREFLAG
          }}
          featuresProps={{
            featuresRequest: {
              featureNames: [FeatureIdentifier.MAUS]
            }
          }}
        />
      </Layout.Horizontal>

      <Formik
        initialValues={{
          selectedJiraIssueKey: ''
        }}
        formName="addJiraIssueDialog"
        enableReinitialize={true}
        validateOnChange
        validateOnBlur
        validationSchema={yup.object().shape({
          selectedJiraIssueKey: yup.string().trim().required(getString('cf.featureFlags.jira.jiraIssueRequiredError'))
        })}
        onSubmit={formData => {
          handleSubmit(formData.selectedJiraIssueKey)
        }}
      >
        {formikProps => (
          <FormikForm>
            <ModalDialog
              isOpen={isModalDisplayed}
              enforceFocus={false}
              onClose={hideModal}
              title={getString('cf.featureFlags.jira.jiraModalTitle')}
              height={270}
              footer={
                <Layout.Horizontal spacing="small">
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    disabled={patchLoading || jiraIssuesLoading}
                    text={getString('add')}
                    intent="primary"
                    onClick={() => formikProps.submitForm()}
                  />
                  <Button
                    variation={ButtonVariation.TERTIARY}
                    disabled={patchLoading || jiraIssuesLoading}
                    text={getString('cancel')}
                    onClick={hideModal}
                  />
                </Layout.Horizontal>
              }
            >
              <FormInput.Select
                label={getString('cf.featureFlags.jira.inputLabel')}
                name="selectedJiraIssueKey"
                items={jiraItems}
                placeholder={getString('cf.featureFlags.jira.inputPlaceholder')}
                selectProps={{
                  loadingItems: jiraIssuesLoading
                }}
                onQueryChange={async name => {
                  if (name) {
                    await refetch({ queryParams: { ...queryParams, searchTerm: name } })
                  }
                }}
              />
            </ModalDialog>
          </FormikForm>
        )}
      </Formik>
    </>
  )
}

export default LinkJiraIssueModal
