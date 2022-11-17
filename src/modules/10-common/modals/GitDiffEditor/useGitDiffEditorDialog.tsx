/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { omit, pick, defaultTo } from 'lodash-es'
import { parse } from 'yaml'
import { Button, Layout, Icon, Text, ModalErrorHandlerBinding, ModalErrorHandler } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'

import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { PageSpinner } from '@common/components'
import { GitDiffEditor } from '@common/components/GitDiffEditor/GitDiffEditor'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import { EntityGitDetails, useGetFileByBranch, useGetFileContent } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { sanitize } from '@common/utils/JSONUtils'

import { yamlStringify } from '@common/utils/YamlHelperMethods'
import css from './useGitDiffEditorDialog.module.scss'

export interface UseGitDiffEditorDialogProps<T> {
  onSuccess: (payload: T, objectId: EntityGitDetails['objectId'], gitDetails?: SaveToGitFormInterface) => void
  onClose: () => void
}

export interface GitData extends SaveToGitFormInterface {
  lastCommitId?: string
  resolvedConflictCommitId?: string
  isV2?: boolean
}

export interface UseGitDiffEditorDialogReturn<T> {
  openGitDiffDialog: (
    entity: T,
    gitDetails?: GitData,
    storeMetadata?: StoreMetadata,
    _modalProps?: IDialogProps
  ) => void
  hideGitDiffDialog: () => void
}

const FORMATTING_OPTIONS = {
  indent: 4,
  sortMapEntries: (a: any, b: any) => (a.key < b.key ? 1 : a.key > b.key ? -1 : 0)
}

