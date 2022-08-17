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
import { ScriptTemplateCanvasWithRef } from '@cd/components/ScriptTemplateCanvas/ScriptTemplateCanvas'

export class SecretManagerTemplate extends Template<NGTemplateInfoConfig> {
  protected label = 'Secret Manager'
  protected type = TemplateType.SecretManager
  protected name = 'Secret Manager Template'
  protected color = Color.TEAL_700
  protected isEnabled = true

  protected defaultValues: NGTemplateInfoConfig = {
    name: 'Template name',
    identifier: 'Template_name',
    versionLabel: '',
    type: 'SecretManager'
  }
  renderTemplateCanvas(props: TemplateProps<NGTemplateInfoConfig>): JSX.Element {
    return <ScriptTemplateCanvasWithRef ref={props.formikRef as TemplateFormRef<unknown> | undefined} />
  }
}
