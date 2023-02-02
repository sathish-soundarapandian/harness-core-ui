/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getErrorInfoFromErrorObject, Layout, PageError, Tag, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'

import type { ExecutionPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useGetInputsetYamlV2 } from 'services/pipeline-ng'
import { PageSpinner } from '@common/components'

import { YamlBuilderMemo } from '@common/components/YAMLBuilder/YamlBuilder'
import type { YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import css from './ExecutionInputsView.module.scss'

const defaultFileName = 'Inputs.yaml'

const yamlBuilderProps: YamlBuilderProps = {
  fileName: defaultFileName,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

export default function ExecutionInputsView(): React.ReactElement {
  const { projectIdentifier, orgIdentifier, accountId, executionIdentifier } =
    useParams<PipelineType<ExecutionPathProps>>()
  const { getString } = useStrings()

  const { data, loading, error, refetch } = useGetInputsetYamlV2({
    planExecutionId: executionIdentifier,
    queryParams: {
      orgIdentifier,
      resolveExpressions: true,
      projectIdentifier,
      accountIdentifier: accountId
    },
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  })

  const [inputSetYaml, setInputSetYaml] = useState('')
  useEffect(() => {
    // Won't actually render out RunPipelineForm
    /* istanbul ignore else */ if (data?.data?.inputSetYaml) {
      setInputSetYaml(data.data?.inputSetYaml)
    }
  }, [data])

  if (loading) {
    return <PageSpinner />
  }

  if (error) {
    return <PageError onClick={() => refetch()} message={getErrorInfoFromErrorObject(error)} />
  }
  return (
    <div className={css.main}>
      {!inputSetYaml ? (
        <Text padding="medium" margin="medium">
          {getString('pipeline.inputSets.noRuntimeInputsWhileExecution')}
        </Text>
      ) : (
        <>
          <Layout.Vertical padding="xlarge">
            <YamlBuilderMemo
              {...yamlBuilderProps}
              existingYaml={inputSetYaml}
              height="72vh"
              width="100%"
              isReadOnlyMode={true}
              isEditModeSupported={false}
            />
          </Layout.Vertical>
          <Tag className={css.buttonsWrapper}>{getString('common.readOnly')}</Tag>
        </>
      )}
    </div>
  )
}
