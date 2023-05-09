/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo, pick } from 'lodash-es'
import * as Yup from 'yup'

import type { StepProps } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import {
  Checkbox,
  Text,
  FormInput,
  Formik,
  FormikForm,
  Layout,
  Button,
  ButtonVariation,
  Container
} from '@harness/uicore'
import {
  useCreateIpAllowlistConfigMutation,
  CreateIpAllowlistConfigOkResponse,
  UpdateIpAllowlistConfigOkResponse,
  useUpdateIpAllowlistConfigMutation
} from '@harnessio/react-ng-manager-client'

import { regexIPAllowlist } from '@common/utils/StringUtils'
import { useToaster } from '@common/exports'
import type { IIPAllowlistForm, SourceType } from '@auth-settings/interfaces/IPAllowlistInterface'
import { buildCreateIPAllowlistPayload, buildUpdateIPAllowlistPayload } from '@auth-settings/utils'
import { String, useStrings } from 'framework/strings'
import css from '../CreateIPAllowlistWizard.module.scss'

interface StepDefineRangeProps extends StepProps<IIPAllowlistForm> {
  data: IIPAllowlistForm
  name: string
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
}

export type StepDefineRangeForm = Partial<
  Pick<IIPAllowlistForm, 'allowSourceTypeUI' | 'allowSourceTypeAPI' | 'ipAddress'> & {
    allowSourceType: Array<SourceType>
  }
>

const StepDefineRange: React.FC<StepDefineRangeProps> = props => {
  const { prevStepData, nextStep, name, setIsEditMode, isEditMode: isEdit, data } = props
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { isLoading: isCreating, mutate: createIPAllowlist } = useCreateIpAllowlistConfigMutation()
  const { isLoading: isUpdating, mutate: updateIPAllowlist } = useUpdateIpAllowlistConfigMutation()

  const onDefineRangeSubmit = (formData: any): void => {
    if (isEdit) {
      const updateIPAllowlistPayload = buildUpdateIPAllowlistPayload({ ...prevStepData, ...formData })
      updateIPAllowlist(updateIPAllowlistPayload, {
        onSuccess: (updatedIPAllowlist: UpdateIpAllowlistConfigOkResponse) => {
          showSuccess(
            getString('authSettings.ipAddress.ipAllowlistUpdated', {
              name: updatedIPAllowlist?.content?.ip_allowlist_config.name
            })
          )
          nextStep?.({
            ...prevStepData,
            ...formData
          })
        },
        onError: error => {
          showError(
            defaultTo(
              (error as Error).message,
              getString('authSettings.ipAddress.errorWhileUpdating', {
                name: formData.name
              })
            )
          )
        }
      })
    } else {
      const createIPAllowlistPayload = buildCreateIPAllowlistPayload({ ...prevStepData, ...formData })
      createIPAllowlist(createIPAllowlistPayload, {
        onSuccess: (createdIPAllowlist: CreateIpAllowlistConfigOkResponse) => {
          showSuccess(
            getString('authSettings.ipAddress.ipAllowlistCreated', {
              name: createdIPAllowlist?.content?.ip_allowlist_config.name
            })
          )
          setIsEditMode(true)
          nextStep?.({
            ...prevStepData,
            ...formData
          })
        },
        onError: error => {
          showError(
            defaultTo(
              (error as Error).message as string,
              getString('authSettings.ipAddress.errorWhileCreating', { name: formData.name })
            )
          )
        }
      })
    }
  }

  const getInitialValues = () => {
    let returnVal: StepDefineRangeForm = {
      allowSourceTypeUI: isEdit ? false : true,
      allowSourceTypeAPI: isEdit ? false : true,
      ipAddress: ''
    }
    if (isEdit) {
      returnVal = {
        ...pick(data, ['allowSourceTypeAPI', 'allowSourceTypeUI', 'ipAddress', 'enabled']),
        ...(prevStepData && pick(prevStepData, ['allowSourceTypeAPI', 'allowSourceTypeUI', 'ipAddress', 'enabled']))
      }
    }
    return returnVal
  }

  return (
    <Layout.Vertical spacing="xxlarge">
      <Text font={{ variation: FontVariation.H3 }}>{name}</Text>
      <Formik<StepDefineRangeForm>
        formName="ipAddressForm"
        onSubmit={onDefineRangeSubmit}
        initialValues={getInitialValues()}
        validationSchema={Yup.object().shape({
          ipAddress: Yup.string()
            .required(getString('authSettings.ipAddress.required'))
            .matches(regexIPAllowlist, getString('authSettings.ipAddress.invalid'))
        })}
      >
        {formikProps => {
          return (
            <FormikForm className={css.fullHeightDivsWithFlex}>
              <Layout.Vertical spacing="huge" className={css.fieldsContainer}>
                <Container className={css.formElm}>
                  <FormInput.Text label={getString('authSettings.ipAddress.ipAddressCIDR')} name="ipAddress" />
                  <Text>{getString('authSettings.ipAddress.applicableFor')}</Text>
                  <Layout.Horizontal spacing="huge">
                    <Checkbox
                      label="UI"
                      checked={formikProps.values.allowSourceTypeUI}
                      onChange={e => {
                        const val = e.currentTarget.checked
                        formikProps.setFieldValue('allowSourceTypeUI', val)
                      }}
                    />
                    <Checkbox
                      label="API"
                      checked={formikProps.values.allowSourceTypeAPI}
                      onChange={e => {
                        const val = e.currentTarget.checked
                        formikProps.setFieldValue('allowSourceTypeAPI', val)
                      }}
                    />
                  </Layout.Horizontal>
                </Container>
              </Layout.Vertical>
              <Layout.Horizontal spacing="medium">
                <Button
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => {
                    props?.previousStep?.(props?.prevStepData)
                  }}
                  data-name="back"
                  variation={ButtonVariation.SECONDARY}
                />
                <Button
                  type="submit"
                  intent="primary"
                  rightIcon="chevron-right"
                  disabled={isCreating || isUpdating}
                  variation={ButtonVariation.PRIMARY}
                >
                  <String stringID="saveAndContinue" />
                </Button>
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export default StepDefineRange
