/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import {
  Container,
  Text,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  Button,
  SelectOption,
  Radio,
  Icon,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  PageSpinner,
  useToaster,
  ButtonVariation
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import * as Yup from 'yup'
import cx from 'classnames'
import { debounce, defaultTo } from 'lodash-es'
import type { FormikContextType } from 'formik'
import { useParams } from 'react-router-dom'
import {
  GitSyncConfig,
  GitFullSyncConfigRequestDTO,
  useGetGitFullSyncConfig,
  Failure,
  GitSyncFolderConfigDTO
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import SCMCheck from '@common/components/SCMCheck/SCMCheck'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import {
  branchFetchHandler,
  defaultInitialFormData,
  FullSyncFormProps,
  handleConfigResponse,
  initiliazeConfigForm,
  ModalConfigureProps,
  saveAndTriggerFullSync,
  getRootFolderSelectOptions
} from './FullSyncFormHelper'
import css from './FullSyncForm.module.scss'

const showSpinner = (isNewUser: boolean, loadingConfig: boolean, loadingRepos: boolean): boolean =>
  (!isNewUser && loadingConfig) || loadingRepos

const hasToFetchConfig = (projectIdentifier: string, repos: GitSyncConfig[]): boolean =>
  !!(projectIdentifier && repos?.length)

const hasToProcessConfig = (loadingConfig: boolean, repos: GitSyncConfig[]): boolean =>
  !loadingConfig && !!repos?.length

const getDefaultBranchForPR = (isNew: boolean, defaultBranch?: string): string => (isNew ? defaultBranch || '' : '')

const getBaseBranch = (gitSyncRepos: GitSyncConfig[], repoIdentifier: string): string | undefined => {
  const selectedRepo = gitSyncRepos.find((repo: GitSyncConfig) => repo.identifier === repoIdentifier)
  return selectedRepo?.branch
}

const FullSyncForm: React.FC<ModalConfigureProps & FullSyncFormProps> = props => {
  const { isNewUser = true, onClose, onSuccess } = props
  const { gitSyncRepos, loadingRepos } = useGitSyncStore()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { showSuccess, showError } = useToaster()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()

  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()
  const formikRef = useRef<FormikContextType<GitFullSyncConfigRequestDTO>>()
  const [hasSCM, setHasSCM] = React.useState<boolean>(false)
  const [rootFolderSelectOptions, setRootFolderSelectOptions] = React.useState<SelectOption[]>([])
  const [repoSelectOptions, setRepoSelectOptions] = React.useState<SelectOption[]>([])
  const [isNewBranch, setIsNewBranch] = React.useState(false)
  const [branches, setBranches] = React.useState<SelectOption[]>()
  const [createPR, setCreatePR] = useState<boolean>(false) //used for rendering PR title
  const [disableCreatePR, setDisableCreatePR] = useState<boolean>(false)
  const [disableBranchSelection, setDisableBranchSelection] = useState<boolean>(true)

  const [defaultFormData, setDefaultFormData] = useState<GitFullSyncConfigRequestDTO>({
    ...defaultInitialFormData,
    prTitle: getString('gitsync.deafaultSyncTitle')
  })

  const {
    data: configResponse,
    loading: loadingConfig,
    error: configError,
    refetch
  } = useGetGitFullSyncConfig({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })

  useEffect(() => {
    if (hasToFetchConfig(projectIdentifier, gitSyncRepos)) {
      if (isNewUser) {
        initiliazeConfigForm(undefined, gitSyncRepos, formikRef, {
          setRootFolderSelectOptions,
          setRepoSelectOptions,
          setDefaultFormData,
          fetchBranches,
          showError
        })
      } else {
        refetch() // Fetching config once context repos are available
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gitSyncRepos, projectIdentifier])

  useEffect(() => {
    if (hasToProcessConfig(loadingConfig, gitSyncRepos)) {
      handleConfigResponse(configResponse, configError?.data as Failure, gitSyncRepos, formikRef, {
        setRootFolderSelectOptions,
        setRepoSelectOptions,
        setDefaultFormData,
        fetchBranches,
        showError,
        onClose
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingConfig])

  const resetCreatePRFields = (formik: FormikContextType<GitFullSyncConfigRequestDTO>): void => {
    formik.setFieldValue('targetBranch', '')
    formik.setFieldTouched('targetBranch', false)
    formik.setFieldValue('createPullRequest', false)
    formik.setFieldTouched('createPullRequest', false)
    formikRef.current?.setFieldValue('createPullRequest', false)
    setDisableCreatePR(false)
    setCreatePR(false)
    setDisableBranchSelection(true)
  }

  const handleRepoChange = (repoIdentifier: string, formik: FormikContextType<GitFullSyncConfigRequestDTO>): void => {
    const changedRepo = gitSyncRepos.find((repo: GitSyncConfig) => repo.identifier === repoIdentifier)
    const defaultRootFolder = changedRepo?.gitSyncFolderConfigDTOs?.find(
      (folder: GitSyncFolderConfigDTO) => folder.isDefault
    )?.rootFolder
    setBranches([{ label: '', value: '' }])
    formik.setFieldValue('branch', '')
    formikRef?.current?.setFieldValue('branch', '')
    formik.setFieldTouched('branch', false)
    debounceFetchBranches(defaultTo(changedRepo?.identifier, ''))
    setRootFolderSelectOptions(getRootFolderSelectOptions(changedRepo?.gitSyncFolderConfigDTOs))
    formik.setFieldValue('rootFolder', defaultTo(defaultRootFolder, ''))
    resetCreatePRFields(formik)
  }

  const handleBranchTypeChange = (isNew: boolean, formik: FormikContextType<GitFullSyncConfigRequestDTO>): void => {
    const defaultBranch = gitSyncRepos.find(
      (repo: GitSyncConfig) => repo.identifier === formikRef.current?.values.repoIdentifier
    )?.branch
    if (isNewBranch !== isNew) {
      setIsNewBranch(isNew)

      formik.setFieldValue('branch', `${defaultBranch}-patch`)
      formik.setFieldTouched('branch', false)
    }
    formik.setFieldValue('targetBranch', getDefaultBranchForPR(isNew, defaultBranch))
    resetCreatePRFields(formik)
  }

  const fetchBranches = (repoIdentifier: string, query?: string): void => {
    const selecteddRepo = gitSyncRepos.find((repo: GitSyncConfig) => repo.identifier === repoIdentifier)
    branchFetchHandler(
      {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier,
        connectorIdentifierRef: selecteddRepo?.gitConnectorRef,
        repoURL: selecteddRepo?.repo,
        page: 0,
        size: 10,
        searchTerm: query
      },
      isNewBranch,
      configResponse?.data?.branch,
      createPR,
      { setDisableCreatePR, setDisableBranchSelection, setBranches, getString },
      modalErrorHandler,
      query
    )
  }

  const debounceFetchBranches = debounce((repoIdentifier: string, query?: string): void => {
    try {
      fetchBranches(repoIdentifier, query)
    } catch (e) {
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }, 1000)

  const CreatePR = React.useMemo(() => {
    return (
      <>
        <Layout.Horizontal flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }} padding={{ top: 'small' }}>
          <FormInput.CheckBox
            disabled={disableCreatePR}
            name="createPullRequest"
            label={getString('common.git.startPRLabel')}
            onChange={e => {
              const creatingPR = e.currentTarget.checked
              formikRef.current?.setFieldValue('createPullRequest', creatingPR)
              formikRef.current?.setFieldTouched('targetBranch', false)
              setCreatePR(creatingPR)
              setDisableBranchSelection(!creatingPR)
            }}
          />
          <FormInput.Select
            name="targetBranch"
            items={defaultTo(branches, [])}
            disabled={defaultTo(disableBranchSelection, disableCreatePR)}
            data-id="create-pr-branch-select"
            onQueryChange={(query: string) =>
              debounceFetchBranches(defaultTo(formikRef.current?.values.repoIdentifier, ''), query)
            }
            selectProps={{ usePortal: true, popoverClassName: css.gitBranchSelectorPopover }}
            className={css.branchSelector}
          />
        </Layout.Horizontal>
        {createPR ? (
          <FormInput.Text name="prTitle" className={css.prTitle} label={getString('gitsync.PRTitle')} />
        ) : null}
      </>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    disableCreatePR,
    disableBranchSelection,
    branches,
    isNewBranch,
    formikRef.current?.values,
    formikRef.current?.values.createPullRequest
  ])

  // For new user form is used in GItSync StepWizard, where using PageSpinner as overlay with step
  // For edit, form is used in modal where showing PageSpinner till data is available
  if (!isNewUser && showSpinner(isNewUser, loadingConfig, loadingRepos)) {
    return <PageSpinner />
  }

  return (
    <>
      {showSpinner(isNewUser, loadingConfig, loadingRepos) ? <PageSpinner className={css.spinner} /> : <></>}

      <Container className={cx(css.modalContainer, { [css.isModalStep]: isNewUser })}>
        <SCMCheck
          profileLinkClickHandler={onClose}
          title={getString('gitsync.fullSyncTitle')}
          validateSCM={isValid => setHasSCM(isValid)}
        />
        <ModalErrorHandler bind={setModalErrorHandler} />
        <Container className={css.modalBody}>
          <Formik<GitFullSyncConfigRequestDTO>
            initialValues={defaultFormData}
            formName="fullSyncConfigForm"
            validationSchema={Yup.object().shape({
              repoIdentifier: Yup.string().trim().required(getString('common.validation.repositoryName')),
              branch: Yup.string()
                .trim()
                .required(getString('validation.branchName'))
                .when('createPullRequest', {
                  is: true,
                  then: Yup.string().notOneOf(
                    [Yup.ref('targetBranch')],
                    getString('common.git.validation.sameBranches')
                  )
                }),
              targetBranch: Yup.string()
                .trim()
                .when('createPullRequest', {
                  is: true,
                  then: Yup.string().required(getString('common.git.validation.targetBranch'))
                }),
              prTitle: Yup.string().trim().min(1).required(getString('common.git.validation.PRTitleRequired'))
            })}
            onSubmit={formData => {
              saveAndTriggerFullSync(
                {
                  accountIdentifier: accountId,
                  orgIdentifier,
                  projectIdentifier
                },
                { ...formData, baseBranch: getBaseBranch(gitSyncRepos, formData.repoIdentifier) },
                isNewBranch,
                configResponse,
                { showSuccess, onSuccess, getString },
                modalErrorHandler
              )
            }}
          >
            {formik => {
              formikRef.current = formik
              return (
                <FormikForm>
                  <Container className={css.formBody}>
                    <FormInput.Select
                      name="repoIdentifier"
                      className={css.repoRootfolderSelect}
                      label={getString('common.git.selectRepoLabel')}
                      items={repoSelectOptions}
                      disabled={isNewUser}
                      onChange={(selected: SelectOption) => {
                        handleRepoChange(defaultTo(selected.value.toString(), ''), formik)
                      }}
                    />
                    <FormInput.Select
                      name="rootFolder"
                      className={css.repoRootfolderSelect}
                      label={getString('common.gitSync.harnessFolderLabel')}
                      items={rootFolderSelectOptions}
                      disabled={isNewUser}
                    />

                    <Text font={{ variation: FontVariation.FORM_SUB_SECTION }} margin={{ top: 'xlarge' }}>
                      {getString('gitsync.syncBranchTitle')}
                    </Text>
                    <Layout.Vertical spacing="medium" margin={{ bottom: 'medium' }}>
                      <Container className={css.branchSection}>
                        <Layout.Horizontal flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }}>
                          <Radio large onChange={() => handleBranchTypeChange(false, formik)} checked={!isNewBranch}>
                            <Icon name="git-branch-existing"></Icon>
                            <Text margin={{ left: 'small' }} inline>
                              {getString('gitsync.selectBranchTitle')}
                            </Text>
                          </Radio>
                          <FormInput.Select
                            name="branch"
                            items={defaultTo(branches, [])}
                            disabled={isNewBranch}
                            onQueryChange={(query: string) =>
                              debounceFetchBranches(formik.values.repoIdentifier, query)
                            }
                            selectProps={{ usePortal: true, popoverClassName: css.gitBranchSelectorPopover }}
                            className={css.branchSelector}
                          />
                        </Layout.Horizontal>
                        {!isNewBranch && CreatePR}
                      </Container>
                      <Container className={css.branchSection}>
                        <Radio
                          data-test="newBranchRadioBtn"
                          large
                          onChange={() => handleBranchTypeChange(true, formik)}
                          checked={isNewBranch}
                        >
                          <Icon name="git-new-branch" color={Color.GREY_700}></Icon>
                          <Text inline margin={{ left: 'small' }}>
                            {getString('gitsync.createBranchTitle')}
                          </Text>
                        </Radio>
                        {isNewBranch && (
                          <Container padding={{ top: 'small' }}>
                            <FormInput.Text
                              className={css.branchInput}
                              name="branch"
                              label={getString('common.git.branchName')}
                            />
                            {CreatePR}
                          </Container>
                        )}
                      </Container>
                    </Layout.Vertical>
                  </Container>

                  <Layout.Horizontal spacing="medium">
                    <Button
                      type="submit"
                      variation={ButtonVariation.PRIMARY}
                      text={getString('save')}
                      disabled={!hasSCM}
                    />
                    <Button
                      text={isNewUser ? getString('common.skip') : getString('cancel')}
                      variation={ButtonVariation.SECONDARY}
                      onClick={onClose}
                    />
                  </Layout.Horizontal>
                </FormikForm>
              )
            }}
          </Formik>
        </Container>
      </Container>
    </>
  )
}

export default FullSyncForm
