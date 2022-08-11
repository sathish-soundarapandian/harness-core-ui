/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Color } from '@harness/design-system'
import { Template, TemplateProps } from '@templates-library/components/AbstractTemplate/Template'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import type { NGTemplateInfoConfig } from 'services/template-ng'

import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'
import { StepTemplateCanvasWithRef } from '@templates-library/components/TemplateStudio/StepTemplateCanvas/StepTemplateCanvas'

export class DeploymentTemplate extends Template<NGTemplateInfoConfig> {
  protected type = TemplateType.CustomDeployment
  protected label = 'Deployment Type'
  protected color = Color.GREEN_500

  protected defaultValues: NGTemplateInfoConfig = {
    name: 'Template name',
    identifier: 'Template_name',
    versionLabel: '',
    type: 'CustomDeployment'
  }
  renderTemplateCanvas(props: TemplateProps<NGTemplateInfoConfig>): JSX.Element {
    return <StepTemplateCanvasWithRef ref={props.formikRef as TemplateFormRef<unknown> | undefined} />
  }
}
