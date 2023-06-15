/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent, useState } from 'react'
import {
  FormInput,
  SelectOption,
  useToaster,
  Popover,
  Text,
  Layout,
  Button,
  ButtonVariation,
  getErrorInfoFromErrorObject,
  DateInput,
  Label
} from '@harness/uicore'
import { pick, omit } from 'lodash-es'
import { FontVariation, Color } from '@harness/design-system'
import { Radio, RadioGroup } from '@blueprintjs/core'
import type { FormikContextType } from 'formik'
import { validateSecretRef } from '@harnessio/react-ng-manager-client'

import cx from 'classnames'
import { ConnectorInfoDTO, SecretDTOV2, SecretRequestWrapper, useGetGcpRegions } from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import type { SecretFormData } from '../CreateUpdateSecret'
import css from '../CreateUpdateSecret.module.scss'
interface VaultFormFieldsProps {
  type: SecretDTOV2['type']
  readonly?: boolean
  editing: boolean
  secretManagerType: ConnectorInfoDTO['type']
  orgIdentifier?: string
  projIdentifier?: string
  accountId: string
  createSecretTextData: (data: SecretFormData, editFlag?: boolean) => SecretRequestWrapper
}

interface FormikContextProps<T> {
  formik: FormikContextType<T>
}

const getReferenceTestData = (data: any) => {
  return {
    secret: {
      ...omit(data.secret, ['type']),
      spec: {
        ...pick(data.secret.spec, ['value']),
        ...(data.secret.spec.additionalMetadata && { additional_metadata: data.secret.spec.additionalMetadata }),
        type: data.secret.type,
        secret_manager_identifier: data.secret.spec.secretManagerIdentifier,
        value_type: data.secret.spec.valueType
      }
    }
  }
}

