/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Button,
  ButtonVariation,
  Container,
  FlexExpander,
  Formik,
  Icon,
  Layout,
  ModalDialog,
  Tab,
  Tabs,
  Text,
  useToggleOpen
} from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'

import { useStrings, String } from 'framework/strings'

import { Page } from '@common/exports'
import type { DiscoveryPathProps, ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import SelectService from './views/select-service/SelectService'
import css from './NetworkMapStudio.module.scss'

enum StudioTabs {
  SELECT_SERVICES = 'Select Services',
  CONFIGURE_RELATIONS = 'Configure Relations'
}

export interface FormValues {
  name: string
  description?: string
  tags?: string[]
  identifier: string | undefined
}

const NetworkMapStudio: React.FC = () => {
  const { dAgentId } = useParams<DiscoveryPathProps & ModulePathParams>()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const { isOpen, open, close } = useToggleOpen()
  const history = useHistory()
  const createNetworkMapLabel = getString('discovery.createNetworkMap')
  const networkMapFormRef = React.useRef<FormikProps<FormValues>>()

  const [title, setTitle] = useState<string>('Untitled Network Map')

  useDocumentTitle(createNetworkMapLabel)

  const handleTabChange = (tabID: StudioTabs): void => {
    switch (tabID) {
      case StudioTabs.SELECT_SERVICES:
        history.push(routes.toCreateNetworkMap({ ...accountPathProps }))
        break
      case StudioTabs.CONFIGURE_RELATIONS:
        history.push(routes.toCreateNetworkMap({ ...accountPathProps }))
        break
    }
  }

  return (
    <>
      <Page.Header
        breadcrumbs={
          <NGBreadcrumbs
            links={[
              {
                url: routes.toDiscovery({ accountId, orgIdentifier, projectIdentifier }),
                label: getString('common.discovery')
              },
              {
                url: routes.toDiscoveryDetails({ accountId, orgIdentifier, projectIdentifier, dAgentId }),
                label: dAgentId
              }
            ]}
          />
        }
        title={
          <React.Fragment>
            <String tagName="div" className={css.networkMapTitle} stringID="common.networkMap" />
            <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
              <Text color={title === 'Untitled Network Map' ? Color.GREY_200 : Color.GREY_900} font="medium">
                {title}
              </Text>
              <Icon name="code-edit" size={20} className={css.headerIcon} onClick={() => open()} />
            </Layout.Horizontal>
            <ModalDialog
              isOpen={isOpen}
              onClose={close}
              title={getString('discovery.homepage.newNewtworkMapBtn')}
              canEscapeKeyClose={false}
              canOutsideClickClose={true}
              enforceFocus={false}
              lazy
              width={400}
              height={400}
              className={css.dialogStyles}
            >
              <Formik
                innerRef={networkMapFormRef as React.Ref<FormikProps<FormValues>>}
                initialValues={{
                  identifier: '',
                  name: '',
                  description: '',
                  tags: []
                }}
                formName="networkMapNameForm"
                onSubmit={() => void 0}
              >
                {formikProps => (
                  <Layout.Vertical height={'100%'}>
                    <Container width="300px" className={css.modal} padding={{ top: 'xsmall', bottom: 'small' }}>
                      <NameIdDescriptionTags
                        formikProps={formikProps}
                        identifierProps={{ isIdentifierEditable: true }}
                      />
                    </Container>
                    <FlexExpander />
                    <Layout.Horizontal
                      flex={{ justifyContent: 'flex-start' }}
                      padding={{ left: 'huge' }}
                      spacing={'medium'}
                    >
                      <Button
                        type="submit"
                        variation={ButtonVariation.PRIMARY}
                        text={getString('confirm')}
                        onClick={() => {
                          setTitle(formikProps.values.name)
                          close()
                        }}
                      />
                      <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={() => close()} />
                    </Layout.Horizontal>
                  </Layout.Vertical>
                )}
              </Formik>
            </ModalDialog>
          </React.Fragment>
        }
      />
      <Page.Body className={css.listBody}>
        <section className={css.setupShell}>
          <Tabs id="networkMapTabs" onChange={handleTabChange} selectedTabId={StudioTabs.SELECT_SERVICES}>
            <Tab
              id={StudioTabs.SELECT_SERVICES}
              panel={<SelectService name={title} networkMapRef={networkMapFormRef.current} />}
              title={getString('discovery.tabs.selectServices')}
            />
            <Icon
              name="chevron-right"
              height={20}
              size={20}
              margin={{ right: 'small', left: 'small' }}
              color={Color.GREY_400}
              style={{ alignSelf: 'center' }}
            />
            <Tab
              id={StudioTabs.CONFIGURE_RELATIONS}
              panel={<>Configure Relations</>}
              title={getString('discovery.tabs.configureRelations')}
            />
          </Tabs>
        </section>
      </Page.Body>
    </>
  )
}

export default NetworkMapStudio
