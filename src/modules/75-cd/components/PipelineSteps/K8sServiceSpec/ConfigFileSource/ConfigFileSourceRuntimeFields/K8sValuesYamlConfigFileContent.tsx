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
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
// import { isFieldfromTriggerTabDisabled } from '../ManifestSourceUtils'
import css from '../../KubernetesManifests/KubernetesManifests.module.scss'

interface K8sValuesYamlConfigFileRenderProps extends ConfigFileSourceRenderProps {
  pathFieldlabel: StringKeys
}
const K8sValuesYamlConfigFileContent = (props: K8sValuesYamlConfigFileRenderProps): React.ReactElement => {
  const {
    template,
    path,
    configFilePath,
    configFiles,
    configFile
    // fromTrigger,
    // allowableTypes,
    // readonly,
    // formik,
    // stageIdentifier,
    // pathFieldlabel
  } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [filesType, setFilesType] = React.useState('files')
  const [fieldType, setFieldType] = React.useState('fileStore')

  React.useEffect(() => {
    if (!Array.isArray(configFile?.spec.store.spec.files)) {
      setFilesType('files')
      setFieldType('fileStore')
    } else {
      setFilesType('secretFiles')
      setFieldType('encrypted')
    }
  }, [configFile])

  //   const isFieldDisabled = (fieldName: string): boolean => {
  //     // /* instanbul ignore else */
  //     if (readonly) {
  //       return true
  //     }
  //     return isFieldfromTriggerTabDisabled(
  //       fieldName,
  //       formik,
  //       stageIdentifier,
  //       manifest?.identifier as string,
  //       fromTrigger
  //     )
  //   }

  return (
    <Layout.Vertical
      data-name="config-files"
      key={configFiles?.identifier}
      className={cx(css.inputWidth, css.layoutVerticalSpacing)}
    >
      {(isFieldRuntime(`${configFilePath}.spec.store.spec.files`, template) ||
        isFieldRuntime(`${configFilePath}.spec.store.spec.secretFiles`, template)) && (
        <div className={css.verticalSpacingInput}>
          <FileStoreList
            labelClassName={css.listLabel}
            label={getString('pipeline.manifestType.valuesYamlPath')}
            name={`${path}.${configFilePath}.spec.store.spec.${filesType}`}
            placeholder={getString('pipeline.manifestType.manifestPathPlaceholder')}
            // disabled={isFieldDisabled(`${manifestPath}.spec.valuesPaths`)}
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
