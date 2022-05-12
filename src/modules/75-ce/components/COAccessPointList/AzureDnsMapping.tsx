/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { Button, Formik, FormikForm, FormInput, Layout, Text } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { AccessPoint } from 'services/lw'
import { VALID_DOMAIN_REGEX } from '@ce/constants'
import type { AccessPointScreenMode } from '@ce/types'
import helpTextIcon from '../COGatewayAccess/images/OthersHelpText.svg'
import css from '../COGatewayAccess/COGatewayAccess.module.scss'

export interface AzureDnsFormVal {
  customDomain: string
  name: string
}

interface AzureApDnsMappingProps {
  mode: AccessPointScreenMode
  handleSubmit: (values: AzureDnsFormVal) => void
  loadBalancer: AccessPoint
  handleCancel?: () => void
}

const AzureApDnsMapping: React.FC<AzureApDnsMappingProps> = props => {
  const { handleSubmit, loadBalancer, handleCancel, mode } = props
  const isCreateMode = mode === 'create'
  const isEditMode = mode === 'edit'
  return (
    <Formik
      initialValues={{
        customDomain: loadBalancer.host_name || '',
        name: loadBalancer.name || ''
      }}
      formName="azureDnsMapping"
      onSubmit={handleSubmit}
      validationSchema={Yup.object().shape({
        name: Yup.string().required('Name is a required field'),
        customDomain: Yup.string()
          .required('Domain name is a required field')
          .matches(VALID_DOMAIN_REGEX, 'Enter a valid domain')
      })}
    >
      {({ submitForm, values }) => (
        <FormikForm>
          <Layout.Vertical>
            <FormInput.Text
              name="name"
              label="Provide a name for the Load balancer"
              className={css.lbNameInput}
              disabled={!isCreateMode}
            />
            <Text color={Color.GREY_400} className={css.configInfo}>
              The Application gateway does not have a domain name associated with it. The rule directs traffic to
              resources through the Load balancer. Hence the Load balancer requires a domain name to be accessed by the
              rule
            </Text>
            <Layout.Horizontal style={{ minHeight: 300, justifyContent: 'space-between' }}>
              <Layout.Horizontal className={css.customDomainContainer} flex={{ alignItems: 'flex-start' }}>
                <FormInput.Text
                  name={'customDomain'}
                  label={'Enter Domain name'}
                  style={{ width: 300, marginRight: 20 }}
                  disabled={isEditMode}
                />
              </Layout.Horizontal>
              <div className={css.othersHelpTextContainer}>
                <Layout.Horizontal>
                  <img src={helpTextIcon} />
                  <Text>Help: When using Other DNS providers like goDaddy, Hostigator, etc.</Text>
                </Layout.Horizontal>
                <hr></hr>
                <Text>To map your custom domain to hostname, you need to:</Text>
                <ol type={'1'}>
                  <li>Add a CNAME record with your Custom domain, qa.yourcompany.co as the host</li>
                  <li>
                    Point the record to your Harness domain, 27-nginx-test-1.gateway.harness.io. The CNAME record should
                    look like this
                  </li>
                  <li>
                    Save your settings. It may take a full day for the settings to propagate across the global Domain
                    Name System.
                  </li>
                </ol>
              </div>
            </Layout.Horizontal>
          </Layout.Vertical>
          <Layout.Horizontal>
            {/* {isSaving && <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center' }} />} */}
            {/* {!isSaving && ( */}
            <Button
              intent="primary"
              text={'Continue'}
              rightIcon={'chevron-right'}
              onClick={submitForm}
              disabled={!(values.customDomain && values.name)}
              className={css.saveBtn}
              data-testid={'saveAzureDetails'}
            ></Button>
            {/* )} */}
            {!isCreateMode && <Button intent="none" text={'Cancel'} onClick={handleCancel}></Button>}
          </Layout.Horizontal>
        </FormikForm>
      )}
    </Formik>
  )
}

export default AzureApDnsMapping
