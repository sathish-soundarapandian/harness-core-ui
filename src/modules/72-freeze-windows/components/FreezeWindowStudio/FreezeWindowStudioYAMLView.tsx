/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo } from 'lodash-es'
import { YamlBuilderMemo } from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import css from './FreezeWindowStudio.module.scss'

const defaultFileName = 'FreezeWindow.yaml'

export const FreezeWindowStudioYAMLView = () => {
  // setYamlFileName
  const [yamlFileName] = React.useState<string>(defaultFileName)
  const [, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()

  React.useEffect(() => {
    // Edit mode
    // setYamlFileName(template.identifier + '.yaml')
  }, []) // template.identifier

  return (
    <div className={css.yamlBuilder}>
      <YamlBuilderMemo
        // key={isYamlEditable.toString()}
        fileName={defaultTo(yamlFileName, defaultFileName)}
        bind={setYamlHandler}
        showSnippetSection={false}
        height={'calc(100vh - 200px)'}
        width="calc(100vw - 400px)"
        entityType="CreatePR" // should be Freeze Window
      />
    </div>
  )
}
