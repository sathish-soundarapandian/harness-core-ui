/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { parse } from 'yaml'
import { Button } from '@wings-software/uicore'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { useToaster } from '@common/exports'
import { useGatewayContext } from '@ce/context/GatewayContext'
import { getK8sYamlSchema } from './GetK8sYamlSchema'
import css from './COGatewayConfig.module.scss'

interface KubernetesRuleYamlEditorProps {
  handleSave?: (data: any) => void
  existingData?: Record<any, any>
  mode?: 'read' | 'edit'
  fileName?: string
}

const KubernetesRuleYamlEditor: React.FC<KubernetesRuleYamlEditorProps> = props => {
  const { showError } = useToaster()
  const { isEditFlow } = useGatewayContext()
  const [yamlHandler, setYamlHandler] = useState<YamlBuilderHandlerBinding | undefined>()
  const [hasYamlEditorChanged, setHasYamlEditorChanged] = useState<boolean>(false)
  const isReadMode = props.mode === 'read'

  const onSave = () => {
    try {
      const errorMap = yamlHandler?.getYAMLValidationErrorMap()
      if (errorMap?.size) {
        throw new Error(errorMap.entries().next().value)
      }
      const data = yamlHandler?.getLatestYaml()
      const dataToSave = parse(data || '')
      props.handleSave?.(dataToSave)
    } catch (err) {
      showError(err.message)
    } finally {
      setHasYamlEditorChanged(false)
    }
  }

  return (
    <div className={css.yamlEditorContainer}>
      <YAMLBuilder
        schema={getK8sYamlSchema({ isEdit: isEditFlow })}
        fileName={props.fileName || 'harness-ccm-autostopping-connector.yaml'}
        entityType="Service"
        bind={setYamlHandler}
        height="400px"
        onChange={setHasYamlEditorChanged}
        existingJSON={props.existingData}
        yamlSanityConfig={{ removeEmptyObject: false, removeEmptyString: false, removeEmptyArray: false }}
        isReadOnlyMode={isReadMode}
        isEditModeSupported={!isReadMode}
      />
      {!isReadMode && (
        <Button
          text={'Validate YAML'}
          intent={'primary'}
          disabled={!hasYamlEditorChanged}
          onClick={onSave}
          style={{ marginTop: 20 }}
        />
      )}
    </div>
  )
}

export default KubernetesRuleYamlEditor
