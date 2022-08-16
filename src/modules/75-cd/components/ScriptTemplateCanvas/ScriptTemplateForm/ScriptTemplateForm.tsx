/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import type { TabId } from '@blueprintjs/core'
import { Container, MultiTypeInputType, Tab, Tabs } from '@wings-software/uicore'

import type { NGTemplateInfoConfig } from 'services/template-ng'

import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'

import { useStrings } from 'framework/strings'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { ShellScriptFormData } from '@cd/components/PipelineSteps/ShellScriptStep/shellScriptTypes'
import { BaseScriptWithRef } from './BaseScriptForm'
import { OptionalConfigurationWithRef } from './OptionalConfigurations'
import css from './ScriptTemplateForm.module.scss'

export interface ScriptTemplateFormInterface {
  template?: NGTemplateInfoConfig
  updateTemplate?: (template: ShellScriptFormData) => void
}

export default function ScriptTemplateForm(
  { updateTemplate, template }: ScriptTemplateFormInterface,
  formikRef: TemplateFormRef
): JSX.Element {
  const { getString } = useStrings()
  const [selectedTabID, setselectedTabID] = useState<TabId>(getString('common.script'))

  return (
    <Container className={css.configurationTabs}>
      <Tabs id="configurationTabs" selectedTabId={selectedTabID} onChange={nextTab => setselectedTabID(nextTab)}>
        <Tab
          id={getString('common.script')}
          title={getString('common.script')}
          className={css.scriptTab}
          panel={
            <BaseScriptWithRef
              initialValues={{ name: '', identifier: '', spec: { shell: 'Bash' }, type: 'Script', ...template }}
              updateTemplate={updateTemplate}
              allowableTypes={[]}
              readonly={false}
              ref={formikRef as StepFormikFowardRef}
            />
          }
        />
        <Tab
          id={'configuration'}
          title={'Configuration'}
          className={css.scriptTab}
          panel={
            <OptionalConfigurationWithRef
              ref={formikRef as StepFormikFowardRef}
              updateTemplate={updateTemplate}
              readonly={false}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
              initialValues={{ name: '', identifier: '', spec: { shell: 'Bash' }, type: 'Script', ...template }}
            />
          }
        />
      </Tabs>
    </Container>
  )
}

export const ScriptTemplateFormWithRef = React.forwardRef(ScriptTemplateForm)