const VaultFormFields: React.FC<VaultFormFieldsProps & FormikContextProps<any>> = ({
  formik,
  type,
  editing,
  readonly,
  secretManagerType,
  orgIdentifier,
  projIdentifier,
  accountId,
  createSecretTextData
}) => {
  const { getString } = useStrings()
  const [regions, setRegions] = React.useState<SelectOption[]>([])
  const { showError } = useToaster()
  const [validPath, setValidPath] = useState<boolean>()
  const [testSecretRefInProgress, setTestSecretRefInProgress] = useState<boolean>(false)
  const { data: regionData, error, refetch } = useGetGcpRegions({ lazy: true })
  if (error) {
    showError(error.message)
  }
  const gcpSmInEditMode = () => secretManagerType === 'GcpSecretManager' && editing
  React.useEffect(() => {
    if (regionData?.data && regionData?.data.length) {
      const regionValues = (regionData?.data || []).map(region => ({
        value: region,
        label: region
      }))
      setRegions(regionValues as SelectOption[])
    }
  }, [regionData])
  React.useEffect(() => {
    if (secretManagerType === 'GcpSecretManager') {
      refetch()
    }
  }, [secretManagerType])

  const testSecretRef = async () => {
    setTestSecretRefInProgress(true)
    try {
      const data = await validateSecretRef({
        pathParams: { org: orgIdentifier, project: projIdentifier, account: accountId },

        body: { ...getReferenceTestData(createSecretTextData(formik?.values, editing)) }
      })

      if (data.content?.success) {
        setValidPath(true)
      } else {
        setValidPath(false)
      }
    } catch (e) {
      setValidPath(false)
      showError(getErrorInfoFromErrorObject(e))
    } finally {
      setTestSecretRefInProgress(false)
    }
  }
  const showExpiresOn =
    ((type === 'SecretText' && formik.values['valueType'] === 'Inline') || type === 'SecretFile') &&
    secretManagerType === 'AzureKeyVault'
  const getvaluesForDisabledTest = () => {
    const version = formik?.values['version']?.trim()
    const ref = formik?.values['reference']?.trim()
    const name = formik?.values['name']?.trim()
    return { version, ref, name }
  }
  const getTestDisabledMessage = () => {
    const { version, ref, name } = getvaluesForDisabledTest()
    if (secretManagerType === 'GcpSecretManager' && (!version || !ref || !name)) {
      return getString('secrets.secret.secretNameReferenceAndVersionRequired')
    } else if (!ref || !name) {
      return getString('secrets.secret.referenceRequired')
    } else {
      return undefined
    }
  }
  const isTestBtnDisabled = () => {
    const { version, ref, name } = getvaluesForDisabledTest()
    return !ref || !name || (secretManagerType === 'GcpSecretManager' && !version)
  }
  return (
    <>
      {type === 'SecretText' ? (
        <>
          <Popover
            interactionKind={'hover-target'}
            position="top"
            className={css.hoverMsg}
            targetClassName={css.hoverMsgTarget}
            content={<Text padding="medium">{getString('secrets.gcpSecretEdit')}</Text>}
            disabled={!gcpSmInEditMode()}
          >
            <RadioGroup
              disabled={gcpSmInEditMode()}
              inline={true}
              onChange={(event: FormEvent<HTMLInputElement>) => {
                formik.setFieldValue('valueType', event.currentTarget.value)
              }}
              selectedValue={formik.values['valueType']}
            >
              <Radio label={getString('secrets.secret.inlineSecret')} value="Inline" disabled={readonly} />
              <Radio label={getString('secrets.secret.referenceSecret')} value="Reference" />
            </RadioGroup>
          </Popover>
          {formik.values['valueType'] === 'Inline' ? (
            <FormInput.Text
              name="value"
              label={getString('secrets.labelValue')}
              placeholder={editing ? getString('encrypted') : getString('secrets.secret.placeholderSecretValue')}
              inputGroup={{ type: 'password' }}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                event.target.value.trim()
              }}
            />
          ) : null}
          {formik?.values['valueType'] === 'Reference' ? (
            <Layout.Vertical spacing={'none'} className={css.refernceSecretLayout}>
              <Layout.Horizontal
                flex={{ alignItems: 'flex-end', justifyContent: 'space-between' }}
                margin={{ bottom: 'small' }}
              >
                <FormInput.Text
                  className={css.referenceSecret}
                  name="reference"
                  disabled={testSecretRefInProgress}
                  intent={validPath === false ? 'danger' : 'none'}
                  onChange={() => {
                    setValidPath(undefined)
                  }}
                  label={getString('secrets.secret.referenceSecret')}
                  placeholder={getString('secrets.secret.placeholderSecretReference')}
                />
                <Button
                  className={cx({ [css.testBtn]: !isTestBtnDisabled() })}
                  tooltipProps={{
                    className: cx({ [css.testBtn]: isTestBtnDisabled() })
                  }}
                  tooltip={getTestDisabledMessage()}
                  disabled={isTestBtnDisabled()}
                  text={getString('test')}
                  onClick={testSecretRef}
                  variation={ButtonVariation.SECONDARY}
                ></Button>
              </Layout.Horizontal>
              {validPath !== undefined &&
                (validPath ? (
                  <Text
                    font={{ variation: FontVariation.FORM_LABEL }}
                    icon={'command-artifact-check'}
                    iconProps={{ intent: 'success', color: Color.GREEN_800, size: 12 }}
                  >
                    {getString('secrets.secret.validReferencePath')}
                  </Text>
                ) : (
                  <Text
                    font={{ variation: FontVariation.FORM_MESSAGE_DANGER }}
                    icon={'circle-cross'}
                    iconProps={{ intent: 'danger', size: 12 }}
                  >
                    {getString('secrets.secret.invalidReferencePath')}
                  </Text>
                ))}
            </Layout.Vertical>
          ) : null}
        </>
      ) : null}
      {type === 'SecretFile' ? (
        <FormInput.FileInput name="file" label={getString('secrets.secret.labelSecretFile')} multiple />
      ) : null}
      {secretManagerType === 'GcpSecretManager' &&
        (formik.values['valueType'] === 'Reference' ? (
          <>
            <FormInput.Text name="version" label={getString('version')} />
          </>
        ) : (
          <Popover
            interactionKind={'hover-target'}
            position="top"
            className={css.hoverMsg}
            targetClassName={css.hoverMsgTarget}
            content={<Text padding="medium">{getString('secrets.gcpSecretEdit')}</Text>}
            disabled={!gcpSmInEditMode()}
          >
            <>
              <FormInput.CheckBox
                name="configureRegions"
                label={getString('secrets.secret.configureRegion')}
                disabled={gcpSmInEditMode()}
              />

              {formik.values['configureRegions'] ? (
                <FormInput.MultiSelect
                  name="regions"
                  label={getString('secrets.secret.region')}
                  items={regions}
                  disabled={gcpSmInEditMode()}
                />
              ) : null}
            </>
          </Popover>
        ))}
      {showExpiresOn && (
        <>
          <Label className={css.expiresOnLabel}>
            {getString('common.headerWithOptionalText', { header: getString('common.expiresOn') })}
          </Label>
          <DateInput
            timePrecision="minute"
            value={formik.values.expiresOn}
            onChange={(value: string | undefined, _err?: string) => {
              formik.setFieldValue('expiresOn', value)
            }}
            data-testid="expiresOn"
          />
        </>
      )}

      <FormInput.TextArea name="description" isOptional={true} label={getString('description')} />
      <FormInput.KVTagInput name="tags" isOptional={true} label={getString('tagsLabel')} />
    </>
  )
}

export default VaultFormFields
