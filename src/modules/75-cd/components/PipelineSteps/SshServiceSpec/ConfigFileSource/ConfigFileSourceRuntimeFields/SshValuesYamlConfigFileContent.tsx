/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { Label, Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ConfigFileSourceRenderProps } from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBase'
import { FILE_TYPE_VALUES, ConfigFilesMap } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { MultiConfigSelectField } from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/MultiConfigSelectField/MultiConfigSelectField'
import { isFieldRuntime } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecHelper'
import GitConfigFileStoreRuntimeFields from './GitConfigFileRuntimeField'
import css from '@cd/components/PipelineSteps/SshServiceSpec/SshServiceSpec.module.scss'

interface ConfigFileValuesYamlConfigFileRenderProps extends ConfigFileSourceRenderProps {
  formik?: any
}
const GithubStoreConfigFileSource = (props: ConfigFileValuesYamlConfigFileRenderProps): React.ReactElement => {
  const { template, path, configFilePath, configFile, readonly, formik, stepViewType } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const [filesType, setFilesType] = React.useState('files')
  const [fieldType, setFieldType] = React.useState(FILE_TYPE_VALUES.FILE_STORE)

  React.useEffect(() => {
    if (configFile?.spec?.store?.spec?.files) {
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
      {props.configFile?.spec.store.type === ConfigFilesMap.Harness ? (
        (isFieldRuntime(`${configFilePath}.spec.store.spec.files`, template) ||
          isFieldRuntime(`${configFilePath}.spec.store.spec.secretFiles`, template)) && (
          <div className={css.verticalSpacingInput}>
            <MultiConfigSelectField
              disabled={readonly}
              name={`${path}.${configFilePath}.spec.store.spec.${filesType}`}
              fileType={fieldType}
              expressions={expressions}
              formik={formik}
              stepViewType={stepViewType}
              multiTypeFieldSelectorProps={{
                disableTypeSelection: false,
                label: (
                  <Label htmlFor="files">
                    {fieldType === FILE_TYPE_VALUES.ENCRYPTED
                      ? getString('pipeline.configFiles.encryptedFiles')
                      : getString('pipeline.configFiles.plainText')}
                  </Label>
                )
              }}
            />
          </div>
        )
      ) : (
        <GitConfigFileStoreRuntimeFields {...props} />
      )}
    </Layout.Vertical>
  )
}

export default GithubStoreConfigFileSource
