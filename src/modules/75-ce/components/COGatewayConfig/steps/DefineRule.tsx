/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { Card, Formik, FormikForm, FormInput, Icon, IconName, Layout, Text } from '@wings-software/uicore'
import type { TextProps } from '@wings-software/uicore/dist/components/FormikForm/FormikForm'
import { Utils } from '@ce/common/Utils'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import { CONFIG_IDLE_TIME_CONSTRAINTS, CONFIG_STEP_IDS } from '@ce/constants'
import { useStrings } from 'framework/strings'
import { useGatewayContext } from '@ce/context/GatewayContext'
import COGatewayConfigStep from '../COGatewayConfigStep'
import css from '../COGatewayConfig.module.scss'

interface DefineRuleProps {
  gatewayDetails: GatewayDetails
  totalStepsCount: number
  setGatewayDetails: (details: GatewayDetails) => void
  setDrawerOpen: (shouldOpen: boolean) => void
}

const DefineRule: React.FC<DefineRuleProps> = props => {
  const { getString } = useStrings()
  const { isEditFlow } = useGatewayContext()
  const { totalStepsCount } = props
  const isAwsProvider = Utils.isProviderAws(props.gatewayDetails.provider)
  const isK8sRule = Utils.isK8sRule(props.gatewayDetails)

  return (
    <COGatewayConfigStep
      count={1}
      title={getString('ce.co.autoStoppingRule.configuration.step1.title')}
      subTitle={getString('ce.co.autoStoppingRule.configuration.step1.subTitle')}
      totalStepsCount={totalStepsCount}
      id={CONFIG_STEP_IDS[0]}
      dataTooltip={{ titleId: isAwsProvider ? 'defineAwsAsRule' : 'defineAzureAsRule' }}
    >
      <Layout.Horizontal>
        <ProviderDisplayCard
          name={props.gatewayDetails.provider.name}
          icon={props.gatewayDetails.provider.icon as IconName}
        />
        <Formik
          initialValues={{
            gatewayName: props.gatewayDetails.name,
            idleTime: props.gatewayDetails.idleTimeMins
          }}
          formName="coGatewayConfig"
          onSubmit={values => alert(JSON.stringify(values))}
          validationSchema={Yup.object().shape({
            gatewayName: Yup.string()
              .trim()
              .required('Rule Name is required field')
              .matches(
                isK8sRule ? /[a-z0-9]([-a-z0-9]*[a-z0-9])?/ : /.*/,
                'Name should not contain special characters'
              ),
            idleTime: Yup.number()
              .min(CONFIG_IDLE_TIME_CONSTRAINTS.MIN)
              .max(CONFIG_IDLE_TIME_CONSTRAINTS.MAX)
              .typeError('Idle time must be a number')
              .required('Idle Time is required field')
          })}
        >
          {formik => (
            <FormikForm className={css.step1Form}>
              <Layout.Horizontal spacing="xxxlarge">
                <InputDataContainer
                  title={'AutoStopping Rule Name'}
                  inputProps={{
                    name: 'gatewayName',
                    label: getString('ce.co.gatewayConfig.name'),
                    placeholder: getString('ce.co.autoStoppingRule.configuration.step1.nameInputPlaceholder'),
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldValue('gatewayName', e.target.value)
                      const updatedGatewayDetails = { ...props.gatewayDetails }
                      updatedGatewayDetails.name = e.target.value
                      props.setGatewayDetails(updatedGatewayDetails)
                    },
                    disabled: isK8sRule && isEditFlow
                  }}
                />
                <InputDataContainer
                  title={'Idle Time (mins)'}
                  infoIconProps={{ name: 'info', onClick: () => props.setDrawerOpen(true) }}
                  inputProps={{
                    name: 'idleTime',
                    placeholder: getString('ce.co.autoStoppingRule.configuration.step1.idleTimeInputPlaceholder'),
                    label: (
                      <Layout.Horizontal spacing="small">
                        <Text style={{ fontSize: 13 }}>
                          {getString('ce.co.autoStoppingRule.configuration.step1.form.idleTime.label')}
                        </Text>
                      </Layout.Horizontal>
                    ),
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                      formik.setFieldValue('idleTime', e.target.value)
                      const updatedGatewayDetails = { ...props.gatewayDetails }
                      updatedGatewayDetails.idleTimeMins = +e.target.value
                      props.setGatewayDetails(updatedGatewayDetails)
                    }
                  }}
                />
              </Layout.Horizontal>
            </FormikForm>
          )}
        </Formik>
        {/* </Layout.Vertical> */}
      </Layout.Horizontal>
    </COGatewayConfigStep>
  )
}

interface ProviderDisplayCardProps {
  name: string
  icon: IconName
}

const ProviderDisplayCard: React.FC<ProviderDisplayCardProps> = props => {
  return (
    <Card interactive={false} className={css.displayCard}>
      <Icon name={props.icon} size={30} />
      <Text style={{ marginTop: '5px' }} font="small">
        {props.name}
      </Text>
    </Card>
  )
}

interface InputDataContainerProps {
  title: string
  inputProps: TextProps
  infoIconProps?: { name: IconName; onClick?: () => void }
}

const InputDataContainer: React.FC<InputDataContainerProps> = props => {
  return (
    <Layout.Vertical className={css.formElement}>
      <Text style={{ fontSize: 16, fontWeight: 500, color: '#0B0B0D' }}>
        {props.title}
        {props.infoIconProps?.name && (
          <Icon name={props.infoIconProps?.name} onClick={props.infoIconProps?.onClick}></Icon>
        )}
      </Text>
      <FormInput.Text {...props.inputProps} />
    </Layout.Vertical>
  )
}

export default DefineRule
