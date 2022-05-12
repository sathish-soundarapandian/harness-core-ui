/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Text,
  ExpandingSearchInput,
  ButtonVariation,
  Button,
  PageError,
  Page,
  shouldShowError
} from '@wings-software/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog } from '@blueprintjs/core'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'

import { PageSpinner } from '@common/components'

import {
  useListGitOpsProviders,
  ListGitOpsProvidersQueryParams,
  GitopsProviderResponse,
  ConnectedArgoGitOpsInfoDTO,
  useDeleteGitOpsProvider
} from 'services/cd-ng'
import { useToaster } from '@common/exports'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import argoLogo from '@cd/icons/argo-logo.svg'

import NewProviderModal from './NewProviderModal/NewProviderModal'
import ProvidersGridView from './ProvidersGridView/ProvidersGridView'

import noAdapterIllustration from '../images/noAdapterIllustration.svg'

import css from './GitOpsProvidersList.module.scss'

const GitOpsModalContainer: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & ModulePathParams>()

  const { showSuccess, showError } = useToaster()
  const { getRBACErrorMessage } = useRBACError()
  // Adding timeout to escape the timegap between loading set by useListGitOpsProviders and setting deleting to false
  const [deleting, setDeleting] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeProvider, setActiveProvider] = useState<GitopsProviderResponse | null>(null)
  const [page, setPage] = useState(0)
  const timerRef = useRef<number | null>(null)
  const [editMode, setEditMode] = useState(false)
  const defaultQueryParams: ListGitOpsProvidersQueryParams = {
    pageIndex: page,
    pageSize: 10,
    projectIdentifier,
    orgIdentifier,
    accountIdentifier: accountId,
    searchTerm: '',
    type: 'CONNECTED_ARGO_PROVIDER'
  }

  const { mutate: deleteConnector } = useDeleteGitOpsProvider({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  useDocumentTitle(getString('cd.gitOps'))

  const handleEdit = (provider: GitopsProviderResponse): void => {
    setActiveProvider(provider)
    setEditMode(true)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  const handleDelete = async (provider: GitopsProviderResponse): Promise<void> => {
    try {
      setDeleting(true)
      const deleted = await deleteConnector(provider?.identifier || '', {
        headers: { 'content-type': 'application/json' }
      })

      if (deleted) {
        refetchConnectorList({ queryParams: { ...defaultQueryParams, searchTerm, pageIndex: 0 } })
        showSuccess(getString('cd.adapterDelete', { adapterName: provider?.name }))
      }
    } catch (err) {
      showError(getRBACErrorMessage(err))
    } finally {
      timerRef.current = window.setTimeout(() => {
        setDeleting(false)
      }, 2000)
    }
  }

  const handleLaunchArgoDashboard = (provider: GitopsProviderResponse): void => {
    setEditMode(false)
    closeNewProviderModal()
    setActiveProvider(provider)
    openArgoModal()
  }

  const [openArgoModal, closeArgoModal] = useModalHook(() => {
    const handleCloseArgoModal = (): void => {
      closeArgoModal()
      reset()
    }

    return (
      <Dialog
        onClose={handleCloseArgoModal}
        isOpen={true}
        style={{
          width: '100%',
          padding: '40px',
          position: 'relative',
          height: '100vh',
          background: 'none',
          margin: '0px'
        }}
        enforceFocus={false}
      >
        <div style={{}} className={css.frameContainer}>
          <div className={css.frameHeader}>
            <img className={css.argoLogo} src={argoLogo} alt="" aria-hidden />
            {activeProvider?.name} - {(activeProvider?.spec as ConnectedArgoGitOpsInfoDTO)?.adapterUrl}
            <Button
              variation={ButtonVariation.ICON}
              icon="cross"
              className={css.closeIcon}
              iconProps={{ size: 18 }}
              onClick={handleCloseArgoModal}
              data-testid={'close-certi-upload-modal'}
              withoutCurrentColor
            />
          </div>
          <iframe
            id="argoCD"
            className={css.argoFrame}
            width="100%"
            frameBorder="0"
            name="argoCD"
            title="argoCD"
            src={(activeProvider?.spec as ConnectedArgoGitOpsInfoDTO)?.adapterUrl}
          />
        </div>
      </Dialog>
    )
  }, [activeProvider])

  const {
    data,
    loading,
    error: connectorFetchError,
    refetch: refetchConnectorList
  } = useListGitOpsProviders({
    queryParams: defaultQueryParams,
    debounce: 500
  })

  const [addNewProviderModal, closeNewProviderModal] = useModalHook(() => {
    const handleClose = (): void => {
      closeNewProviderModal()
      refetchConnectorList({ queryParams: { ...defaultQueryParams, searchTerm, pageIndex: 0 } })
    }

    return (
      <Dialog
        onClose={handleClose}
        isOpen={true}
        style={{
          width: 'auto',
          minWidth: 1175,
          height: 640,
          borderLeft: 0,
          paddingBottom: 0,
          position: 'relative',
          overflow: 'auto'
        }}
        enforceFocus={false}
      >
        <NewProviderModal
          isEditMode={editMode}
          onUpdateMode={(mode: boolean) => setEditMode(mode)}
          provider={activeProvider}
          onClose={handleClose}
          onLaunchArgoDashboard={handleLaunchArgoDashboard}
        />
      </Dialog>
    )
  }, [activeProvider, editMode])

  /* Through page browsing */
  useEffect(() => {
    const updatedQueryParams: ListGitOpsProvidersQueryParams = {
      ...defaultQueryParams,
      projectIdentifier,
      orgIdentifier,
      searchTerm,
      pageIndex: page
    }
    refetchConnectorList({ queryParams: updatedQueryParams })
  }, [page, projectIdentifier, orgIdentifier])

  useEffect(() => {
    refetchConnectorList({ queryParams: { ...defaultQueryParams, searchTerm, pageIndex: 0 } })
  }, [searchTerm])

  useEffect(() => {
    if (editMode && activeProvider) {
      addNewProviderModal()
    }
  }, [activeProvider, addNewProviderModal, editMode])

  /* Clearing filter from Connector Filter Panel */
  const reset = (): void => {
    refetchConnectorList({ queryParams: { ...defaultQueryParams, searchTerm } })
  }

  return (
    <>
      <Page.SubHeader>
        <Layout.Horizontal>
          <RbacButton
            variation={ButtonVariation.PRIMARY}
            text={getString('cd.newAdapter')}
            permission={{
              permission: PermissionIdentifier.CREATE_PROJECT, // change to ADD_NEW_PROVIDER
              resource: {
                resourceType: ResourceType.ACCOUNT,
                resourceIdentifier: projectIdentifier
              }
            }}
            onClick={() => {
              setActiveProvider(null)
              setEditMode(false)
              addNewProviderModal()
            }}
            icon="plus"
            id="newProviderBtn"
            data-test="newProviderButton"
          />
        </Layout.Horizontal>
        <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
          <ExpandingSearchInput
            alwaysExpanded
            width={300}
            placeholder={getString('cd.searchPlaceholder')}
            throttle={200}
            onChange={(query: string) => {
              setSearchTerm(query)
            }}
            className={css.expandSearch}
          />
        </Layout.Horizontal>
      </Page.SubHeader>

      <Page.Body className={css.pageBody}>
        <Layout.Vertical>
          <Page.Body>
            {loading || deleting ? (
              <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
                <PageSpinner />
              </div>
            ) : /* istanbul ignore next */ connectorFetchError && shouldShowError(connectorFetchError) ? (
              <div style={{ paddingTop: '200px' }}>
                <PageError
                  message={getRBACErrorMessage(connectorFetchError) as string}
                  onClick={(e: React.MouseEvent<Element, MouseEvent>) => {
                    e.preventDefault()
                    e.stopPropagation()
                    reset()
                  }}
                />
              </div>
            ) : data?.data?.content?.length ? (
              <ProvidersGridView
                onDelete={async (provider: GitopsProviderResponse) => handleDelete(provider)}
                onEdit={async provider => handleEdit(provider)}
                data={data?.data}
                loading={loading}
                gotoPage={(pageNumber: number) => setPage(pageNumber)}
              />
            ) : (
              <div className={css.noPipelineSection}>
                <Layout.Vertical spacing="small" flex={{ justifyContent: 'center', alignItems: 'center' }} width={720}>
                  <img src={noAdapterIllustration} className={css.image} />

                  <Text className={css.noProviderText} margin={{ top: 'medium', bottom: 'small' }}>
                    {getString('cd.noAdapterText')}
                  </Text>
                  <Text className={css.aboutProvider} margin={{ top: 'xsmall', bottom: 'xlarge' }}>
                    {getString('cd.aboutProvider')}
                  </Text>

                  <RbacButton
                    variation={ButtonVariation.PRIMARY}
                    text={getString('cd.newAdapter')}
                    permission={{
                      permission: PermissionIdentifier.CREATE_PROJECT, // change to ADD_NEW_PROVIDER
                      resource: {
                        resourceType: ResourceType.ACCOUNT,
                        resourceIdentifier: projectIdentifier
                      }
                    }}
                    onClick={() => {
                      setActiveProvider(null)
                      setEditMode(false)
                      addNewProviderModal()
                    }}
                    icon="plus"
                    id="newProviderBtn"
                    data-test="newProviderButton"
                  />
                </Layout.Vertical>
              </div>
            )}
          </Page.Body>
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}

export default GitOpsModalContainer
