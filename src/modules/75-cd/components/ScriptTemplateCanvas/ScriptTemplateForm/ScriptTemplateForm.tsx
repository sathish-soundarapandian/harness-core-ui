/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useRef } from 'react'
import { isEmpty } from 'lodash-es'
import type { FormikProps } from 'formik'
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
  onChange?: (data: ShellScriptFormData) => void
}

enum ScriptTemplateFormTabs {
  Script = 'Script',
  Configurations = 'Configurations'
}

export default function ScriptTemplateForm(
  { updateTemplate, template, onChange }: ScriptTemplateFormInterface,
  formikRef: TemplateFormRef
): JSX.Element {
  const { getString } = useStrings()
  const [selectedTabID, setselectedTabID] = useState<TabId>(ScriptTemplateFormTabs.Script)
  const scriptRef = useRef<FormikProps<unknown> | null>(null)
  const configfRef = useRef<FormikProps<unknown> | null>(null)

  React.useImperativeHandle(formikRef, () => ({
    setFieldError(fieldName: string, error: string) {
      if (selectedTabID === ScriptTemplateFormTabs.Script && scriptRef.current) {
        scriptRef.current.setFieldError(fieldName, error)
      }
    },
    isDirty() {
      if (selectedTabID === ScriptTemplateFormTabs.Script && scriptRef.current) {
        return scriptRef.current.dirty
      }

      if (selectedTabID === ScriptTemplateFormTabs.Configurations && configfRef.current) {
        return configfRef.current.dirty
      }
    },
    submitForm() {
      if (selectedTabID === ScriptTemplateFormTabs.Script && scriptRef.current) {
        return scriptRef.current.submitForm()
      }

      if (selectedTabID === ScriptTemplateFormTabs.Configurations && configfRef.current) {
        return configfRef.current.submitForm()
      }
      return Promise.resolve()
    },
    getErrors() {
      if (selectedTabID === ScriptTemplateFormTabs.Script && scriptRef.current) {
        return scriptRef.current.errors
      } else if (selectedTabID === ScriptTemplateFormTabs.Configurations && configfRef.current) {
        return configfRef.current.errors
      }
      return {}
    },

    resetForm() {
      if (selectedTabID === ScriptTemplateFormTabs.Script && scriptRef.current) {
        return scriptRef.current?.resetForm()
      } else if (selectedTabID === ScriptTemplateFormTabs.Configurations && configfRef.current) {
        return configfRef.current.resetForm()
      }
    }
  }))

  async function handleTabChange(newTab: ScriptTemplateFormTabs, prevTab: ScriptTemplateFormTabs): Promise<void> {
    if (prevTab === ScriptTemplateFormTabs.Script && scriptRef.current) {
      await scriptRef.current.submitForm()

      if (isEmpty(scriptRef.current.errors)) {
        setselectedTabID(newTab)
      }
    } else if (prevTab === ScriptTemplateFormTabs.Configurations && configfRef.current) {
      await configfRef.current.submitForm()

      if (isEmpty(configfRef.current.errors)) {
        setselectedTabID(newTab)
      }
    }
  }

  return (
    <Container className={css.configurationTabs}>
      <Tabs id="configurationTabs" selectedTabId={selectedTabID} onChange={handleTabChange}>
        <Tab
          id={ScriptTemplateFormTabs.Script}
          title={getString('common.script')}
          className={css.scriptTab}
          panelClassName={css.tabWidth}
          panel={
            <BaseScriptWithRef
              initialValues={{ name: '', identifier: '', spec: { shell: 'Bash' }, type: 'Script', ...template }}
              updateTemplate={updateTemplate}
              allowableTypes={[]}
              readonly={false}
              ref={scriptRef as StepFormikFowardRef}
              onChange={onChange}
            />
          }
        />
        <Tab
          id={ScriptTemplateFormTabs.Configurations}
          title={'Configuration'}
          className={css.scriptTab}
          panelClassName={css.tabWidth}
          panel={
            <OptionalConfigurationWithRef
              ref={configfRef as StepFormikFowardRef}
              updateTemplate={updateTemplate}
              readonly={false}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
              initialValues={{ onDelegate: true, ...template } as any}
              onChange={onChange}
            />
          }
        />
      </Tabs>
    </Container>
  )
}

export const ScriptTemplateFormWithRef = React.forwardRef(ScriptTemplateForm)
