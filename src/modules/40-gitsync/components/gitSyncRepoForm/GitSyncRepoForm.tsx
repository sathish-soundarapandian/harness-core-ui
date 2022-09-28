/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Layout,
  Button,
  Formik,
  Text,
  ModalErrorHandler,
  FormikForm,
  ModalErrorHandlerBinding,
  Container,
  Icon,
  FormInput,
  IconName,
  Card,
  SelectOption
} from '@wings-software/uicore'
import cx from 'classnames'
import * as Yup from 'yup'
import { FontVariation, Color } from '@harness/design-system'
import { noop, pick, defaultTo } from 'lodash-es'
import { useToaster, StringUtils } from '@common/exports'
import { usePostGitSync, GitSyncConfig, ConnectorInfoDTO } from 'services/cd-ng'
import { StringKeys, useStrings } from 'framework/strings'
import { Connectors } from '@connectors/constants'
import { getConnectorDisplayName, GitUrlType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import {
  ConnectorReferenceField,
  ConnectorSelectedValue
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { Scope } from '@common/interfaces/SecretsInterface'
import {
  ConnectorCardInterface,
  getCompleteGitPath,
  getHarnessFolderPathWithSuffix,
  gitCards as supportedProviders,
  getRepoUrl
} from '@gitsync/common/gitSyncUtils'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import { HARNESS_FOLDER_NAME_PLACEHOLDER, HARNESS_FOLDER_SUFFIX } from '@gitsync/common/Constants'
import { getScopeFromDTO, ScopedObjectDTO } from '@common/components/EntityReference/EntityReference'
import SCMCheck from '@common/components/SCMCheck/SCMCheck'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { StringsMap } from 'framework/strings/StringsContext'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import RepoBranchSelect from './RepoBranchSelect'
import RepoTestConnection from './RepoTestConnection'
import css from './GitSyncRepoForm.module.scss'

export interface GitSyncRepoFormProps {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  isEditMode: boolean
  isNewUser: boolean
  gitSyncRepoInfo?: GitSyncConfig
  initialData?: GitSyncFormInterface
}

interface ModalConfigureProps {
  onClose?: () => void
  onSuccess?: (data?: GitSyncConfig, formData?: GitSyncFormInterface) => void
}

export interface GitSyncFormInterface {
  gitConnectorType: GitSyncConfig['gitConnectorType']
  repo: string
  name: string
  identifier: string
  branch: string
  rootfolder: string
  gitConnector: ConnectorSelectedValue | undefined
}

const getRepoUrlForConnectorType = (formValues: GitSyncFormInterface, repoNameParam?: string): string => {
  const repoName = defaultTo(repoNameParam, formValues.repo)
  if (formValues.gitConnector?.connector?.spec?.type === GitUrlType.REPO) {
    return repoName
  }
  return getRepoUrl(formValues.gitConnector?.connector?.spec?.url, repoName)
}

const getConnectorIdentifierWithScope = (scope: Scope, identifier: string): string => {
  return scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${identifier}` : identifier
}

const getConnectorTypeIcon = (isSelected: boolean, icon: ConnectorCardInterface['icon']): IconName =>
  isSelected ? icon?.selected : icon?.default

const getSubmitButtonText = (isNewUser: boolean): StringKeys => {
  return isNewUser ? 'continue' : 'save'
}

const getSourceCodeTextColor = (isSelected: boolean): Color => {
  return isSelected ? Color.BLUE_500 : Color.GREY_500
}

const getmodalTitleId = (isNewUser: boolean): keyof StringsMap => {
  return isNewUser ? 'enableGitExperience' : 'gitsync.configureHarnessFolder'
}

export const gitSyncFormDefaultInitialData = {
  gitConnectorType: Connectors.GITHUB as GitSyncConfig['gitConnectorType'],
  repo: '',
  name: '',
  identifier: '',
  branch: '',
  rootfolder: '',
  gitConnector: undefined
}

const GitSyncRepoForm: React.FC<ModalConfigureProps & GitSyncRepoFormProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier, isNewUser, onClose } = props
  const [needSCM, setNeedSCM] = React.useState<boolean>(isNewUser)
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()
  const [connectorIdentifierRef, setConnectorIdentifierRef] = useState<string>('')
  const [repositoryURL, setRepositoryURL] = useState<string | undefined>()
  const { getRBACErrorMessage } = useRBACError()
  const { getString } = useStrings()
  const { showSuccess } = useToaster()
  const [testStatus, setTestStatus] = useState<TestStatus>(TestStatus.NOT_INITIATED)
  const modalTitle = getString(getmodalTitleId(isNewUser))

  const defaultInitialFormData: GitSyncFormInterface = defaultTo(props.initialData, gitSyncFormDefaultInitialData)

  const { mutate: createGitSyncRepo, loading: creatingGitSync } = usePostGitSync({
    queryParams: { accountIdentifier: accountId }
  })

  const [connectorType, setConnectorType] = useState(defaultInitialFormData.gitConnectorType)

  const handleGitRepoChange = (connector: ConnectorInfoDTO): void => {
    if (connector?.spec?.type === GitUrlType.REPO) {
      setConnectorIdentifierRef(getConnectorIdentifierWithScope(getScopeFromDTO(connector), connector.identifier))
      setRepositoryURL(connector?.spec?.url)
    }
  }

  const handleGitRepoNameChange = (formValues: GitSyncFormInterface): void => {
    const connectorId = formValues.gitConnector?.connector?.identifier

    if (connectorId) {
      const connectorScope = getScopeFromDTO(formValues?.gitConnector?.connector as ScopedObjectDTO)
      setConnectorIdentifierRef(getConnectorIdentifierWithScope(connectorScope, defaultTo(connectorId, '')))
    }
  }

  useEffect(() => {
    if (props.initialData?.gitConnector) {
      handleGitRepoChange(props.initialData.gitConnector.connector)
    }
  }, [props.initialData])

  const handleCreate = async (data: GitSyncConfig, formData?: GitSyncFormInterface): Promise<void> => {
    try {
      if (isNewUser) {
        props.onSuccess?.(data, formData)
        return
      }
      modalErrorHandler?.hide()
      const response = await createGitSyncRepo(data)
      showSuccess(getString('gitsync.successfullCreate', { name: data.name }))
      props.onSuccess?.(response, formData)
    } catch (e) {
      modalErrorHandler?.showDanger(getRBACErrorMessage(e))
    }
  }

  return (
    <Container height={'inherit'} className={css.modalContainer} margin="large">
      {isNewUser ? (
        <GitSyncStoreProvider>
          <SCMCheck profileLinkClickHandler={onClose} title={modalTitle} validateSCM={hasSCM => setNeedSCM(!hasSCM)} />
        </GitSyncStoreProvider>
      ) : (
        <Text font={{ variation: FontVariation.H3 }} color={Color.BLACK}>
          {modalTitle}
        </Text>
      )}
      <ModalErrorHandler bind={setModalErrorHandler} />

      <Layout.Horizontal>
        <Container width={'60%'}>
          <Formik<GitSyncFormInterface>
            initialValues={defaultInitialFormData}
            formName="gitSyncRepoForm"
            validationSchema={Yup.object().shape({
              name: Yup.string().trim().required(getString('validation.nameRequired')),
              identifier: Yup.string().when('name', {
                is: val => val?.length,
                then: Yup.string()
                  .trim()
                  .required(getString('validation.identifierRequired'))
                  .matches(StringUtils.regexIdentifier, getString('validation.validIdRegex'))
                  .notOneOf(StringUtils.illegalIdentifiers)
              }),
              repo: Yup.string().trim().required(getString('common.validation.repositoryName')),
              branch: Yup.string().trim().required(getString('validation.branchName')),
              rootfolder: Yup.string()
                .trim()
                .matches(
                  StringUtils.HarnessFolderName,
                  getString('common.validation.harnessFolderNamePatternIsNotValid')
                )
            })}
            onSubmit={formData => {
              const gitSyncRepoData = {
                ...pick(formData, ['gitConnectorType', 'branch', 'name', 'identifier']),
                repo: getRepoUrlForConnectorType(formData),
                gitConnectorRef: (formData.gitConnector as ConnectorSelectedValue)?.value,
                gitSyncFolderConfigDTOs: [
                  {
                    rootFolder: getHarnessFolderPathWithSuffix(formData.rootfolder.trim(), HARNESS_FOLDER_SUFFIX),
                    isDefault: true
                  }
                ],
                projectIdentifier: projectIdentifier,
                orgIdentifier: orgIdentifier
              }
              // handleUpdate(data, formData) Edit of gitSync is not supported now
              handleCreate(gitSyncRepoData, formData)
            }}
          >
            {({ values: formValues, setFieldValue }) => (
              <FormikForm>
                <Container className={css.formBody}>
                  <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
                    <Icon name="git-configure" size={18} />
                    <Text
                      font={{ size: 'medium', weight: 'semi-bold' }}
                      margin={{ top: 'large', bottom: 'large' }}
                      color={Color.BLACK}
                    >
                      {getString('selectGitProvider')}
                    </Text>
                  </Layout.Horizontal>
                  <Layout.Horizontal margin={{ bottom: 'medium', left: 'xlarge' }}>
                    {supportedProviders.map((cardData: ConnectorCardInterface) => {
                      const isSelected = cardData.type === formValues.gitConnectorType
                      return (
                        <Layout.Vertical key={cardData.type} className={css.cardWrapper}>
                          <Card
                            data-testid={`${cardData.type}-card`}
                            onMouseOver={noop}
                            interactive
                            className={cx(css.card, {
                              [css.selectedCard]: isSelected
                            })}
                            onClick={e => {
                              //Resetting all repo related field when user click different repo provider
                              if (cardData.type !== connectorType) {
                                e.stopPropagation()
                                setFieldValue('gitConnectorType', cardData.type)
                                setFieldValue('gitConnector', '')
                                setFieldValue('repo', '')
                                setFieldValue('branch', '')
                                setConnectorType(cardData.type as GitSyncConfig['gitConnectorType'])
                                setConnectorIdentifierRef('')
                                setRepositoryURL('')
                              }
                            }}
                          >
                            <Icon
                              margin="large"
                              className={css.connectorTypeIcon}
                              inline={false}
                              name={getConnectorTypeIcon(isSelected, cardData.icon)}
                              size={40}
                            />
                          </Card>

                          <Text inline={false} color={getSourceCodeTextColor(isSelected)}>
                            {getConnectorDisplayName(cardData.type)}
                          </Text>
                        </Layout.Vertical>
                      )
                    })}
                  </Layout.Horizontal>
                  <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
                    <Icon name="folder-upload" size={18} />
                    <Text
                      font={{ size: 'medium', weight: 'semi-bold' }}
                      margin={{ top: 'large', bottom: 'large' }}
                      color={Color.BLACK}
                    >
                      {getString('gitsync.folderDetails')}
                    </Text>
                  </Layout.Horizontal>
                  <Layout.Vertical padding={{ left: 'xlarge' }}>
                    <Container className={css.formElm}>
                      <NameId
                        identifierProps={{ inputName: 'name' }}
                        nameLabel={getString('common.git.selectRepoLabel')}
                      />
                    </Container>
                    <ConnectorReferenceField
                      name="gitConnector"
                      width={350}
                      type={connectorType}
                      selected={formValues.gitConnector}
                      label={getString('selectGitConnectorTypeLabel', {
                        type: getConnectorDisplayName(connectorType)
                      })}
                      placeholder={getString('select')}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      onChange={(value, scope) => {
                        modalErrorHandler?.hide()
                        setFieldValue('gitConnector', {
                          label: defaultTo(value.name, ''),
                          value: getConnectorIdentifierWithScope(scope, value?.identifier),
                          scope: scope,
                          live: value?.status?.status === 'SUCCESS',
                          connector: value
                        })

                        let repoValue = ''
                        if (value?.spec?.type === GitUrlType.REPO) {
                          repoValue = value?.spec?.url
                          setConnectorIdentifierRef(
                            getConnectorIdentifierWithScope(getScopeFromDTO(value), value.identifier)
                          )
                          setRepositoryURL(repoValue)
                        }
                        setFieldValue('repo', repoValue)
                        setTestStatus(TestStatus.NOT_INITIATED)
                      }}
                    />
                    <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="medium">
                      <Layout.Vertical>
                        <FormInput.Text
                          className={cx({
                            [css.noSpacing]: formValues.gitConnector?.connector?.spec?.type !== GitUrlType.REPO
                          })}
                          name="repo"
                          inputGroup={{
                            onBlur: e => {
                              handleGitRepoNameChange(formValues)
                              setRepositoryURL(
                                getRepoUrlForConnectorType(formValues, (e.target as HTMLInputElement)?.value)
                              )

                              setTestStatus(TestStatus.NOT_INITIATED)
                            }
                          }}
                          label={getString('common.repositoryName')}
                          disabled={formValues.gitConnector?.connector?.spec?.type === GitUrlType.REPO}
                        />
                        {formValues.gitConnector?.connector?.spec?.type !== GitUrlType.REPO ? (
                          <Text
                            padding={{ top: 'xsmall', bottom: 'medium' }}
                            color={Color.GREY_250}
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={getRepoUrlForConnectorType(formValues)}
                          >
                            {getRepoUrlForConnectorType(formValues)}
                          </Text>
                        ) : null}
                      </Layout.Vertical>
                      <RepoTestConnection
                        gitConnector={formValues.gitConnector}
                        repoURL={getRepoUrlForConnectorType(formValues)}
                        onTestStatusChange={status => setTestStatus(status)}
                        modalErrorHandler={modalErrorHandler}
                      />
                    </Layout.Horizontal>
                    <FormInput.Text
                      className={cx(css.placeholder, { [css.noSpacing]: formValues.rootfolder })}
                      name="rootfolder"
                      label={getString('gitsync.selectHarnessFolder')}
                      placeholder={HARNESS_FOLDER_NAME_PLACEHOLDER}
                    />
                    <Text
                      padding={{ top: 'xsmall', bottom: 'medium' }}
                      color={Color.GREY_250}
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={getCompleteGitPath(
                        getRepoUrlForConnectorType(formValues),
                        formValues.rootfolder,
                        HARNESS_FOLDER_SUFFIX
                      )}
                    >
                      {getCompleteGitPath(
                        getRepoUrlForConnectorType(formValues),
                        formValues.rootfolder,
                        HARNESS_FOLDER_SUFFIX
                      )}
                    </Text>
                    <RepoBranchSelect
                      key={repositoryURL} // Branch select must be reset if repositoryURL changes
                      connectorIdentifierRef={connectorIdentifierRef}
                      repoURL={repositoryURL}
                      modalErrorHandler={modalErrorHandler}
                      onChange={(selected: SelectOption, options?: SelectOption[]) => {
                        if (!options?.find(branch => branch.value === selected.value)) {
                          setFieldValue?.('branch', '')
                        }
                      }}
                      selectedValue={formValues.branch}
                    />
                  </Layout.Vertical>
                </Container>

                <Layout.Horizontal padding={{ top: 'small', left: 'xlarge' }} spacing="medium">
                  <Button
                    className={css.formButton}
                    type="submit"
                    intent="primary"
                    text={getString(getSubmitButtonText(isNewUser))}
                    disabled={
                      needSCM ||
                      creatingGitSync ||
                      testStatus === TestStatus.IN_PROGRESS ||
                      testStatus === TestStatus.FAILED
                    }
                  />
                  <Button
                    className={css.formButton}
                    text={getString('cancel')}
                    margin={{ left: 'medium' }}
                    onClick={onClose}
                  />
                </Layout.Horizontal>
              </FormikForm>
            )}
          </Formik>
        </Container>
        <Container width={'40%'}>
          <Layout.Vertical background={Color.GREY_100} padding="xxlarge" className={css.helpText}>
            <Layout.Horizontal padding={{ bottom: 'xxxlarge' }}>
              <Icon size={28} name="help"></Icon>
              <Container>
                <Text
                  margin={{ bottom: 'small' }}
                  font={{ size: 'medium', weight: 'semi-bold' }}
                  color={Color.GREY_700}
                >
                  {getString('gitsync.harnessFolderHeader')}
                </Text>
                <Text> {getString('gitsync.harnessFolderText')}</Text>
              </Container>
            </Layout.Horizontal>
            <Layout.Horizontal>
              <Icon size={28} name="help"></Icon>
              <Container>
                <Text
                  margin={{ bottom: 'small' }}
                  font={{ size: 'medium', weight: 'semi-bold' }}
                  color={Color.GREY_700}
                >
                  {getString('connecectorHelpHeader')}
                </Text>
                <Text> {getString('connecectorHelpText')}</Text>
              </Container>
            </Layout.Horizontal>
          </Layout.Vertical>
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}

export default GitSyncRepoForm
