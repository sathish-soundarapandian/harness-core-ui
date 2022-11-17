/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Position } from '@blueprintjs/core'
import { Button, ButtonVariation } from '@harness/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { merge, noop } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { getAllowedTemplateTypes, TemplateType } from '@templates-library/utils/templatesUtils'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  TemplateMenuItem,
  TemplatesActionPopover
} from '@templates-library/components/TemplatesActionPopover/TemplatesActionPopover'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useFeature } from '@common/hooks/useFeatures'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import css from './NewTemplatePopover.module.scss'

export interface NewTemplatePopoverWrapperProps {
  onImportTemplateClick?: () => void
}

function NewTemplatePopoverWrapper({ onImportTemplateClick }: NewTemplatePopoverWrapperProps): React.ReactElement {
  const { getString } = useStrings()
  const history = useHistory()
  const { module, ...params } = useParams<ProjectPathProps & ModulePathParams>()
  const { projectIdentifier, orgIdentifier, accountId } = params
  const { CUSTOM_SECRET_MANAGER_NG, CVNG_TEMPLATE_MONITORED_SERVICE, NG_SVC_ENV_REDESIGN, ARTIFACT_SOURCE_TEMPLATE } =
    useFeatureFlags()
  const allowedTemplateTypes = getAllowedTemplateTypes(getScopeFromDTO(params), {
    [TemplateType.SecretManager]: !!CUSTOM_SECRET_MANAGER_NG,
    [TemplateType.MonitoredService]: !!CVNG_TEMPLATE_MONITORED_SERVICE,
    [TemplateType.CustomDeployment]: !!NG_SVC_ENV_REDESIGN,
    [TemplateType.ArtifactSource]: !!ARTIFACT_SOURCE_TEMPLATE
  })
  const { supportingTemplatesGitx } = useAppStore()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { enabled: templatesEnabled } = useFeature({
    featureRequest: {
      featureName: FeatureIdentifier.TEMPLATE_SERVICE
    }
  })
  const rbacResourcePermission = {
    resource: {
      resourceType: ResourceType.TEMPLATE
    }
  }
  const [canEdit] = usePermission({
    ...rbacResourcePermission,
    permissions: [PermissionIdentifier.EDIT_TEMPLATE]
  })
  const goToTemplateStudio = React.useCallback(
    (templateType: TemplateType) => {
      history.push(
        routes.toTemplateStudio({
          projectIdentifier,
          orgIdentifier,
          accountId,
          module,
          templateType,
          templateIdentifier: DefaultNewTemplateId
        })
      )
    },
    [projectIdentifier, orgIdentifier, accountId, module]
  )

  const getMenu = (): TemplateMenuItem[] => {
    const allowedTemplates = allowedTemplateTypes.map(templateType => {
      return merge(templateType, {
        onClick: () => goToTemplateStudio(templateType.value as TemplateType)
      })
    })

    return [
      ...(supportingTemplatesGitx
        ? [{ label: getString('common.importFromGit'), onClick: onImportTemplateClick }]
        : []),
      ...allowedTemplates
    ] as TemplateMenuItem[]
  }

  const tooltipBtn = React.useCallback(
    () =>
      !canEdit ? (
        <RBACTooltip permission={PermissionIdentifier.EDIT_TEMPLATE} resourceType={ResourceType.TEMPLATE} />
      ) : !templatesEnabled ? (
        <FeatureWarningTooltip featureName={FeatureIdentifier.TEMPLATE_SERVICE} />
      ) : undefined,
    [canEdit, templatesEnabled]
  )

  return (
    <TemplatesActionPopover
      open={menuOpen}
      minimal={true}
      items={getMenu()}
      position={Position.BOTTOM}
      disabled={!canEdit || !templatesEnabled}
      setMenuOpen={setMenuOpen}
      usePortal={false}
      className={cx({ [css.supportTemplateImport]: supportingTemplatesGitx })}
    >
      <Button
        variation={ButtonVariation.PRIMARY}
        icon="plus"
        rightIcon="chevron-down"
        text={getString('templatesLibrary.addNewTemplate')}
        onClick={noop}
        disabled={!canEdit || !templatesEnabled}
        tooltip={tooltipBtn()}
      />
    </TemplatesActionPopover>
  )
}

export const NewTemplatePopover = React.memo(NewTemplatePopoverWrapper)
