/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Label } from '@harness/uicore'
import type { ConfigFileSourceRenderProps } from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBase'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FILE_TYPE_VALUES } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { isFieldRuntime } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpecHelper'
import { MultiConfigSelectField } from '@pipeline/components/ConfigFilesSelection/ConfigFilesWizard/ConfigFilesSteps/MultiConfigSelectField/MultiConfigSelectField'
import css from './GitConfigFileRuntimeField.module.scss'

const HarnessFSConfigFileRuntimeField = (props: ConfigFileSourceRenderProps): React.ReactElement => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { template, path, configFilePath, configFile, readonly, formik, stepViewType } = props

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
    <>
      {(isFieldRuntime(`${configFilePath}.spec.store.spec.files`, template) ||
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
      )}
    </>
  )
}
export default HarnessFSConfigFileRuntimeField
