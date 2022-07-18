/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Layout } from '@harness/uicore'
import { StringKeys, useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import FileStoreList from '@filestore/components/FileStoreList/FileStoreList'
import type { ConfigFileSourceRenderProps } from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBase'
import { isFieldRuntime } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecHelper'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import css from '@cd/components/PipelineSteps/SshServiceSpec/SshServiceSpec.module.scss'

interface K8sValuesYamlConfigFileRenderProps extends ConfigFileSourceRenderProps {
  pathFieldlabel: StringKeys
  formik?: any
  readnonly?: boolean
}
const K8sValuesYamlConfigFileContent = (props: K8sValuesYamlConfigFileRenderProps): React.ReactElement => {
  const { template, path, configFilePath, configFile, readonly, formik } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [filesType, setFilesType] = React.useState('files')
  const [fieldType, setFieldType] = React.useState(FILE_TYPE_VALUES.FILE_STORE)

  React.useEffect(() => {
    if (!Array.isArray(configFile?.spec.store.spec.files)) {
      setFilesType('files')
      setFieldType(FILE_TYPE_VALUES.FILE_STORE)
    } else {
      setFilesType('secretFiles')
      setFieldType(FILE_TYPE_VALUES.ENCRYPTED)
    }
  }, [configFile])

  return (
    <Layout.Vertical
      data-name="config-files"
      key={configFile?.identifier}
      className={cx(css.inputWidth, css.layoutVerticalSpacing)}
    >
      {(isFieldRuntime(`${configFilePath}.spec.store.spec.files`, template) ||
        isFieldRuntime(`${configFilePath}.spec.store.spec.secretFiles`, template)) && (
        <div className={css.verticalSpacingInput}>
          <FileStoreList
            formik={formik}
            labelClassName={css.listLabel}
            label={
              fieldType === FILE_TYPE_VALUES.ENCRYPTED
                ? getString('pipeline.configFiles.encryptedFiles')
                : getString('pipeline.configFiles.plainText')
            }
            name={`${path}.${configFilePath}.spec.store.spec.${filesType}`}
            disabled={readonly}
            style={{ marginBottom: 'var(--spacing-small)' }}
            expressions={expressions}
            type={fieldType}
            isNameOfArrayType
          />
        </div>
      )}
    </Layout.Vertical>
  )
}

export default K8sValuesYamlConfigFileContent
