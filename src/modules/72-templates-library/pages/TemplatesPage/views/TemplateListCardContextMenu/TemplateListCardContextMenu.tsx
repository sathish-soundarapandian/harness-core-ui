/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button } from '@harness/uicore'
import type { PopoverProps } from '@harness/uicore/dist/components/Popover/Popover'
import { useParams } from 'react-router-dom'
import { Classes } from '@blueprintjs/core'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'

import {
  TemplateMenuItem,
  TemplatesActionPopover
} from '@templates-library/components/TemplatesActionPopover/TemplatesActionPopover'

import type { TemplateSummaryResponse, TemplateMetadataSummaryResponse } from 'services/template-ng'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'

import type { TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { ResourceType as GitResourceType } from '@common/interfaces/GitSyncInterface'
import { StoreType } from '@common/constants/GitSyncTypes'
import useEditGitMetadata from '@pipeline/components/MigrateResource/useEditGitMetadata'
import css from './TemplateListCardContextMenu.module.scss'

export interface ContextMenuProps extends PopoverProps {
  template: TemplateSummaryResponse | TemplateMetadataSummaryResponse
  onPreview: (template: TemplateSummaryResponse) => void
  onOpenEdit: (template: TemplateSummaryResponse) => void
  onOpenSettings: (templateIdentifier: string) => void
  onDelete: (template: TemplateSummaryResponse) => void
  onOpenMoveResource: (template: TemplateSummaryResponse) => void
  reloadTemplates?: () => void
  className?: string
}

export const TemplateListCardContextMenu: React.FC<ContextMenuProps> = (props): JSX.Element => {
  const { getString } = useStrings()
  const {
    template,
    onPreview,
    onOpenEdit,
    onOpenSettings,
    onDelete,
    onOpenMoveResource,
    reloadTemplates,
    className,
    ...popoverProps
  } = props
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { accountId, orgIdentifier, projectIdentifier, templateIdentifier } = useParams<TemplateStudioPathProps>()

  const [canView, canEdit, canDelete] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.TEMPLATE,
        resourceIdentifier: template.identifier
      },
      permissions: [
        PermissionIdentifier.VIEW_TEMPLATE,
        PermissionIdentifier.EDIT_TEMPLATE,
        PermissionIdentifier.DELETE_TEMPLATE
      ]
    },
    [orgIdentifier, projectIdentifier, accountId, templateIdentifier]
  )

  const { showEditGitMetadataModal: showEditGitMetadataModal } = useEditGitMetadata({
    resourceType: GitResourceType.TEMPLATE,
    identifier: template.identifier || '',
    metadata: {
      connectorRef: (template as TemplateMetadataSummaryResponse)?.connectorRef,
      repo: template?.gitDetails?.repoName,
      filePath: template?.gitDetails?.filePath
    },
    extraQueryParams: { versionLabel: template?.versionLabel },
    modalTitle: getString('pipeline.editGitDetailsTitle', {
      entity: `${getString('common.template.label')}[${template.identifier}]`
    }),
    onSuccess: () => reloadTemplates?.()
  })

  const items = React.useMemo((): TemplateMenuItem[] => {
    const conditionalMenuItems: TemplateMenuItem[] =
      (template as TemplateMetadataSummaryResponse)?.storeType === StoreType.REMOTE
        ? [
            {
              icon: 'edit',
              label: getString('pipeline.editGitDetails'),
              disabled: !canEdit,
              onClick: () => {
                showEditGitMetadataModal()
              }
            }
          ]
        : [
            {
              icon: 'git-merge',
              label: getString('common.moveToGit'),
              disabled: !canEdit || template.templateEntityType === 'SecretManager', // TODO: Temp hotfix for https://harness.slack.com/archives/C05BGPBNXNG/p1686162048913289
              onClick: () => {
                onOpenMoveResource(template)
              }
            }
          ]

    const menuItems: TemplateMenuItem[] = [
      {
        icon: 'main-view',
        label: getString('connectors.ceAws.crossAccountRoleExtention.step1.p2'),
        disabled: !canView,
        onClick: () => {
          onPreview(template)
        }
      },
      {
        icon: 'main-share',
        label: getString('templatesLibrary.openEditTemplate'),
        disabled: !canEdit,
        onClick: () => {
          onOpenEdit(template)
        }
      },
      {
        icon: 'main-setup',
        label: getString('templatesLibrary.templateSettings'),
        disabled: !canEdit,
        onClick: () => {
          onOpenSettings(defaultTo(template.identifier, ''))
        }
      },
      ...conditionalMenuItems,
      {
        icon: 'main-trash',
        label: getString('templatesLibrary.deleteTemplate'),
        disabled: !canDelete,
        onClick: () => {
          onDelete(template)
        }
      }
    ]

    return menuItems
  }, [canView, canEdit, canDelete, onPreview, onOpenEdit, onOpenSettings, onDelete, template, onOpenMoveResource])

  return (
    <TemplatesActionPopover
      open={menuOpen}
      items={items}
      setMenuOpen={setMenuOpen}
      className={className}
      portalClassName={Classes.DARK}
      {...popoverProps}
    >
      <Button
        minimal
        className={css.actionButton}
        icon="more"
        onClick={e => {
          e.stopPropagation()
          setMenuOpen(true)
        }}
      />
    </TemplatesActionPopover>
  )
}
