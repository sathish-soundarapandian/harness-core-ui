/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { SetStateAction, Dispatch } from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import {
  TextInput,
  Text,
  MultiTypeInputType,
  Container,
  getMultiTypeFromValue,
  AllowedTypes
} from '@wings-software/uicore'
import { get, set } from 'lodash-es'
import { FontVariation } from '@harness/design-system'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import type { UseStringsReturn } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { ConnectorRefWidth } from '@pipeline/utils/constants'
import {
  generateSchemaForLimitCPU,
  generateSchemaForLimitMemory
} from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  handleCIConnectorRefOnChange,
  ConnectionType,
  ConnectorRefInterface
} from '@pipeline/components/PipelineInputSetForm/CICodebaseInputSetForm'
import { isRuntimeInput } from '@pipeline/utils/CIUtils'
import { Connectors } from '@connectors/constants'
import { getCompleteConnectorUrl } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { isMultiTypeRuntime } from '@common/utils/utils'
import css from './RightBar.module.scss'

const onlyPositiveIntegerKeyRef = 'pipeline.onlyPositiveInteger'
export interface CodebaseRuntimeInputsInterface {
  connectorRef?: boolean
  repoName?: boolean
}

export const runtimeInputGearWidth = 58

const getConnectorWidth = ({
  connectorWidth,
  connectorRef
}: {
  connectorWidth?: number
  connectorRef?: string
}): number | undefined => {
  if (connectorWidth) {
    // connectorRef will be undefined for use in Steps and never subtract runtimeInputGearWidth
    return !isRuntimeInput(connectorRef) ? connectorWidth : connectorWidth - runtimeInputGearWidth
  }
  return (!isRuntimeInput(connectorRef) && ConnectorRefWidth.RightBarView) || undefined
}

