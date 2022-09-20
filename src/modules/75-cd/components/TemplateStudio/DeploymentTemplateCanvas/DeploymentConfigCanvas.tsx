/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useConfirmationDialog } from '@wings-software/uicore'
import { Intent } from '@blueprintjs/core'
import { defaultTo, set } from 'lodash-es'
import produce from 'immer'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'
import { getScopeBasedTemplateRef } from '@pipeline/utils/templateUtils'
import { useGlobalEventListener } from '@common/hooks'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { useStrings } from 'framework/strings'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import {
  getUpdatedDeploymentConfig,
  getUpdatedTemplateDetailsByRef
} from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateForm/components/ExecutionPanel/ExecutionPanelUtils'
import { useDeploymentContext } from '@cd/context/DeploymentContext/DeploymentContextProvider'
import { DeploymentConfigStepDrawer } from '@cd/components/TemplateStudio/DeploymentTemplateCanvas/DeploymentTemplateForm/components/DeploymentConfigStepDrawer/DeploymentConfigStepDrawer'
import { DeploymentConfigFormWithRef } from './DeploymentTemplateForm/DeploymentConfigForm'

function useSaveStepTemplateListener(): void {
  const [savedTemplate, setSavedTemplate] = React.useState<TemplateSummaryResponse>()
  const { getString } = useStrings()
  const {
    drawerData,
    setDrawerData,
    deploymentConfig,
    updateDeploymentConfig,
    templateDetailsByRef,
    setTemplateDetailsByRef
  } = useDeploymentContext()

  const updateViewForSavedStepTemplate = async (): Promise<void> => {
    const templateRef = getScopeBasedTemplateRef(savedTemplate as TemplateSummaryResponse)
    const templateRefObj = {
      templateRef,
      versionLabel: savedTemplate?.versionLabel as string
    }

    const updatedDeploymentConfig = getUpdatedDeploymentConfig({ templateRefObj, deploymentConfig })
    const updatedTemplateDetailsByRef = getUpdatedTemplateDetailsByRef({
      templateDetailsObj: savedTemplate as TemplateSummaryResponse,
      templateDetailsByRef,
      templateRef
    })

    const updatedDrawerData = produce(drawerData, draft => {
      set(draft, 'type', DrawerTypes.AddStep)
      set(draft, 'data.isDrawerOpen', false)
    })
    setTemplateDetailsByRef(updatedTemplateDetailsByRef)
    updateDeploymentConfig(updatedDeploymentConfig)
    setDrawerData(updatedDrawerData)
  }

  const { openDialog: openUseTemplateDialog } = useConfirmationDialog({
    intent: Intent.WARNING,
    cancelButtonText: getString('no'),
    contentText: getString('pipeline.templateSaved', {
      name: savedTemplate?.name,
      entity: savedTemplate?.templateEntityType?.toLowerCase()
    }),
    titleText: `Use Template ${defaultTo(savedTemplate?.name, '')}?`,
    confirmButtonText: getString('yes'),
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        await updateViewForSavedStepTemplate()
      }
    }
  })

  useGlobalEventListener('TEMPLATE_SAVED', event => {
    const { detail: newTemplate } = event
    if (newTemplate) {
      setSavedTemplate(newTemplate)
      setTimeout(() => {
        openUseTemplateDialog()
      }, 0)
    }
  })
}

export const DeploymentConfigCanvasWithRef = React.forwardRef(
  (_props: unknown, formikRef: TemplateFormRef): JSX.Element => {
    useSaveStepTemplateListener()

    return (
      <>
        <DeploymentConfigFormWithRef ref={formikRef} />
        <DeploymentConfigStepDrawer />
      </>
    )
  }
)
