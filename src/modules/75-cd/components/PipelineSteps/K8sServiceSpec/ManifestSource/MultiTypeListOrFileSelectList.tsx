/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypes, MultiTypeInputType } from '@harness/uicore'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { isExecutionTimeFieldDisabled } from '@pipeline/utils/runPipelineUtils'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { FileSelectList } from '@filestore/components/FileStoreList/FileStoreList'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { SELECT_FILES_TYPE } from '@filestore/utils/constants'
import List from '@common/components/List/List'
import { FileUsage } from '@filestore/interfaces/FileStore'
import type { ManifestStores } from '@pipeline/components/ManifestSelection/ManifestInterface'
import css from '../KubernetesManifests/KubernetesManifests.module.scss'

interface MultiTypeListOrFileSelectListProps {
  name: string
  label: string
  placeholder: string
  disabled: boolean
  manifestStoreType?: ManifestStores
  fileUsage?: FileUsage
  allowableTypes?: AllowedTypes
  stepViewType?: StepViewType
  formik?: any
  isNameOfArrayType?: boolean
  allowOnlyOne?: boolean
}

export default function MultiTypeListOrFileSelectList(props: MultiTypeListOrFileSelectListProps): React.ReactElement {
  const {
    allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
    formik,
    stepViewType,
    name,
    label,
    placeholder,
    disabled,
    manifestStoreType,
    isNameOfArrayType,
    fileUsage = FileUsage.MANIFEST_FILE,
    allowOnlyOne = false
  } = props
  const { expressions } = useVariablesExpression()

  return (
    <MultiTypeFieldSelector
      name={name}
      label={label}
      defaultValueToReset={[]}
      hideError
      skipRenderValueInExpressionLabel
      allowedTypes={
        (allowableTypes as MultiTypeInputType[]).filter(
          allowedType => allowedType !== MultiTypeInputType.EXPRESSION
        ) as AllowedTypes
      }
      supportListOfExpressions={true}
      style={{ flexGrow: 1, marginBottom: 0 }}
      enableConfigureOptions={true}
      configureOptionsProps={{
        isExecutionTimeFieldDisabled: isExecutionTimeFieldDisabled(stepViewType as StepViewType)
      }}
    >
      {manifestStoreType === ManifestStoreMap.Harness ? (
        <FileSelectList
          labelClassName={css.listLabel}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          style={{ marginBottom: 'var(--spacing-small)' }}
          expressions={expressions}
          isNameOfArrayType={isNameOfArrayType}
          type={SELECT_FILES_TYPE.FILE_STORE}
          fileUsage={fileUsage}
          formik={formik}
          allowOnlyOne={allowOnlyOne}
        />
      ) : (
        <List
          labelClassName={css.listLabel}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
          style={{ marginBottom: 'var(--spacing-small)' }}
          expressions={expressions}
          isNameOfArrayType={isNameOfArrayType}
          allowOnlyOne={allowOnlyOne}
        />
      )}
    </MultiTypeFieldSelector>
  )
}