export function useGitDiffEditorDialog<T>(props: UseGitDiffEditorDialogProps<T>): UseGitDiffEditorDialogReturn<T> {
  const { onSuccess, onClose } = props
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()
  const [entityAsYaml, setEntityAsYaml] = useState<string>()
  const [gitDetails, setGitDetails] = useState<GitData>()
  const [showGitDiff, setShowGitDiff] = useState<boolean>(false)
  const [remoteVersion, setRemoteVersion] = useState<string>('')
  const defaultModalProps: IDialogProps = {
    isOpen: true,
    enforceFocus: false,
    style: {
      minWidth: 500,
      minHeight: 170,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden'
    }
  }
  const [modalProps, setModalProps] = useState<IDialogProps>(defaultModalProps)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier
  }
  const {
    data,
    loading,
    refetch: fetchRemoteFileContent,
    error
  } = useGetFileContent({
    queryParams: {
      ...commonParams,
      yamlGitConfigIdentifier: '',
      filePath: '',
      branch: ''
    },
    lazy: true
  })

  const {
    data: dataV2,
    loading: loadingV2,
    refetch: fetchRemoteFileContentByBranch,
    error: errorV2
  } = useGetFileByBranch({
    queryParams: {
      ...commonParams,
      connectorRef: '',
      repoName: '',
      branch: '',
      filePath: ''
    },
    lazy: true
  })

  React.useEffect(() => {
    const fileContent = gitDetails?.isV2 ? dataV2?.data?.fileContent : data?.data?.content
    try {
      if (fileContent) {
        setRemoteVersion(
          yamlStringify(
            sanitize(parse(fileContent), {
              removeEmptyString: false,
              removeEmptyArray: false,
              removeEmptyObject: false
            }),
            FORMATTING_OPTIONS
          )
        )
      }
    } catch (e) {
      //ignore error
    }
  }, [data?.data?.content, dataV2?.data?.fileContent])

  React.useEffect(() => {
    if (showGitDiff) {
      const { isOpen, style } = defaultModalProps
      const expandedModalProps: IDialogProps = {
        isOpen,
        enforceFocus: false,
        style: Object.assign(omit(style, 'minHeight'), { width: 'calc(100vw - 100px)', height: 'calc(100vh - 100px)' })
      }
      setModalProps(expandedModalProps)
      const remoteFetchError = gitDetails?.isV2 ? error?.message : errorV2?.message
      modalErrorHandler?.showDanger(defaultTo(remoteFetchError, ''))
    }
  }, [showGitDiff, error?.message])

  const [showModal, hideModal] = useModalHook(() => {
    const closeHandler = (): void => {
      onClose()
      hideModal()
      setShowGitDiff(false)
      setModalProps(defaultModalProps)
    }

    return (
      <Dialog {...modalProps}>
        <ModalErrorHandler bind={setModalErrorHandler} />
        <Button minimal icon="cross" iconProps={{ size: 18 }} className={css.crossIcon} onClick={closeHandler} />
        {!(error || errorV2) && (loading || loadingV2) ? (
          <PageSpinner />
        ) : showGitDiff ? (
          <GitDiffEditor
            remote={{ branch: gitDetails?.branch || '', content: remoteVersion }}
            local={{ branch: getString('common.local'), content: entityAsYaml || '' }}
            onSave={_data => {
              try {
                let objectId = data?.data?.objectId
                if (gitDetails?.isV2) {
                  objectId = dataV2?.data?.blobId
                  gitDetails.resolvedConflictCommitId = dataV2?.data?.commitId
                  delete gitDetails?.isV2
                }

                onSuccess(parse(_data) as T, objectId, gitDetails)
                hideModal()
              } catch (e) {
                //ignore e
              }
            }}
            onCancel={closeHandler}
            width={'calc(100vw - 100px)'}
            height={error ? 'calc(100vh - 265px)' : 'calc(100vh - 210px)'}
          />
        ) : (
          <Layout.Horizontal padding={{ top: 'xlarge', left: 'xxlarge' }} spacing="large">
            <Layout.Vertical>
              <Icon name="cross" size={25} className={css.error} padding="medium" />
            </Layout.Vertical>
            <Layout.Vertical padding={{ left: 'medium' }}>
              <Text style={{ fontWeight: 'bold' }} padding={{ bottom: 'medium' }}>
                {getString('common.newVersion')}
              </Text>
              <Text>{getString('common.confictOccured', { name: 'Someone' })}</Text>
              <Text padding={{ bottom: 'large' }}>{getString('common.resolveConflict')}</Text>
              <Button
                intent="primary"
                text={getString('common.seeWhatChanged')}
                onClick={() => setShowGitDiff(true)}
                width="fit-content"
                padding={{ left: 'small' }}
              />
            </Layout.Vertical>
          </Layout.Horizontal>
        )}
      </Dialog>
    )
  }, [showGitDiff, modalProps, remoteVersion])
  return {
    openGitDiffDialog: (
      _entity: T,
      _gitDetails?: GitData,
      _storeMetadata?: StoreMetadata,
      _modalProps?: IDialogProps
    ) => {
      const { repoIdentifier = '', filePath = '', rootFolder = '', branch = '' } = _gitDetails || {}

      _gitDetails?.isV2
        ? fetchRemoteFileContentByBranch({
            queryParams: {
              ...commonParams,
              filePath: defaultTo(_storeMetadata?.filePath, ''),
              branch,
              ...pick(_storeMetadata, ['connectorRef', 'repoName'])
            }
          })
        : fetchRemoteFileContent({
            queryParams: {
              ...commonParams,
              yamlGitConfigIdentifier: repoIdentifier,
              filePath: rootFolder?.concat(filePath) || '',
              branch,
              commitId: _gitDetails?.resolvedConflictCommitId
            }
          })
      try {
        setEntityAsYaml(
          yamlStringify(
            sanitize(_entity, { removeEmptyString: false, removeEmptyArray: false, removeEmptyObject: false }),
            FORMATTING_OPTIONS
          )
        )
      } catch (e) {
        //ignore error
      }
      setGitDetails(_gitDetails)
      setModalProps(_modalProps || modalProps)
      showModal()
    },
    hideGitDiffDialog: () => {
      hideModal()
      setShowGitDiff(false)
      setModalProps(defaultModalProps)
    }
  }
}
