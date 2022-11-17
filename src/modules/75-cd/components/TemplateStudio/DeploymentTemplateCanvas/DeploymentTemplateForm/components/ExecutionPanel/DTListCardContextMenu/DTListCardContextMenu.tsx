/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button } from '@harness/uicore'
import type { PopoverProps } from '@harness/uicore/dist/components/Popover/Popover'
import { Classes } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import {
  TemplateMenuItem,
  TemplatesActionPopover
} from '@templates-library/components/TemplatesActionPopover/TemplatesActionPopover'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { useDeploymentContext } from '@cd/context/DeploymentContext/DeploymentContextProvider'
import css from './DTListCardContextMenu.module.scss'

export interface ContextMenuProps extends PopoverProps {
  template: TemplateSummaryResponse
  onPreview: (template: TemplateSummaryResponse) => void
  onOpenEdit: (template: TemplateSummaryResponse) => void
  onDelete: (template: TemplateSummaryResponse) => void
  className?: string
}

export const DTListCardContextMenu: React.FC<ContextMenuProps> = (props): JSX.Element => {
  const { getString } = useStrings()

  const { isReadOnly } = useDeploymentContext()
  const { template, onPreview, onOpenEdit, onDelete, className, ...popoverProps } = props
  const [menuOpen, setMenuOpen] = React.useState(false)
  const items = React.useMemo((): TemplateMenuItem[] => {
    return [
      {
        icon: 'main-view',
        label: getString('connectors.ceAws.crossAccountRoleExtention.step1.p2'),
        disabled: false,
        onClick: () => {
          onPreview(template)
        }
      },
      {
        icon: 'main-share',
        label: getString('templatesLibrary.openEditTemplate'),
        disabled: false,
        onClick: () => {
          onOpenEdit(template)
        }
      },
      {
        icon: 'main-trash',
        label: getString('pipeline.removeTemplateLabel'),
        disabled: isReadOnly,
        onClick: () => {
          onDelete(template)
        }
      }
    ]
  }, [getString, isReadOnly, onPreview, template, onOpenEdit, onDelete])

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
