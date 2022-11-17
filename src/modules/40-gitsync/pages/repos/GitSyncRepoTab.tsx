/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import {
  Button,
  Layout,
  Text,
  Container,
  Icon,
  Formik,
  FormikForm,
  FormInput,
  Popover,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  Tag,
  useToaster,
  TableV2,
  Utils
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import cx from 'classnames'
import { Color } from '@harness/design-system'
import type { CellProps, Renderer, Column } from 'react-table'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { pick, capitalize, defaultTo } from 'lodash-es'
import { Menu, Classes, Position, Dialog } from '@blueprintjs/core'
import {
  GitSyncConfig,
  GitSyncFolderConfigDTO,
  ResponseConnectorValidationResult,
  useGetTestGitRepoConnectionResult,
  usePutGitSync
} from 'services/cd-ng'
import useCreateGitSyncModal from '@gitsync/modals/useCreateGitSyncModal'
import { useStrings } from 'framework/strings'
import {
  getCompleteGitPath,
  getGitConnectorIcon,
  getRepoPath,
  getHarnessFolderPathWithSuffix,
  getExternalUrl
} from '@gitsync/common/gitSyncUtils'
import { useGitSyncStore } from 'framework/GitRepoStore/GitSyncStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { HARNESS_FOLDER_NAME_PLACEHOLDER, HARNESS_FOLDER_SUFFIX } from '@gitsync/common/Constants'
import { TestConnectionWidget, TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import CopyToClipboard from '@common/components/CopyToClipBoard/CopyToClipBoard'
import { StringUtils } from '@common/exports'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import css from './GitSyncRepoTab.module.scss'

enum RepoState {
  VIEW = 'VIEW',
  ADD = 'ADD',
  EDIT = 'EDIT'
}

interface RightMenuProps {
  repo: GitSyncConfig
  selectedFolderIndex: number
  handleRepoUpdate: (updatedFolders: GitSyncFolderConfigDTO[]) => unknown
  isDefault?: boolean
}

const RightMenu: React.FC<RightMenuProps> = props => {
  const { repo, selectedFolderIndex, handleRepoUpdate, isDefault } = props
  const [menuOpen, setMenuOpen] = useState(false)
  const { getString } = useStrings()

  const handleMarkAsDefaultFolder = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    if (repo?.gitSyncFolderConfigDTOs) {
      const folders = repo.gitSyncFolderConfigDTOs.map((oldFolder: GitSyncFolderConfigDTO, index: number) => {
        oldFolder.isDefault = selectedFolderIndex === index
        return oldFolder
      })
      handleRepoUpdate(folders)
    }
  }

  return (
    <Layout.Horizontal>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.RIGHT_TOP}
      >
        <Button
          minimal
          icon="Options"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu style={{ minWidth: 'unset' }}>
          <Menu.Item
            data-test="markDefaultBtn"
            text={getString('gitsync.markAsDefault')}
            onClick={handleMarkAsDefaultFolder}
            disabled={isDefault}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const GitSyncRepoTab: React.FC = () => {
  const { gitSyncRepos, refreshStore } = useGitSyncStore()
  const { connectivityMode } = useAppStore()

  const { openGitSyncModal } = useCreateGitSyncModal({
    onSuccess: async () => {
      refreshStore()
    },
    onClose: async () => {
      refreshStore()
    }
  })

  const RenderColumnReponame: Renderer<CellProps<GitSyncConfig>> = ({ row }) => {
    const data = row.original

    return (
      <Layout.Horizontal spacing="small">
        <Icon name={getGitConnectorIcon(data.gitConnectorType)} size={30}></Icon>
        <div className={css.wrapper}>
          <Text className={css.name} color={Color.BLACK} title={data.name}>
            {data.name}
          </Text>
          <Text className={css.name} color={Color.GREY_400} title={data.identifier}>
            {data.identifier}
          </Text>
        </div>
      </Layout.Horizontal>
    )
  }

  const RenderColumnRepo: Renderer<CellProps<GitSyncConfig>> = ({ row }) => {
    const repoPath = row.original.repo
    return (
      <div className={css.wrapper}>
        <Utils.WrapOptionalTooltip
          tooltip={repoPath}
          tooltipProps={{
            isDark: true,
            fill: true,
            position: 'bottom'
          }}
        >
          <Text className={cx(css.name, css.repoPath, css.pathFont)} color={Color.BLACK}>
            {repoPath}
          </Text>
        </Utils.WrapOptionalTooltip>
      </div>
    )
  }

  const RenderColumnBranch: Renderer<CellProps<GitSyncConfig>> = ({ row }) => {
    const data = row.original
    return (
      <div className={css.wrapper}>
        <Text className={cx(css.name, css.pathFont)} color={Color.BLACK}>
          {data.branch}
        </Text>
      </div>
    )
  }

  const RenderColumnRootFolder: Renderer<CellProps<GitSyncConfig>> = ({ row }) => {
    const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
    const { showSuccess, showError } = useToaster()
    const { getRBACErrorMessage } = useRBACError()
    const [repoState, setRepoState] = React.useState<RepoState>(RepoState.VIEW)
    const [repoData, setRepoData] = React.useState<GitSyncConfig>(row.original)
    const { mutate: updateGitSyncRepo, loading } = usePutGitSync({
      queryParams: { accountIdentifier: accountId }
    })
    const [testStatus, setTestStatus] = useState<TestStatus>(TestStatus.NOT_INITIATED)
    const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

    const handleRepoUpdate = async (
      updatedFolders: GitSyncFolderConfigDTO[],
      whileAddingNewFolder = false
    ): Promise<void> => {
      try {
        modalErrorHandler?.hide()
        const payload = {
          ...pick(repoData, [
            'gitConnectorType',
            'repo',
            'branch',
            'name',
            'identifier',
            'gitConnectorType',
            'gitConnectorRef',
            'projectIdentifier',
            'orgIdentifier'
          ]),
          gitSyncFolderConfigDTOs: updatedFolders
        }
        const response = await updateGitSyncRepo(payload)
        // message is explicit because only rootFolder can be changed
        showSuccess(getString('gitsync.rootFolderUpdatedSuccessfully', { name: payload.name }))
        setRepoData(response)
        setRepoState(RepoState.VIEW)
        hideModal()
      } catch (e) {
        if (whileAddingNewFolder) {
          modalErrorHandler?.showDanger(getRBACErrorMessage(e))
        } else {
          showError(getRBACErrorMessage(e))
        }
      }
    }

    const { mutate: testRepo, loading: testing } = useGetTestGitRepoConnectionResult({
      identifier: '',
      pathParams: {
        identifier: ''
      },
      queryParams: {
        repoURL: ''
      }
    })

    const testConnection = async (identifier: string, scope: Scope, repoURL: string): Promise<void> => {
      const scopeQueryParams = {
        accountIdentifier: accountId,
        ...(scope !== Scope.ACCOUNT ? { orgIdentifier } : {}),
        ...(scope === Scope.PROJECT ? { projectIdentifier } : {})
      }
      setTestStatus(TestStatus.IN_PROGRESS)
      testRepo(undefined, {
        pathParams: {
          identifier
        },
        queryParams: {
          ...scopeQueryParams,
          repoURL
        }
      })
        .then((response: ResponseConnectorValidationResult) => {
          if (response?.data?.status !== 'SUCCESS') {
            setTestStatus(TestStatus.FAILED)
          } else {
            setTestStatus(TestStatus.SUCCESS)
          }
        })
        .catch(_e => {
          setTestStatus(TestStatus.FAILED)
        })
    }

    const [showModal, hideModal] = useModalHook(() => {
      return (
        <Dialog
          isOpen={true}
          enforceFocus={false}
          onClose={() => {
            hideModal()
            setRepoState(RepoState.VIEW)
            setTestStatus(TestStatus.NOT_INITIATED)
          }}
          title={
            <Text padding={{ bottom: 'small' }} margin={{ left: 'medium' }} font={{ weight: 'bold' }}>
              {getString('gitsync.addNewHarnessFolderLabel')}
            </Text>
          }
          style={{
            width: 700
          }}
        >
          <ModalErrorHandler bind={setModalErrorHandler} />
          <Container
            margin={{ left: 'xxlarge', right: 'xxlarge' }}
            border={{ top: true, color: Color.GREY_250 }}
            padding={{ top: 'xlarge' }}
          >
            <Formik
              initialValues={{ rootFolder: '', isDefault: false, repo: repoData.repo || '' }}
              validationSchema={Yup.object().shape({
                rootFolder: Yup.string()
                  .trim()
                  .matches(
                    StringUtils.HarnessFolderName,
                    getString('common.validation.harnessFolderNamePatternIsNotValid')
                  )
              })}
              formName="gitSyncRepoTab"
              onSubmit={formData => {
                if (repoData?.gitSyncFolderConfigDTOs?.length) {
                  const folders = formData.isDefault
                    ? repoData?.gitSyncFolderConfigDTOs?.map((oldFolder: GitSyncFolderConfigDTO) => {
                        oldFolder.isDefault = false
                        return oldFolder
                      })
                    : repoData?.gitSyncFolderConfigDTOs?.slice()

                  folders?.push({
                    rootFolder: getHarnessFolderPathWithSuffix(formData.rootFolder.trim(), HARNESS_FOLDER_SUFFIX),
                    isDefault: formData.isDefault
                  })
                  handleRepoUpdate(folders, true)
                }
              }}
            >
              {({ values: formValues }) => (
                <FormikForm>
                  <Layout.Vertical border={{ bottom: true, color: Color.GREY_250 }} margin={{ bottom: 'medium' }}>
                    <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="large">
                      <Layout.Vertical width="70%">
                        <FormInput.Text
                          className={cx(css.inputFields, { [css.noSpacing]: formValues.repo })}
                          name="repo"
                          label={getString('repositoryUrlLabel')}
                          disabled={!!formValues.repo}
                        />
                        {formValues.repo ? (
                          <Text
                            font={{ size: 'small' }}
                            padding={{ top: 'xsmall', bottom: 'large' }}
                            color={Color.GREY_250}
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={getRepoPath({
                              repo: formValues.repo,
                              gitConnectorType: repoData.gitConnectorType
                            })}
                          >
                            {getRepoPath({
                              repo: formValues.repo,
                              gitConnectorType: repoData.gitConnectorType
                            })}
                          </Text>
                        ) : null}
                      </Layout.Vertical>
                      {formValues.repo ? (
                        <Container padding={{ bottom: 'medium' }}>
                          <TestConnectionWidget
                            testStatus={testStatus}
                            onTest={() =>
                              testConnection(
                                getIdentifierFromValue(defaultTo(repoData?.gitConnectorRef, '')),
                                getScopeFromValue(defaultTo(repoData.gitConnectorRef, '')),
                                repoData?.repo || ''
                              )
                            }
                          />
                        </Container>
                      ) : null}
                    </Layout.Horizontal>
                    <Layout.Vertical>
                      <FormInput.Text
                        className={cx(css.inputFields, css.placeholder, { [css.noSpacing]: formValues.rootFolder })}
                        name="rootFolder"
                        label={getString('gitsync.pathToHarnessFolder')}
                        placeholder={HARNESS_FOLDER_NAME_PLACEHOLDER}
                      />
                      <Text
                        font={{ size: 'small' }}
                        padding={{ top: 'xsmall', bottom: 'xxlarge' }}
                        color={Color.GREY_250}
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                        title={getCompleteGitPath(formValues.repo, formValues.rootFolder.trim(), HARNESS_FOLDER_SUFFIX)}
                      >
                        {getCompleteGitPath(formValues.repo, formValues.rootFolder.trim(), HARNESS_FOLDER_SUFFIX)}
                      </Text>
                      <Container
                        padding={{
                          left: 'xlarge'
                        }}
                      >
                        <FormInput.CheckBox name="isDefault" label={getString('gitsync.markAsDefaultLabel')} />
                      </Container>
                    </Layout.Vertical>
                  </Layout.Vertical>
                  <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
                    <Button
                      intent="primary"
                      type="submit"
                      text={getString('gitsync.addFolder')}
                      margin={{ right: 'large' }}
                      disabled={loading || testing || testStatus === TestStatus.FAILED}
                    />
                    {loading ? (
                      <Icon name="steps-spinner" color={Color.PRIMARY_7} margin={{ right: 'large' }} size={18} />
                    ) : null}
                    <Button
                      disabled={loading}
                      text={getString('cancel')}
                      onClick={() => {
                        setRepoState(RepoState.VIEW)
                        setTestStatus(TestStatus.NOT_INITIATED)
                        hideModal()
                      }}
                    />
                  </Layout.Horizontal>
                </FormikForm>
              )}
            </Formik>
          </Container>
        </Dialog>
      )
    }, [modalErrorHandler?.showDanger, loading, testStatus])

    React.useEffect(() => {
      if (repoState === RepoState.EDIT) {
        showModal()
      }
    }, [repoState])

    return (
      <div className={css.wrapper}>
        <Layout.Vertical spacing="xsmall">
          {repoData?.gitSyncFolderConfigDTOs?.length
            ? repoData.gitSyncFolderConfigDTOs.map((rootFolderData: GitSyncFolderConfigDTO, index: number) => {
                const folderPath = rootFolderData.rootFolder?.trim()?.split('/.harness')[0] || ''
                const folderWithPrefix = folderPath.startsWith('/') ? folderPath : '/'.concat(folderPath)
                const linkToProvider = getExternalUrl(repoData, rootFolderData.rootFolder?.trim())
                return (
                  <Layout.Horizontal
                    key={index}
                    className={css.rootFoldersContainer}
                    flex={{ justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Layout.Horizontal className={css.rootFoldersData}>
                      <Container width="20%">
                        <Text
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={folderWithPrefix}
                          color={Color.BLACK}
                          className={css.pathFont}
                        >
                          {folderWithPrefix}
                        </Text>
                      </Container>

                      <Container
                        padding={{ left: 'xsmall' }}
                        className={css.noOverflow}
                        width={rootFolderData.isDefault ? '60%' : '75%'}
                      >
                        <a href={linkToProvider} target="_blank" rel="noopener noreferrer" className={css.noShadow}>
                          <Text title={linkToProvider} className={cx(css.link, css.pathFont)}>
                            {linkToProvider}
                          </Text>
                        </a>
                      </Container>

                      <Container width="5%" padding={{ left: 'xsmall' }}>
                        <CopyToClipboard content={linkToProvider} showFeedback={true} />
                      </Container>
                      {rootFolderData.isDefault && (
                        <Container width="15%">
                          <Tag className={css.defaultFolderTag} style={{ borderRadius: 5 }}>
                            {getString('gitsync.defaultFolder')}
                          </Tag>
                        </Container>
                      )}
                    </Layout.Horizontal>
                    <RightMenu
                      repo={repoData}
                      selectedFolderIndex={index}
                      handleRepoUpdate={handleRepoUpdate}
                      isDefault={rootFolderData.isDefault}
                    />
                  </Layout.Horizontal>
                )
              })
            : null}

          {repoState === RepoState.VIEW ? (
            <Button
              minimal
              className={css.addFolderBtn}
              intent="primary"
              text={
                <Layout.Horizontal flex={{ alignItems: 'baseline' }} spacing="xsmall">
                  <Text font={{ size: 'medium' }}>+</Text>
                  <Text>{getString('gitsync.addFolder')}</Text>
                </Layout.Horizontal>
              }
              onClick={() => {
                repoState === RepoState.VIEW && setRepoState(RepoState.EDIT)
              }}
            />
          ) : null}
        </Layout.Vertical>
      </div>
    )
  }

  const { getString } = useStrings()

  const columns: Column<GitSyncConfig>[] = useMemo(
    () => [
      {
        Header: getString('repository').toUpperCase(),
        accessor: 'repo',
        id: 'reponame',
        width: '15%',
        Cell: RenderColumnReponame
      },
      {
        Header: getString('common.path').toUpperCase(),
        accessor: 'repo',
        id: 'repo',
        width: '25%',
        Cell: RenderColumnRepo
      },
      {
        Header: getString('gitsync.defaultBranch').toUpperCase(),
        accessor: 'branch',
        id: 'branch',
        width: '10%',
        Cell: RenderColumnBranch
      },
      {
        Header: getString('gitsync.rootFolderListHeader').toUpperCase(),
        accessor: 'gitSyncFolderConfigDTOs',
        id: 'rootFolders',
        width: '50%',
        Cell: RenderColumnRootFolder
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gitSyncRepos]
  )
  return (
    <Container>
      <Layout.Horizontal margin={{ right: 'xlarge' }} flex={{ distribution: 'space-between' }}>
        <Button
          intent="primary"
          text={getString('addRepository')}
          icon="plus"
          onClick={() => openGitSyncModal(false, false, undefined)}
          id="newRepoBtn"
          margin={{ left: 'xlarge', bottom: 'small', top: 'large' }}
        />

        <Container background={Color.GREY_100} padding="small" flex>
          <Icon name="connectivity-mode" size={24} margin={{ right: 'small' }}></Icon>
          <Text color={Color.GREY_800}>
            {getString('gitsync.connectivityModeLabel', { connectivityMode: capitalize(connectivityMode) })}
          </Text>
        </Container>
      </Layout.Horizontal>

      <TableV2<GitSyncConfig> className={css.table} columns={columns} data={gitSyncRepos || []} />
    </Container>
  )
}

export default GitSyncRepoTab
