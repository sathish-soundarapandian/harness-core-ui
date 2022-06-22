/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, MultiTypeInputType, Tab, Tabs } from '@wings-software/uicore'

import type { NGTemplateInfoConfig } from 'services/template-ng'

import type { TemplateFormRef } from '@templates-library/components/TemplateStudio/TemplateStudio'

import { useStrings } from 'framework/strings'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'

import { BaseScriptWithRef } from './BaseScript'
import type { TabId } from '@blueprintjs/core'
import { OptionalConfigurationWithRef } from './OptionalConfigurations'
import css from './ScriptTemplateForm.module.scss'

interface ScriptTemplateFormInterface {
  template?: NGTemplateInfoConfig
  updateTemplate?: (template: any) => void
}

export default function ScriptTemplateForm(
  { updateTemplate, template }: ScriptTemplateFormInterface,
  formikRef: TemplateFormRef
): JSX.Element {
  const { getString } = useStrings()
  const [selectedTabID, setselectedTabID] = useState<TabId>(getString('script'))

  return (
    <Container>
      {/* {(loadingGetMonitoredService || loadingFetchMonitoredServiceYAML || loadingUpdateMonitoredService) && (
        <PageSpinner />
      )} */}
      <Tabs id="configurationTabs" selectedTabId={selectedTabID} onChange={nextTab => setselectedTabID(nextTab)}>
        <Tab
          id={getString('script')}
          title={getString('script')}
          className={css.scriptTab}
          panel={
            <BaseScriptWithRef
              initialValues={{ name: '', identifier: '', spec: { shell: 'Bash' }, type: 'Script', ...template }}
              updateTemplate={updateTemplate}
              // onChange={data => onChange?.(this.processFormData(data))}
              allowableTypes={[]}
              stepViewType={StepViewType.Template}
              isNewStep={true}
              readonly={false}
              ref={formikRef as any}
            />
          }
        />
        <Tab
          id={getString('pipelineSteps.optionalConfiguration')}
          title={getString('pipelineSteps.optionalConfiguration')}
          className={css.scriptTab}
          panel={
            <OptionalConfigurationWithRef
              ref={formikRef as any}
              // isNewStep={true}
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
