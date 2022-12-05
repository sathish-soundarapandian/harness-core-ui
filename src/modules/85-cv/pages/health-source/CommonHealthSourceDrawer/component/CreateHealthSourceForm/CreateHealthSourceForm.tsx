import { Button, ButtonVariation, Container, Layout, Tabs } from '@harness/uicore'
import React, { useState } from 'react'
import { FormikProps, useFormikContext } from 'formik'
import type { TabId } from '@blueprintjs/core'
import type { NavButtonsProps } from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import type { CommonHealthSourceInterface } from '../../CommonHealthSourceDrawer.types'

export enum CreateHealthSourceTabs {
  DEFINE_HEALTH_SOURCE = 'DEFINE_HEALTH_SOURCE',
  CONFIGURATIONS = 'CONFIGURATIONS'
}

export const TabsOrder = [CreateHealthSourceTabs.DEFINE_HEALTH_SOURCE, CreateHealthSourceTabs.CONFIGURATIONS]

export const handleTabChange = (
  nextTabId: TabId,
  formik: FormikProps<CommonHealthSourceInterface>,
  setSelectedTabId: (tabId: CreateHealthSourceTabs) => void
): void => {
  switch (nextTabId) {
    case CreateHealthSourceTabs.CONFIGURATIONS: {
      if (isFormDataValid(formik, CreateHealthSourceTabs.DEFINE_HEALTH_SOURCE)) {
        setSelectedTabId(CreateHealthSourceTabs.CONFIGURATIONS)
      }
      break
    }
    default: {
      setSelectedTabId(CreateHealthSourceTabs.DEFINE_HEALTH_SOURCE)
    }
  }
}

interface CreateHealthSourceFormProps {
  data: any
}

export default function CreateHealthSourceForm(props: CreateHealthSourceFormProps): JSX.Element {
  const { data } = props
  const { getString } = useStrings()
  const formik = useFormikContext<CommonHealthSourceInterface>()
  const { values, setFieldValue, setValues, submitForm } = formik
  const [selectedTabId, setSelectedTabId] = useState<CreateHealthSourceTabs>(
    CreateHealthSourceTabs.DEFINE_HEALTH_SOURCE
  )

  const NavButtons: React.FC<NavButtonsProps> = ({ loading: saving }) => (
    <Layout.Horizontal spacing="small" padding={{ top: 'xxlarge' }}>
      <Button
        icon="chevron-left"
        text={getString('back')}
        variation={ButtonVariation.SECONDARY}
        disabled={saving}
        onClick={() => {
          const tabIndex = TabsOrder.indexOf(selectedTabId)
          if (tabIndex) {
            setSelectedTabId(TabsOrder[tabIndex - 1])
            return
          }
          handleRedirect()
        }}
      />
      <RbacButton
        rightIcon="chevron-right"
        text={selectedTabId === CreateHealthSourceTabs.CONFIGURATIONS ? getString('save') : getString('continue')}
        variation={ButtonVariation.PRIMARY}
        loading={saving}
        onClick={() => {
          if (selectedTabId === CreateHealthSourceTabs.CONFIGURATIONS) {
            submitForm()
          } else if (isFormDataValid(formikProps, selectedTabId)) {
            setSelectedTabId(TabsOrder[Math.min(TabsOrder.length, TabsOrder.indexOf(selectedTabId) + 1)])
          }
        }}
      />
    </Layout.Horizontal>
  )

  return (
    <Container className={css.createSloTabsContainer}>
      <Tabs
        id="createSLOTabs"
        selectedTabId={selectedTabId}
        onChange={nextTabId => handleTabChange(nextTabId, formikProps, setSelectedTabId)}
        tabList={[
          {
            id: CreateSLOTabs.NAME,
            title: getString('name'),
            panel: (
              <Page.Body loading={loading} error={error} retryOnError={() => retryOnError()} className={css.pageBody}>
                <Heading level={2} font={{ variation: FontVariation.FORM_TITLE }} margin={{ bottom: 'small' }}>
                  {getString('cv.slos.sloDefinition')}
                </Heading>
                <SLOName<SLOForm>
                  formikProps={formikProps}
                  identifier={identifier}
                  monitoredServicesOptions={monitoredServicesOptions}
                  monitoredServicesLoading={monitoredServicesLoading}
                  fetchingMonitoredServices={fetchingMonitoredServices}
                >
                  <NavButtons />
                </SLOName>
              </Page.Body>
            )
          },
          {
            id: CreateSLOTabs.SLI,
            title: getString('cv.slos.sli'),
            panel: (
              <Page.Body loading={loading} error={error} retryOnError={() => retryOnError()} className={css.pageBody}>
                <SLI
                  formikProps={formikProps}
                  sliGraphData={sliGraphData}
                  loading={sliGraphLoading}
                  error={getErrorMessage(sliGraphError)}
                  retryOnError={fetchSliGraphData}
                  debounceFetchSliGraphData={debounceFetchSliGraphData}
                >
                  <NavButtons />
                </SLI>
              </Page.Body>
            )
          }
        ]}
      />
    </Container>
  )
}
