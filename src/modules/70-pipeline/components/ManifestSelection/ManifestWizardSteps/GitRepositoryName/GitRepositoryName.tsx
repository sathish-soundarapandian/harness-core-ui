/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { AllowedTypes, FormInput, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import { String, useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import css from '../ManifestWizardSteps.module.scss'
import helmcss from '../HelmWithGIT/HelmWithGIT.module.scss'

interface GitRepositoryNameProps {
  accountUrl: string
  expressions: Array<string>
  allowableTypes: AllowedTypes
  fieldValue: string | undefined
  changeFieldValue: (val: string) => void
  isReadonly?: boolean
}

function GitRepositoryName({
  accountUrl,
  expressions,
  allowableTypes,
  fieldValue,
  changeFieldValue,
  isReadonly = false
}: GitRepositoryNameProps): React.ReactElement {
  const { getString } = useStrings()
  return (
    <div className={helmcss.repoNameSection}>
      <div className={helmcss.repoName}>
        <FormInput.MultiTextInput
          multiTextInputProps={{ expressions, allowableTypes }}
          placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
          label={getString('common.repositoryName')}
          name="repoName"
          className={helmcss.reponameField}
        />
        {getMultiTypeFromValue(fieldValue) === MultiTypeInputType.RUNTIME && (
          <ConfigureOptions
            style={{ marginTop: 2 }}
            value={fieldValue as string}
            type="String"
            variableName="repoName"
            showRequiredField={false}
            showDefaultField={false}
            showAdvanced={true}
            onChange={changeFieldValue}
            isReadonly={isReadonly}
          />
        )}
      </div>

      <div className={helmcss.halfWidth}>
        <String stringID="common.git.gitAccountUrl" className={css.accountUrl} />:
        <span className={css.repoNameUrl}>{`${accountUrl}`}</span>
      </div>
    </div>
  )
}

export default GitRepositoryName
