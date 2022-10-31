/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@wings-software/uicore'
import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudioInternal'
import { Template } from '@templates-library/components/AbstractTemplate/Template'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { ArtifactSourceTemplateCanvasWithRef } from '@cd/components/TemplateStudio/ArtifactSourceTemplateCanvas/ArtifactSourceTemplateCanvas'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { TemplateInputsProps } from '@templates-library/components/TemplateInputs/TemplateInputs'
import { TemplateInputs } from '@templates-library/components/TemplateInputs/TemplateInputs'

export class ArtifactSourceTemplate extends Template {
  protected type = TemplateType.ArtifactSource
  protected label = 'Artifact Source'
  protected icon: IconName = 'docker-step'
  protected allowedScopes = [Scope.PROJECT, Scope.ORG, Scope.ACCOUNT]
  protected colorMap = {
    color: '#D69300',
    stroke: '#FFF9E7',
    fill: '#FFFBEE'
  }
  protected isRemoteEnabled = false

  renderTemplateCanvas(formikRef: TemplateFormRef): JSX.Element {
    return <ArtifactSourceTemplateCanvasWithRef ref={formikRef} />
  }
  renderTemplateInputsForm({ template }: TemplateInputsProps & { accountId: string }): JSX.Element {
    return <TemplateInputs template={template} />
  }
}
