/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { ButtonSize, ButtonVariation, Container, ModalDialog, Page, useToggleOpen } from '@harness/uicore'

import { useGetInfrastructureList } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import type { EnvironmentPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'

import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RbacButton from '@rbac/components/Button/Button'
import { InfraDefinitionDetailsDrawer } from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/InfraDefinitionDetailsDrawer/InfraDefinitionDetailsDrawer'

import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference.types'
import InfrastructureList from './InfrastructureList/InfrastructureList'
import InfrastructureModal from './InfrastructureModal'

import css from './InfrastructureDefinition.module.scss'

export default function InfrastructureDefinition(): JSX.Element {
  const { accountId, orgIdentifier, projectIdentifier, environmentIdentifier } = useParams<
    ProjectPathProps & EnvironmentPathProps
  >()
  const { getString } = useStrings()
  const { getRBACErrorMessage } = useRBACError()
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<string>('')
  const [infraSaveInProgress, setInfraSaveInProgress] = useState<boolean>(false)
  const {
    isOpen: isInfraDefinitionDetailsOpen,
    close: closeInfraDefinitionDetails,
    open: openInfraDefinitionDetails
  } = useToggleOpen(false)

  const { data, loading, error, refetch } = useGetInfrastructureList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier
    }
  })
  const scopeFromDTO = getScopeFromDTO({ accountId, orgIdentifier, projectIdentifier })

  const { getTemplate } = useTemplateSelector()
  const onClose = (): void => {
    setSelectedInfrastructure('')
    closeInfraDefinitionDetails()
  }

  useEffect(() => {
    if (selectedInfrastructure) {
      openInfraDefinitionDetails()
    }
  }, [selectedInfrastructure, openInfraDefinitionDetails])

  return (
    <>
      <Container padding={{ left: 'medium', right: 'medium' }}>
        {loading ? (
          <ContainerSpinner />
        ) : error ? (
          <Page.Error>{getRBACErrorMessage(error)}</Page.Error>
        ) : (
          <>
            <RbacButton
              text={getString('pipelineSteps.deploy.infrastructure.infraDefinition')}
              font={{ weight: 'bold' }}
              icon="plus"
              onClick={openInfraDefinitionDetails}
              size={ButtonSize.SMALL}
              variation={ButtonVariation.LINK}
              permission={{
                resource: {
                  resourceType: ResourceType.ENVIRONMENT,
                  resourceIdentifier: environmentIdentifier
                },
                resourceScope: {
                  accountIdentifier: accountId,
                  orgIdentifier,
                  projectIdentifier
                },
                permission: PermissionIdentifier.EDIT_ENVIRONMENT
              }}
            />
            <InfrastructureList
              list={data?.data?.content}
              showModal={openInfraDefinitionDetails}
              refetch={refetch}
              setSelectedInfrastructure={setSelectedInfrastructure}
            />
          </>
        )}
        {selectedInfrastructure ? (
          <InfraDefinitionDetailsDrawer
            isDrawerOpened={isInfraDefinitionDetailsOpen}
            onCloseDrawer={onClose}
            selectedInfrastructure={selectedInfrastructure}
            scope={scopeFromDTO}
            environmentIdentifier={environmentIdentifier}
            refetch={refetch}
            getTemplate={getTemplate}
            setInfraSaveInProgress={setInfraSaveInProgress}
            infraSaveInProgress={infraSaveInProgress}
          />
        ) : (
          <ModalDialog
            isOpen={isInfraDefinitionDetailsOpen}
            isCloseButtonShown
            canEscapeKeyClose
            canOutsideClickClose
            enforceFocus={false}
            onClose={onClose}
            title={getString('cd.infrastructure.createNew')}
            width={1128}
            height={840}
            className={css.dialogStyles}
          >
            <InfrastructureModal
              hideModal={onClose}
              refetch={refetch}
              environmentIdentifier={environmentIdentifier}
              selectedInfrastructure={selectedInfrastructure}
              getTemplate={getTemplate}
              scope={scopeFromDTO}
            />
          </ModalDialog>
        )}
      </Container>
    </>
  )
}
