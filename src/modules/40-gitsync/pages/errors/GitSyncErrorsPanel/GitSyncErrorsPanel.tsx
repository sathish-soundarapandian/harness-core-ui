/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction, useContext, useState } from 'react'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { Drawer, Position } from '@blueprintjs/core'
import {
  Layout,
  Pagination,
  PaginationProps,
  PageError,
  Button,
  PillToggle,
  PillToggleProps,
  Text,
  Icon
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Color, FontVariation } from '@harness/design-system'
import {
  GitErrorExperienceSubTab,
  GitErrorExperienceTab,
  GitSyncErrorState
} from '@gitsync/pages/errors/GitSyncErrorContext'
import {
  ListGitToHarnessErrorsCommitsQueryParams,
  useListGitToHarnessErrorsCommits,
  GitSyncErrorAggregateByCommitDTO,
  useListGitSyncErrors,
  GitSyncErrorDTO,
  GetYamlSchemaQueryParams
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { PageSpinner } from '@common/components'
import { downloadYamlAsFile } from '@common/utils/downloadYamlUtils'
import { useStrings } from 'framework/strings'
import type { GitSyncErrorMessageProps } from '@gitsync/components/GitSyncErrorMessage/GitSyncErrorMessageItem'
import { GitSyncErrorMessage, parseCommitItems } from '@gitsync/components/GitSyncErrorMessage/GitSyncErrorMessage'
import styles from '@gitsync/pages/errors/GitSyncErrorsPanel/GitSyncErrorsPanel.module.scss'

interface SelectedFile {
  fileName: string
  filePath: string
  type: string
  content: string
}

const parseDataForCommitView = (data: GitSyncErrorAggregateByCommitDTO[] = []): GitSyncErrorMessageProps[] => {
  return data.map(item => ({
    mode: 'COMMIT',
    title: item.commitMessage || '',
    count: item.failedCount,
    repo: item.repoId,
    branch: item.branchName,
    commitId: item.gitCommitId,
    timestamp: item.createdAt,
    items: parseCommitItems(defaultTo(item.errorsForSummaryView, []))
  }))
}

const parseDataForFileView = (
  data: GitSyncErrorDTO[],
  onShowDetails: (fileData: SelectedFile) => void
): GitSyncErrorMessageProps[] => {
  return data.map(item => ({
    mode: 'FILE',
    title: item.completeFilePath || '',
    repo: item.repoId,
    branch: item.branchName,
    timestamp: item.createdAt,
    commitId: defaultTo(item.additionalErrorDetails?.gitCommitId, ''),
    items: [
      {
        reason: item.failureReason || '',
        ...(item.additionalErrorDetails?.yamlContent
          ? {
              showDetails: () => {
                onShowDetails({
                  fileName: defaultTo((item.completeFilePath || '').split('/').pop(), ''),
                  filePath: item.additionalErrorDetails?.entityUrl,
                  type: defaultTo(item.entityType, ''),
                  content: item.additionalErrorDetails?.yamlContent
                })
              }
            }
          : {})
      }
    ]
  }))
}

const parseDataForConnectivityView = (data: GitSyncErrorDTO[] = []): GitSyncErrorMessageProps[] => {
  return data.map(item => ({
    mode: 'CONNECTIVITY',
    title: item.failureReason || '',
    repo: item.repoId,
    branch: item.branchName,
    timestamp: item.createdAt,
    items: []
  }))
}

const drawerProps = {
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  isOpen: true,
  hasBackdrop: true,
  position: Position.RIGHT,
  usePortal: true,
  size: '40%',
  isCloseButtonShown: true
}

const GitErrorExperienceToggle: React.FC<{
  selectedTab: GitErrorExperienceTab
  selectedView: GitErrorExperienceSubTab | null
  setView: Dispatch<SetStateAction<GitErrorExperienceSubTab | null>>
}> = props => {
  const { getString } = useStrings()
  const { selectedTab, setView, selectedView } = props
  if (selectedTab === GitErrorExperienceTab.ALL_ERRORS) {
    const toggleProps: PillToggleProps<GitErrorExperienceSubTab> = {
      selectedView: selectedView ?? GitErrorExperienceSubTab.ALL_ERRORS_COMMIT_VIEW,
      options: [
        {
          label: getString('commits'),
          value: GitErrorExperienceSubTab.ALL_ERRORS_COMMIT_VIEW
        },
        {
          label: getString('common.files'),
          value: GitErrorExperienceSubTab.ALL_ERRORS_FILE_VIEW
        }
      ],
      onChange: view => {
        setView(view)
      },
      className: styles.toggle
    }
    return (
      <Layout.Horizontal flex={{ justifyContent: 'center' }}>
        <PillToggle {...toggleProps} />
      </Layout.Horizontal>
    )
  }
  return <></>
}

export const GitSyncErrorsPanel: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { selectedTab, view, setView, searchTerm, branch, repoIdentifier, reloadAction } = useContext(GitSyncErrorState)
  const isCommitView = view === GitErrorExperienceSubTab.ALL_ERRORS_COMMIT_VIEW
  const isFileView = view === GitErrorExperienceSubTab.ALL_ERRORS_FILE_VIEW

  const [pageIndex, setPageIndex] = useState(0)
  const [selectedFile, setSelectedFile] = useState<SelectedFile>()

  const { getString } = useStrings()

  const queryParams: ListGitToHarnessErrorsCommitsQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    searchTerm,
    branch,
    repoIdentifier,
    pageIndex,
    pageSize: 10,
    ...(isCommitView ? {} : { gitToHarness: isFileView })
  }

  const { data, loading, error, refetch } = (isCommitView ? useListGitToHarnessErrorsCommits : useListGitSyncErrors)({
    queryParams
  })

  reloadAction.current = refetch

  const paginationProps: PaginationProps = {
    itemCount: data?.data?.totalItems || 0,
    pageSize: data?.data?.pageSize || 0,
    pageCount: data?.data?.totalPages || 0,
    pageIndex: data?.data?.pageIndex || 0,
    gotoPage: pageNumber => setPageIndex(pageNumber)
  }

  const [showModal, hideDrawer] = useModalHook(() => {
    const download = (): void => {
      downloadYamlAsFile(selectedFile?.content, defaultTo(selectedFile?.fileName, ''))
    }

    const openFile = (): void => {
      window.open(selectedFile?.filePath, '_blank')
    }

    const renderCustomHeader = (): JSX.Element => (
      <Layout.Horizontal
        flex={{ justifyContent: 'space-between' }}
        padding={{ left: 'xlarge', right: 'xlarge', top: 'large', bottom: 'large' }}
      >
        <Layout.Horizontal flex={{ alignItems: 'center' }}>
          <Icon name="main-applications" size={20} color={Color.GREY_400} margin={{ right: 'large' }} />
          <Text font={{ variation: FontVariation.H5 }}>{getString('gitsync.fileContent')}</Text>
        </Layout.Horizontal>
        <Layout.Horizontal flex={{ alignItems: 'center' }}>
          <Icon
            name="command-install"
            size={18}
            color={Color.GREY_400}
            margin={{ right: 'xlarge' }}
            onClick={download}
            className={styles.hover}
          />
          <Icon name="main-share" size={18} color={Color.GREY_400} onClick={openFile} className={styles.hover} />
        </Layout.Horizontal>
      </Layout.Horizontal>
    )

    return (
      <Drawer
        onClose={() => {
          hideDrawer()
        }}
        className={styles.drawer}
        {...drawerProps}
      >
        <Button
          minimal
          className={styles.almostFullScreenCloseBtn}
          icon="cross"
          withoutBoxShadow
          onClick={() => {
            hideDrawer()
          }}
        />
        <YAMLBuilder
          entityType={selectedFile?.type as GetYamlSchemaQueryParams['entityType']}
          fileName={getString('gitsync.fileContent')}
          isReadOnlyMode
          isEditModeSupported={false}
          existingYaml={selectedFile?.content}
          renderCustomHeader={renderCustomHeader}
        />
      </Drawer>
    )
  }, [selectedFile])

  const onShowDetails = (fileData: SelectedFile): void => {
    setSelectedFile(fileData)
    showModal()
  }

  const Component = (): React.ReactElement => {
    if (loading) {
      return <PageSpinner />
    }
    if (error) {
      return <PageError onClick={() => refetch()} />
    }

    const parsedData = isCommitView
      ? parseDataForCommitView(data?.data?.content)
      : isFileView
      ? parseDataForFileView(defaultTo(data?.data?.content, []), onShowDetails)
      : parseDataForConnectivityView(data?.data?.content)

    return (
      <Layout.Vertical height="calc(100% - 16px)">
        <Layout.Vertical className={styles.gitSyncErrorsPanel}>
          {parsedData.map(item => (
            <GitSyncErrorMessage key={item.commitId} {...item} />
          ))}
        </Layout.Vertical>
        <Pagination {...paginationProps} />
      </Layout.Vertical>
    )
  }

  return (
    <Layout.Vertical padding={{ left: 'large', right: 'large' }}>
      <GitErrorExperienceToggle selectedTab={selectedTab} setView={setView} selectedView={view} />
      <Component />
    </Layout.Vertical>
  )
}