export const renderConnectorAndRepoName = ({
  values,
  setFieldValue,
  connectorUrl,
  connectionType,
  setConnectionType,
  setConnectorUrl,
  connector,
  getString,
  errors,
  loading,
  accountId,
  projectIdentifier,
  orgIdentifier,
  repoIdentifier,
  branch,
  expressions,
  isReadonly,
  setCodebaseRuntimeInputs,
  codebaseRuntimeInputs,
  connectorWidth,
  connectorAndRepoNamePath,
  allowableTypes,
  codeBaseInputFieldFormName,
  onConnectorChange
}: {
  values: { [key: string]: any }
  setFieldValue: (field: string, value: any) => void
  connectorUrl: string
  connectionType: string
  setConnectionType: Dispatch<SetStateAction<string>>
  setConnectorUrl: Dispatch<SetStateAction<string>>
  connector?: ConnectorInfoDTO
  getString: UseStringsReturn['getString']
  errors: { [key: string]: any }
  loading: boolean
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
  repoIdentifier?: string
  branch?: string
  expressions: string[]
  isReadonly: boolean
  setCodebaseRuntimeInputs: Dispatch<SetStateAction<CodebaseRuntimeInputsInterface>>
  codebaseRuntimeInputs: CodebaseRuntimeInputsInterface
  connectorWidth?: number
  connectorAndRepoNamePath?: string // coming from step / input set
  allowableTypes: AllowedTypes // expression can be used for repoName
  codeBaseInputFieldFormName?: { [key: string]: string }
  onConnectorChange?: () => void // refetch onEdit connector
}): JSX.Element => {
  const connectorFieldName = connectorAndRepoNamePath ? `${connectorAndRepoNamePath}.connectorRef` : 'connectorRef'
  const connectorValue = get(values, connectorFieldName)
  const repoNameFieldName = connectorAndRepoNamePath ? `${connectorAndRepoNamePath}.repoName` : 'repoName'
  const repoNameValue = get(values, repoNameFieldName)
  const repoNameWidth =
    connectorWidth && isRuntimeInput(repoNameValue) ? connectorWidth + runtimeInputGearWidth : connectorWidth

  return (
    <>
      <Container className={cx(css.bottomMargin3)}>
        <FormMultiTypeConnectorField
          name={connectorFieldName}
          type={[
            Connectors.GIT,
            Connectors.GITHUB,
            Connectors.GITLAB,
            Connectors.BITBUCKET,
            Connectors.AWS_CODECOMMIT,
            Connectors.AZURE_REPO
          ]}
          label={getString('connector')}
          width={getConnectorWidth({ connectorWidth, connectorRef: values.connectorRef })}
          error={errors?.connectorRef}
          placeholder={loading ? getString('loading') : getString('connectors.selectConnector')}
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
          multiTypeProps={{
            expressions,
            disabled: isReadonly,
            allowableTypes
          }}
          tooltipProps={{ dataTooltipId: 'rightBarForm_connectorRef' }}
          setRefValue
          onChange={(value, _valueType, connectorRefType) => {
            handleCIConnectorRefOnChange({
              value: value as ConnectorRefInterface,
              connectorRefType,
              setConnectionType,
              setConnectorUrl,
              setFieldValue,
              codeBaseInputFieldFormName,
              onConnectorChange
            })
            setCodebaseRuntimeInputs({
              ...codebaseRuntimeInputs,
              connectorRef: isRuntimeInput(value),
              repoName: isMultiTypeRuntime(connectorRefType)
            })
          }}
        />
      </Container>

      {!isRuntimeInput(connectorValue) && connectionType === ConnectionType.Repo ? (
        <Container width={repoNameWidth}>
          <Text
            font={{ variation: FontVariation.FORM_LABEL }}
            margin={{ bottom: 'xsmall' }}
            tooltipProps={{ dataTooltipId: 'rightBarForm_repoName' }}
          >
            {getString('common.repositoryName')}
          </Text>
          <TextInput name={repoNameFieldName} value={connectorUrl} style={{ flexGrow: 1 }} disabled />
        </Container>
      ) : (
        <>
          <Container width={repoNameWidth} className={cx(css.bottomMargin3)}>
            <MultiTypeTextField
              key={`connector-runtimeinput-${codebaseRuntimeInputs.connectorRef}`} // handle reload RepoName from ConnectorRef as Runtime to Fixed
              label={
                <Text
                  font={{ variation: FontVariation.FORM_LABEL }}
                  margin={{ bottom: 'xsmall' }}
                  tooltipProps={{ dataTooltipId: 'rightBarForm_repoName' }}
                >
                  {getString('common.repositoryName')}
                </Text>
              }
              name={repoNameFieldName}
              multiTextInputProps={{
                multiTextInputProps: {
                  expressions,
                  allowableTypes
                },
                disabled:
                  (!repoNameValue && loading) ||
                  isReadonly ||
                  (isRuntimeInput(connectorValue) && isRuntimeInput(repoNameValue)) // connector is a runtime input
              }}
            />
          </Container>
          {!isRuntimeInput(connectorValue) && !isRuntimeInput(repoNameValue) && connectorUrl?.length > 0 && (
            <div className={css.predefinedValue}>
              <Text lineClamp={1}>
                {getCompleteConnectorUrl({
                  partialUrl: connectorUrl,
                  repoName: repoNameValue,
                  connectorType: get(connector, 'type'),
                  gitAuthProtocol: get(connector, 'spec.authentication.type')
                })}
              </Text>
            </div>
          )}
        </>
      )}
    </>
  )
}

export const validateCIForm = ({
  values,
  getString
}: {
  values: { [key: string]: any }
  getString: UseStringsReturn['getString']
}): { [key: string]: any } => {
  const errors = {}
  if (getMultiTypeFromValue(values.depth) === MultiTypeInputType.FIXED) {
    try {
      Yup.number()
        .notRequired()
        .integer(getString(onlyPositiveIntegerKeyRef))
        .positive(getString(onlyPositiveIntegerKeyRef))
        .typeError(getString(onlyPositiveIntegerKeyRef))
        .validateSync(values.depth === '' ? undefined : values.depth)
    } catch (error) {
      set(errors, 'depth', error.message)
    }
  }
  try {
    generateSchemaForLimitMemory({ getString }).validateSync(values.memoryLimit)
  } catch (error) {
    set(errors, 'memoryLimit', error.message)
  }
  try {
    generateSchemaForLimitCPU({ getString }).validateSync(values.cpuLimit)
  } catch (error) {
    set(errors, 'cpuLimit', error.message)
  }
  return errors
}
