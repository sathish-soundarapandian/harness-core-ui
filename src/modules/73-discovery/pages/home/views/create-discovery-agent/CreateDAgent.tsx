/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { Button, ButtonVariation, Container, Dialog, FormikForm, Layout, Text, useToggleOpen } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Formik, FormikProps } from 'formik'
import * as Yup from 'yup'
import classNames from 'classnames'
import { useParams } from 'react-router-dom'
import NetworkMap from '@discovery/images/NetworkMap.svg'
import { useStrings } from 'framework/strings'
import { NameIdDescriptionTags } from '@common/components'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import NetworkDiscoveryModal from '@discovery/components/NetworkDiscoveryModal/NetworkDiscoveryModal'
import List from '@discovery/components/List/List'
import css from './CreateDAgent.module.scss'

interface FormValues {
  name: string
  description?: string
  tags?: string[]
  connectorRef: string | undefined
}

export interface DrawerProps {
  setDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const CreateDAgent: React.FC<DrawerProps> = ({ setDrawerOpen }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const {
    open: openNetworkDiscoveryModal,
    isOpen: isNetworkDiscoveryModalOpen,
    close: hideNetworkDiscoveryModal
  } = useToggleOpen()

  const inputValues: FormValues = {
    name: '',
    description: '',
    tags: [],
    connectorRef: undefined
  }

  const modalProps = {
    style: {
      width: 600,
      minHeight: 400,
      borderLeft: 0,
      paddingBottom: 0,
      overflow: 'hidden'
    }
  }

  const handleSubmit = (formData: FormikProps<FormValues>): void => {
    // eslint-disable-next-line no-console
    console.log(formData.values)
  }

  return (
    <Layout.Horizontal width="100%" height="100%">
      <Container background={Color.PRIMARY_BG} className={css.overviewContainer}>
        <Dialog
          isOpen={isNetworkDiscoveryModalOpen}
          enforceFocus={false}
          onClose={hideNetworkDiscoveryModal}
          className={css.dialog}
          {...modalProps}
        >
          <NetworkDiscoveryModal />
        </Dialog>
        <Formik<FormValues>
          initialValues={inputValues}
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .trim()
              .matches(/^[a-z0-9-]*$/, 'Network Map name can only contain lowercase letters, numbers and dashes')
              .matches(/^[^-].*$/, 'Network Map name can not start with -')
              .matches(/^.*[^-]$/, 'Network Map name can not end with -')
              .max(50, 'Network Map name can have a max length of 50 characters')
              .required('Network Map name is required!'),
            connector: Yup.object().shape({
              id: Yup.string().trim().required('Please select a Connector!')
            })
          })}
          onSubmit={() => void 0}
        >
          {formikProps => {
            return (
              <FormikForm>
                <Layout.Vertical
                  className={classNames(css.formContainer, css.gap4)}
                  padding="xxlarge"
                  width={'60%'}
                  height={'100%'}
                >
                  <Layout.Vertical width={'100%'}>
                    <Layout.Vertical margin={{ top: 'large', bottom: 'large' }}>
                      <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} margin={{ bottom: 'large' }}>
                        {getString('overview')}
                      </Text>
                      <Container
                        className={css.nameDescriptionFieldContainer}
                        background={Color.WHITE}
                        width="100%"
                        padding="medium"
                      >
                        <NameIdDescriptionTags className={css.nameDescriptionField} formikProps={formikProps} />
                      </Container>
                    </Layout.Vertical>
                    <Layout.Vertical width={'600px'} margin={{ top: 'xxlarge' }}>
                      <Text
                        font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
                        margin={{ top: 'large', bottom: 'large' }}
                      >
                        {getString('discovery.selectAConnector')}
                      </Text>
                      <Text
                        width="100%"
                        font={{ variation: FontVariation.BODY }}
                        margin={{ top: 'medium', bottom: 'large' }}
                      >
                        {getString('discovery.selectAConnectorDescription')}
                      </Text>
                      <Container
                        className={css.connectorContainer}
                        background={Color.WHITE}
                        width="100%"
                        padding="medium"
                      >
                        <FormConnectorReferenceField
                          width={400}
                          type={'K8sCluster'}
                          name={'connectorRef'}
                          label={
                            <Text color={Color.BLACK} font={'small'} margin={{ bottom: 'small' }}>
                              {getString('connectors.selectConnector')}
                            </Text>
                          }
                          accountIdentifier={accountId}
                          projectIdentifier={projectIdentifier}
                          orgIdentifier={orgIdentifier}
                          placeholder={getString('connectors.selectConnector')}
                          tooltipProps={{ dataTooltipId: 'selectNetworkMapConnector' }}
                        />
                      </Container>
                    </Layout.Vertical>
                  </Layout.Vertical>
                  <Layout.Horizontal
                    className={css.bottomNav}
                    flex={{ justifyContent: 'flex-start' }}
                    spacing={'medium'}
                  >
                    <Button
                      variation={ButtonVariation.SECONDARY}
                      text={getString('cancel')}
                      onClick={() => setDrawerOpen(false)}
                    />
                    <Button
                      type="submit"
                      intent="primary"
                      text={getString('next')}
                      rightIcon="chevron-right"
                      onClick={() => {
                        handleSubmit(formikProps)
                        openNetworkDiscoveryModal()
                      }}
                    />
                  </Layout.Horizontal>
                </Layout.Vertical>
              </FormikForm>
            )
          }}
        </Formik>
      </Container>

      <div className={css.details}>
        <Layout.Vertical width="100%" padding={{ top: 'xxlarge', left: 'xlarge', right: 'xlarge', bottom: 'xxlarge' }}>
          <Layout.Horizontal flex={{ justifyContent: 'space-between' }} margin={{ bottom: 'large' }}>
            <Text font={{ variation: FontVariation.H5, weight: 'semi-bold' }}>{getString('discovery.networkMap')}</Text>
            <Text
              font={{ variation: FontVariation.SMALL_BOLD }}
              color={Color.PRIMARY_7}
              rightIcon="main-share"
              rightIconProps={{ color: Color.PRIMARY_7, size: 10 }}
            >
              {getString('learnMore')}
            </Text>
          </Layout.Horizontal>
          <img src={NetworkMap} alt="Network Map" className={css.image} />
          <List
            title={getString('discovery.whatIsNetworkMap')}
            content={getString('discovery.networkMapDescription')}
            margin={{ top: 'medium', bottom: 'xlarge' }}
          />
          <List
            title={getString('discovery.howToCreateNetworkMap')}
            content={getString('discovery.howToCreateNetworkMapDesc')}
            margin={{ top: 'medium', bottom: 'xlarge' }}
          />
          <List
            title={getString('discovery.whatIsServiceDiscovery')}
            content={getString('discovery.whatIsServiceDiscoveryDesc')}
            margin={{ top: 'medium' }}
          />
        </Layout.Vertical>
      </div>
    </Layout.Horizontal>
  )
}

export default CreateDAgent
