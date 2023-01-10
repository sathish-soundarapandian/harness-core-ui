/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { defaultTo, get, memoize } from 'lodash-es'
import { Menu } from '@blueprintjs/core'

import { getMultiTypeFromValue, Layout, MultiTypeInputType, SelectOption, Text, useToaster } from '@harness/uicore'
import type { GetDataError } from 'restful-react'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import type { DockerBuildDetailsDTO, Failure, Error, ArtifactoryBuildDetailsDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import ExperimentalInput from '../../K8sServiceSpecForms/ExperimentalInput'
import { BuildDetailsDTO, getTagError, isExecutionTimeFieldDisabled } from '../artifactSourceUtils'
import css from '../../../Common/GenericServiceSpec/GenericServiceSpec.module.scss'

interface DigestFieldProps extends ArtifactSourceRenderProps {
  buildDetailsList?: BuildDetailsDTO
  fetchingDigest: boolean
  fetchDigest: () => void
  fetchDigestError: GetDataError<Failure | Error> | null
  expressions: string[]
}
const DigestField = (props: DigestFieldProps): JSX.Element => {
  const {
    formik,
    path,
    readonly,
    expressions,
    allowableTypes,
    artifactPath,
    fetchingDigest,
    fetchDigest,
    fetchDigestError,
    stageIdentifier,
    stepViewType
  } = props

  const { getString } = useStrings()

  const { showError } = useToaster()

  const [digestList, setDigestList] = useState<SelectOption[]>([])

  useEffect(() => {
    if (fetchDigestError) {
      showError(`Stage ${stageIdentifier}: ${getTagError(fetchDigestError)}`, undefined, 'cd.tag.fetch.error')
    }
  }, [fetchDigestError, showError, stageIdentifier])

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingDigest}
        onClick={handleClick}
      />
    </div>
  ))

  return (
    <div className={css.inputFieldLayout}>
      <ExperimentalInput
        formik={formik}
        selectItems={
          fetchingDigest
            ? [
                {
                  label: 'Loading Digest',
                  value: 'Loading Digest'
                }
              ]
            : digestList
        }
        useValue
        multiTypeInputProps={{
          onFocus: (e: React.ChangeEvent<HTMLInputElement>) => {
            if (
              e?.target?.type !== 'text' ||
              (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
            ) {
              return
            }

            fetchDigest()
          },
          selectProps: {
            items: fetchingDigest
              ? [
                  {
                    label: 'Loading Digest',
                    value: 'Loading Digest'
                  }
                ]
              : digestList,
            usePortal: true,
            addClearBtn: !readonly,
            noResults: (
              <Text lineClamp={1}>
                {getTagError(fetchDigestError) || getString('pipelineSteps.deploy.errors.notags')}
              </Text>
            ),
            itemRenderer,
            allowCreatingNewItems: true,
            popoverClassName: css.selectPopover,
            loadingItems: fetchingDigest
          },
          expressions,
          allowableTypes
        }}
        label={'Digest'}
        name={`${path}.artifacts.${artifactPath}.spec.digest`}
      />
      {getMultiTypeFromValue(
        get(
          formik?.values,

          `${path}.artifacts.${artifactPath}.spec.digest`
        )
      ) === MultiTypeInputType.RUNTIME && (
        <ConfigureOptions
          className={css.configureOptions}
          style={{ alignSelf: 'center' }}
          value={get(formik?.values, `${path}.artifacts.${artifactPath}.spec.digest`)}
          type="String"
          variableName="digest"
          showRequiredField={false}
          isReadonly={readonly}
          showDefaultField={true}
          isExecutionTimeFieldDisabled={isExecutionTimeFieldDisabled(stepViewType as StepViewType)}
          showAdvanced={true}
          onChange={value => {
            formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.digext`, value)
          }}
        />
      )}
    </div>
  )
}

export default DigestField
