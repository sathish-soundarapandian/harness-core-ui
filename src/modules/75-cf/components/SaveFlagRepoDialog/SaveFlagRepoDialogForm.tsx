/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useState } from 'react'
import { Container, FormikForm, Formik, Button, FormInput, Layout, SelectOption } from '@harness/uicore'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import type { GitRepoRequestRequestBody } from 'services/cf'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import { DEFAULT_FLAG_GIT_REPO_PATH } from '@cf/constants'
import type { GitSyncConfig, GitSyncFolderConfigDTO } from 'services/cd-ng'
import css from './SaveFlagRepoDialog.module.scss'

export interface SaveFlagRepoDialogFormProps {
  onSubmit: (formData: GitRepoRequestRequestBody) => void
  onClose: () => void
}

const SaveFlagRepoDialogForm = ({ onSubmit, onClose }: SaveFlagRepoDialogFormProps): ReactElement => {
  const { getString } = useStrings()
  const { gitSyncRepos } = useGitSyncStore()

  const [selectedRepoIndex, setSelectedRepoIndex] = useState(0)

  const initialFormData = {
    repoIdentifier: gitSyncRepos[selectedRepoIndex]?.identifier || '',
    rootFolder: '',
    branch: gitSyncRepos[selectedRepoIndex]?.branch || '',
    filePath: DEFAULT_FLAG_GIT_REPO_PATH
  }

  const repoSelectOptions = gitSyncRepos?.map((gitRepo: GitSyncConfig) => ({
    label: gitRepo?.name || '',
    value: gitRepo?.identifier || ''
  }))

  const rootFolderSelectOptions =
    gitSyncRepos[selectedRepoIndex]?.gitSyncFolderConfigDTOs?.map((folder: GitSyncFolderConfigDTO) => ({
      label: folder.rootFolder || '',
      value: folder.rootFolder || ''
    })) || []

  const handleRepoOptionChange = (value: string): void => {
    const index = gitSyncRepos.findIndex(repo => repo.identifier === value)

    setSelectedRepoIndex(index)
  }
  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialFormData}
      formName="saveFlagRepoConfig"
      validationSchema={Yup.object().shape({
        repoIdentifier: Yup.string().trim().required(getString('common.validation.repositoryName')),
        filePath: Yup.string()
          .trim()
          .required(getString('common.git.validation.filePath'))
          .matches(new RegExp(/^[0-9a-zA-Z/_-]+\.(yaml)+$/g))
      })}
      onSubmit={formData => {
        onSubmit(formData)
      }}
    >
      {formik => {
        return (
          <FormikForm data-testid="save-flag-repo-dialog-form">
            <Container>
              <Layout.Horizontal spacing="medium" className={css.formRow}>
                <FormInput.Select
                  name="repoIdentifier"
                  label={getString('common.git.selectRepoLabel')}
                  items={repoSelectOptions}
                  onChange={(option: SelectOption) => {
                    formik.setFieldValue('repoIdentifier', option.value)
                    handleRepoOptionChange(option.value as string)
                  }}
                />
                <FormInput.Text name="branch" label={getString('common.git.branchName')} disabled />
              </Layout.Horizontal>
              <FormInput.Select
                name="rootFolder"
                label={getString('common.gitSync.harnessFolderLabel')}
                items={rootFolderSelectOptions}
              />
              <FormInput.Text name="filePath" label={getString('common.git.filePath')} disabled />
            </Container>

            <Layout.Horizontal padding={{ top: 'medium' }} spacing="medium">
              <Button type="submit" intent="primary" text={getString('save')} />
              <Button
                text={getString('cancel')}
                margin={{ left: 'medium' }}
                onClick={e => {
                  e.preventDefault()
                  onClose()
                }}
              />
            </Layout.Horizontal>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export default SaveFlagRepoDialogForm
