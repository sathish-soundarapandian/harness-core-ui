/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import { Menu } from '@blueprintjs/core'
import { FormInput, getMultiTypeFromValue, Layout, MultiTypeInputType, Text } from '@harness/uicore'
import { get, memoize } from 'lodash-es'
import type { GetDataError } from 'restful-react'

import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { useMutateAsGet } from '@common/hooks'

import { Failure, useGetLastSuccessfulBuildForDocker } from 'services/cd-ng'
import { useStrings } from 'framework/strings'

import css from '../../ArtifactConnector.module.scss'

const onTagInputFocus = (e: React.FocusEvent<HTMLInputElement>, fetchDigest: () => void): void => {
  if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
    return
  }
  fetchDigest()
}

export function NoDigestResults({
  digestError,

  defaultErrorText
}: {
  digestError: GetDataError<Failure | Error> | null
  defaultErrorText?: string
}): JSX.Element {
  const { getString } = useStrings()

  const getErrorText = useCallback(() => {
    return defaultErrorText || getString('pipelineSteps.deploy.errors.nodigest')
  }, [getString])

  return (
    <Text className={css.padSmall} lineClamp={1}>
      {get(digestError, 'data.message', null) || getErrorText()}
    </Text>
  )
}

function ArtifactDigestField({
  formik,
  buildDetailsLoading,
  expressions,
  allowableTypes,
  isReadonly,
  accountIdentifier,
  orgIdentifier,
  projectIdentifier,
  connecterRefValue
}: any): React.ReactElement {
  const { getString } = useStrings()

  const loadingPlaceholderText = getString('pipeline.artifactsSelection.loadingDigest')
  const digestDefaultValue = [{ label: loadingPlaceholderText, value: loadingPlaceholderText }]
  const [digestItems, setDigestItems] = React.useState<any>(digestDefaultValue)
  const { data, loading, refetch, error } = useMutateAsGet(useGetLastSuccessfulBuildForDocker, {
    queryParams: {
      imagePath: formik?.values?.imagePath,
      connectorRef: connecterRefValue,
      accountIdentifier,
      orgIdentifier,
      projectIdentifier
    },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    lazy: true,
    body: {
      tag: formik?.values?.tag?.value
    }
  })

  React.useEffect(() => {
    if (data && !loading) {
      const options = [
        {
          label: data && data?.data && data?.data?.metadata && data?.data?.metadata?.SHA,
          value: data && data?.data && data?.data?.metadata && data?.data?.metadata?.SHA
        },
        {
          label: data && data?.data && data?.data?.metadata && data?.data?.metadata?.SHAV2,
          value: data && data?.data && data?.data?.metadata && data?.data?.metadata?.SHAV2
        }
      ]
      setDigestItems(options)
    }
  }, [data, loading])

  React.useEffect(() => {
    if (formik?.values?.digest) {
      refetch()
    }
  }, [formik?.values?.digest])

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={buildDetailsLoading}
        onClick={handleClick}
      />
    </div>
  ))

  return (
    <>
      <div className={css.imagePathContainer}>
        <FormInput.MultiTypeInput
          selectItems={digestItems}
          multiTypeInputProps={{
            expressions,
            allowableTypes,
            selectProps: {
              defaultSelectedItem: formik?.values?.digest,
              noResults: <NoDigestResults digestError={error} />,
              items: digestItems,
              addClearBtn: true,
              itemRenderer: itemRenderer,
              allowCreatingNewItems: true,
              addTooltip: true
            },
            onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
              onTagInputFocus(e, refetch)
            }
          }}
          label={getString('pipeline.digest')}
          name="digest"
          className={css.tagInputButton}
        />
        {getMultiTypeFromValue(formik?.values?.digest) === MultiTypeInputType.RUNTIME && (
          <div className={css.configureOptions}>
            <ConfigureOptions
              value={formik?.values?.tag}
              type="String"
              variableName="digest"
              showRequiredField={false}
              showDefaultField={false}
              showAdvanced={true}
              onChange={value => {
                formik.setFieldValue('digest', value)
              }}
              isReadonly={isReadonly}
            />
          </div>
        )}
      </div>
    </>
  )
}

export default ArtifactDigestField
