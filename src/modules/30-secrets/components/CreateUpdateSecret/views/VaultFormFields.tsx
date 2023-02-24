/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent } from 'react'
import { FormInput, SelectOption, useToaster, Popover, Text } from '@harness/uicore'
import { Radio, RadioGroup } from '@blueprintjs/core'
import type { FormikContextType } from 'formik'
import { ConnectorInfoDTO, SecretDTOV2, useGetGcpRegions } from 'services/cd-ng'

import { useStrings } from 'framework/strings'
import css from '../CreateUpdateSecret.module.scss'
interface VaultFormFieldsProps {
  type: SecretDTOV2['type']
  readonly?: boolean
  editing: boolean
  secretManagerType: ConnectorInfoDTO['type']
}

interface FormikContextProps<T> {
  formik?: FormikContextType<T>
}

const VaultFormFields: React.FC<VaultFormFieldsProps & FormikContextProps<any>> = ({
  formik,
  type,
  editing,
  readonly,
  secretManagerType
}) => {
  const { getString } = useStrings()
  const [regions, setRegions] = React.useState<SelectOption[]>([])
  const { showError } = useToaster()

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
                formik?.setFieldValue('valueType', event.currentTarget.value)
              }}
              selectedValue={formik?.values['valueType']}
            >
              <Radio label={getString('secrets.secret.inlineSecret')} value="Inline" disabled={readonly} />
              <Radio label={getString('secrets.secret.referenceSecret')} value="Reference" />
            </RadioGroup>
          </Popover>
          {formik?.values['valueType'] === 'Inline' ? (
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
            <FormInput.Text
              name="reference"
              label={getString('secrets.secret.referenceSecret')}
              placeholder={getString('secrets.secret.placeholderSecretReference')}
            />
          ) : null}
        </>
      ) : null}
      {type === 'SecretFile' ? (
        <FormInput.FileInput name="file" label={getString('secrets.secret.labelSecretFile')} multiple />
      ) : null}
      {secretManagerType === 'GcpSecretManager' &&
        (formik?.values['valueType'] === 'Reference' ? (
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

              {formik?.values['configureRegions'] ? (
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
      <FormInput.TextArea name="description" isOptional={true} label={getString('description')} />
      <FormInput.KVTagInput name="tags" isOptional={true} label={getString('tagsLabel')} />
    </>
  )
}

export default VaultFormFields
