/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { Button, ButtonSize, ButtonVariation, Container, Dialog, Page } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'

import { useGetInfrastructureList } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import type { EnvironmentPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'

import { InfrastructureList } from './InfrastructureList/InfrastructureList'
import { InfrastructureModal } from './InfrastructureModal'

import css from './InfrastructureDefinition.module.scss'

export default function InfrastructureDefinition() {
  const { accountId, orgIdentifier, projectIdentifier, environmentIdentifier } = useParams<
    ProjectPathProps & EnvironmentPathProps
  >()
  const { getString } = useStrings()
  const [infrastructureToEdit, setInfrastructureToEdit] = useState<string | undefined>()

  const { data, loading, error, refetch } = useGetInfrastructureList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      environmentIdentifier
    }
  })

  useEffect(() => {
    if (infrastructureToEdit) {
      showModal()
    }
  }, [infrastructureToEdit])

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen
        isCloseButtonShown
        canEscapeKeyClose
        canOutsideClickClose
        enforceFocus={false}
        onClose={hideModal}
        title={getString('cd.infrastructure.createNew')}
        className={cx('padded-dialog', css.dialogStyles)}
      >
        <InfrastructureModal
          hideModal={hideModal}
          refetch={refetch}
          infrastructureToEdit={infrastructureToEdit}
          setInfrastructureToEdit={setInfrastructureToEdit}
        />
      </Dialog>
    ),
    [refetch, infrastructureToEdit, setInfrastructureToEdit]
  )

  return (
    <Container padding={{ left: 'medium', right: 'medium' }}>
      {loading ? (
        <ContainerSpinner />
      ) : error ? (
        <Page.Error>{error}</Page.Error>
      ) : (
        <>
          <Button
            text={getString('pipelineSteps.deploy.infrastructure.infraDefinition')}
            font={{ weight: 'bold' }}
            icon="plus"
            onClick={showModal}
            size={ButtonSize.SMALL}
            variation={ButtonVariation.LINK}
          />
          <InfrastructureList
            list={data?.data?.content}
            showModal={showModal}
            refetch={refetch}
            setInfrastructureToEdit={setInfrastructureToEdit}
          />
        </>
      )}
    </Container>
  )
}
