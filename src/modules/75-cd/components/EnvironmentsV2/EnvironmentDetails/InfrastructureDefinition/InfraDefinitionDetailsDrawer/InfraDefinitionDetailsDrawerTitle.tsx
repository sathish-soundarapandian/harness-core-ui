import React from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, Container, Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import RbacButton, { ButtonProps } from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import css from '@cd/components/EnvironmentsV2/EnvironmentDetails/InfrastructureDefinition/InfrastructureDefinition.module.scss'

export function InfraDefinitionDetailsDrawerTitle(props: {
  discardChanges: () => void
  applyChanges: () => void
  scope: Scope
  environmentIdentifier: string
  infraSaveInProgress?: boolean
  isInfraUpdated?: boolean
  shouldShowActionButtons: boolean
  openUnsavedChangesDiffModal: () => void
}): JSX.Element {
  const {
    discardChanges,
    applyChanges,
    scope,
    environmentIdentifier,
    infraSaveInProgress,
    shouldShowActionButtons,
    isInfraUpdated,
    openUnsavedChangesDiffModal
  } = props
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const environmentEditPermissions: ButtonProps['permission'] = {
    resource: {
      resourceType: ResourceType.ENVIRONMENT,
      resourceIdentifier: environmentIdentifier
    },
    resourceScope: {
      accountIdentifier: accountId,
      ...(scope !== Scope.ACCOUNT && { orgIdentifier }),
      ...(scope === Scope.PROJECT && { projectIdentifier })
    },
    permission: PermissionIdentifier.EDIT_ENVIRONMENT
  }
  const { getString } = useStrings()
  return (
    <Layout.Horizontal flex={{ distribution: 'space-between' }}>
      <Text color={Color.BLACK} font={{ size: 'medium', weight: 'bold' }}>
        {getString('cd.infrastructure.infrastructureDetails')}
      </Text>
      {shouldShowActionButtons && (
        <Container>
          <Layout.Horizontal
            spacing={'medium'}
            padding={{ top: 'xlarge', left: 'huge', bottom: 'large' }}
            className={css.modalFooter}
          >
            {isInfraUpdated && (
              <Button
                variation={ButtonVariation.LINK}
                intent="warning"
                className={css.tagRender}
                onClick={openUnsavedChangesDiffModal}
              >
                {getString('unsavedChanges')}
              </Button>
            )}
            <RbacButton
              text={getString('save')}
              variation={ButtonVariation.PRIMARY}
              onClick={applyChanges}
              disabled={infraSaveInProgress || !isInfraUpdated}
              loading={infraSaveInProgress}
              permission={environmentEditPermissions}
            />
            <Button
              text={getString('common.discard')}
              variation={ButtonVariation.SECONDARY}
              onClick={discardChanges}
              disabled={infraSaveInProgress}
            />
          </Layout.Horizontal>
        </Container>
      )}
    </Layout.Horizontal>
  )
}
