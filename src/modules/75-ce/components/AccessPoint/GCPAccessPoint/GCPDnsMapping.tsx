/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { defaultTo as _defaultTo } from 'lodash-es'
import { Button, Color, Container, Formik, FormikForm, FormInput, Layout, Text } from '@harness/uicore'
import * as Yup from 'yup'
import type { AccessPointScreenMode } from '@ce/types'
import type { AccessPoint } from 'services/lw'
import { useStrings } from 'framework/strings'
import { VALID_DOMAIN_REGEX } from '@ce/constants'
import css from './GCPAccessPoint.module.scss'

export interface GcpDnsFormVal {
  customDomain: string
  name: string
}

interface GCPDnsMappingProps {
  mode: AccessPointScreenMode
  handleSubmit: (values: GcpDnsFormVal) => void
  loadBalancer: AccessPoint
  handleCancel?: () => void
}

const GCPDnsMapping: React.FC<GCPDnsMappingProps> = ({ mode, handleSubmit, loadBalancer, handleCancel }) => {
  const { getString } = useStrings()
  const isCreateMode = mode === 'create'
  const isEditMode = mode === 'edit'
  return (
    <Container>
      <Formik
        initialValues={{
          customDomain: _defaultTo(loadBalancer.host_name, ''),
          name: _defaultTo(loadBalancer.name, '')
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
                {getString('ce.co.accessPoint.domainMappingDescription', {
                  lb: getString('ce.co.accessPoint.loadbalancer')
                })}
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
                    {/* <img src={helpTextIcon} /> */}
                    <Text>{getString('ce.co.accessPoint.helpCenter.heading')}</Text>
                  </Layout.Horizontal>
                  <hr></hr>
                  <Text>{getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.mapToDNS.title')}</Text>
                  <ol type={'1'}>
                    <li>{getString('ce.co.accessPoint.helpCenter.step1')}</li>
                    <li>{getString('ce.co.accessPoint.helpCenter.step2')}</li>
                    <li>{getString('ce.co.autoStoppingRule.setupAccess.helpText.dns.setup.mapToDNS.step3')}</li>
                  </ol>
                </div>
              </Layout.Horizontal>
            </Layout.Vertical>
            <Layout.Horizontal>
              <Button
                intent="primary"
                text={'Continue'}
                rightIcon={'chevron-right'}
                onClick={submitForm}
                disabled={!(values.customDomain && values.name)}
                className={css.saveBtn}
                data-testid={'saveGcpDetails'}
              ></Button>
              {!isCreateMode && (
                <Button intent="none" text={'Cancel'} onClick={handleCancel} data-testid={'cancelBtn'}></Button>
              )}
            </Layout.Horizontal>
          </FormikForm>
        )}
      </Formik>
    </Container>
  )
}

export default GCPDnsMapping
