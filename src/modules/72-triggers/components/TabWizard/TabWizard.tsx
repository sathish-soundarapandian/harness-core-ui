/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { RefObject, Dispatch, SetStateAction } from 'react';
import React, { useRef, createRef, useMemo, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { defaultTo, noop } from 'lodash-es'

import type {
  IconName} from '@harness/uicore';
import {
  Layout,
  Tabs,
  Tab,
  Formik,
  FormikForm,
  Icon,
  VisualYamlSelectedView as SelectedView,
  Container
} from '@harness/uicore'
import stableStringify from 'fast-json-stable-stringify'
import { Color } from '@harness/design-system'

import type { FormikEffectProps } from '@common/components/FormikEffect/FormikEffect';
import { FormikEffect } from '@common/components/FormikEffect/FormikEffect'
import { NavigationCheck } from '@common/components/NavigationCheck/NavigationCheck'
import type {
  YamlBuilderHandlerBinding,
  YamlBuilderProps,
  InvocationMapFunction
} from '@common/interfaces/YAMLBuilderProps'

import type {
  FormikPropsInterface
} from './TabWizardUtils';
import {
  renderTitle,
  setNewTouchedPanel,
  shouldBlockNavigation,
  renderYamlBuilder
} from './TabWizardUtils'
import TabWizardHeader from './TabWizardHeader/TabWizardHeader'
import TabWizardFooter from './TabWizardFooter/TabWizardFooter'
import { TabWizardContext } from './context/TabWizardContext'
import css from './TabWizard.module.scss'

export interface PanelInterface {
  id: string
  tabTitle?: string
  tabTitleComponent?: JSX.Element
  iconName?: IconName
  requiredFields?: string[]
  checkValidPanel?: ({
    formikValues,
    formikErrors
  }: {
    formikValues: { [key: string]: any }
    formikErrors: { [key: string]: any }
  }) => boolean
}

interface VisualYamlPropsInterface {
  schema?: Record<string, any>
  invocationMap?: Map<RegExp, InvocationMapFunction>
  handleModeSwitch: (mode: SelectedView) => void
  convertFormikValuesToYaml: (formikPropsValues: any) => any
  onYamlSubmit: (val: any) => void
  yamlObjectKey?: string
  loading?: boolean
  yamlBuilderReadOnlyModeProps: YamlBuilderProps
}

interface TabWizardProps {
  formikInitialProps: FormikPropsInterface
  onHide: () => void
  defaultTabId?: string
  tabWidth?: string
  submitLabel?: string
  isEdit?: boolean
  children?: JSX.Element[]
  disableSubmit?: boolean
  visualYamlProps?: VisualYamlPropsInterface
  wizardType?: string // required for dataTooltip to be unique
  renderErrorsStrip?: () => JSX.Element // component currently only allowed for pipeline components
  onFormikEffect?: FormikEffectProps['onChange']
  // new props
  panels: PanelInterface[]
  title: string | JSX.Element
  selectedView: SelectedView
  setSelectedView: (selectedView: SelectedView) => void
  yamlHandler?: YamlBuilderHandlerBinding
  setYamlHandler: Dispatch<SetStateAction<YamlBuilderHandlerBinding | undefined>>
}

export default function TabWizard({
  onHide,
  submitLabel,
  tabWidth,
  defaultTabId,
  formikInitialProps,
  children,
  isEdit = false,
  disableSubmit,
  title,
  visualYamlProps,
  wizardType,
  renderErrorsStrip,
  onFormikEffect = noop,
  panels,
  selectedView,
  setSelectedView,
  yamlHandler,
  setYamlHandler
}: TabWizardProps): JSX.Element {
  const history = useHistory()
  const elementsRef: { current: RefObject<HTMLSpanElement>[] } = useRef(panels?.map(() => createRef()))

  const tabsMap = panels.map(panel => panel.id)
  const [selectedTabId, setSelectedTabId] = useState<string>(defaultTo(defaultTabId, tabsMap[0]))
  const [touchedPanels, setTouchedPanels] = useState<number[]>([])
  const [selectedTabIndex, setSelectedTabIndex] = useState<number>(
    defaultTabId ? tabsMap.findIndex(tabsId => defaultTabId === tabsId) : 0
  )
  const [submittedForm, setSubmittedForm] = useState<boolean>(false)

  const isYamlView = useMemo(() => selectedView === SelectedView.YAML, [selectedView])

  const {
    handleModeSwitch,
    yamlBuilderReadOnlyModeProps,
    loading: loadingYamlView,
    schema,
    convertFormikValuesToYaml,
    onYamlSubmit,
    yamlObjectKey,
    invocationMap
  } = visualYamlProps as VisualYamlPropsInterface

  const changeTabs = (upcomingTabIndex: number, includeSkippedIndexes?: boolean): void => {
    setSelectedTabId(tabsMap[upcomingTabIndex])
    setSelectedTabIndex(upcomingTabIndex)
    setNewTouchedPanel({ selectedTabIndex, upcomingTabIndex, touchedPanels, setTouchedPanels, includeSkippedIndexes })
  }

  const handleTabChange = (data: string): void => {
    const tabIndex = tabsMap.findIndex(tab => tab === data)
    changeTabs(tabIndex, true)
  }

  //? To be thought through
  const getIsDirtyForm = (parsedYaml: any): boolean =>
    stableStringify(convertFormikValuesToYaml?.(formikInitialProps?.initialValues)) !== stableStringify(parsedYaml)

  return (
    <TabWizardContext.Provider
      value={{
        selectedView: selectedView,
        setSelectedView: setSelectedView
      }}
    >
      <section className={css.wizardShell}>
        <TabWizardHeader title={title} handleModeSwitch={handleModeSwitch} />
        {submittedForm && renderErrorsStrip?.()}
        <Layout.Horizontal spacing="large" className={css.tabsContainer}>
          <Formik {...formikInitialProps} validateOnChange formName={`wizardForm${wizardType ? `_${wizardType}` : ''}`}>
            {formikProps => {
              return (
                <FormikForm>
                  {/* //? What does this really do in the bigger scheme of things? */}
                  <FormikEffect onChange={onFormikEffect} formik={formikProps} />
                  <NavigationCheck
                    when={true}
                    shouldBlockNavigation={() =>
                      // TODO: to be improved
                      shouldBlockNavigation({
                        isSubmitting: formikProps.isSubmitting,
                        isValid: formikProps.isValid,
                        isYamlView,
                        yamlHandler,
                        // Instead of using formikProps.dirty, convert the lates formik values to Yaml and then compare with the formik initial values yaml
                        dirty: getIsDirtyForm(convertFormikValuesToYaml?.(formikProps.values)),
                        getIsDirtyForm
                      })
                    }
                    navigate={newPath => {
                      history.push(newPath)
                    }}
                  />
                  {isYamlView && yamlBuilderReadOnlyModeProps ? (
                    <Container padding={{ top: 'xlarge', right: 'xlarge', left: 'xlarge' }}>
                      {renderYamlBuilder({
                        loadingYamlView,
                        yamlBuilderReadOnlyModeProps,
                        convertFormikValuesToYaml,
                        formikProps,
                        setYamlHandler,
                        invocationMap,
                        schema
                      })}
                    </Container>
                  ) : (
                    <Tabs id="Wizard" onChange={handleTabChange} selectedTabId={selectedTabId}>
                      {panels.map((_panel, panelIndex) => {
                        const { id, tabTitle, tabTitleComponent, requiredFields = [], checkValidPanel } = _panel
                        //? can the panels and children made combined into 1 by putting it as a class property?
                        return (
                          <Tab
                            key={id}
                            id={id}
                            style={{ width: tabWidth ? tabWidth : 'auto' }}
                            //? Are these many props required?
                            title={renderTitle({
                              tabTitle,
                              tabTitleComponent,
                              requiredFields,
                              checkValidPanel,
                              panelIndex,
                              touchedPanels,
                              isEdit,
                              selectedTabIndex,
                              formikVals: formikProps.values,
                              formikErrs: formikProps.errors,
                              ref: elementsRef.current[panelIndex]
                            })}
                            panel={
                              children?.[panelIndex] &&
                              React.cloneElement(children[panelIndex], { formikProps, isEdit })
                            }
                          >
                            {panelIndex !== panels.length - 1 && (
                              <Icon
                                data-name="chevron-right-tab"
                                name="chevron-right"
                                height={20}
                                size={20}
                                margin={{ right: 'small', left: 'small' }}
                                color={Color.GREY_400}
                                onClick={e => e.preventDefault()}
                                className={css.tabRightChevron}
                              />
                            )}
                          </Tab>
                        )
                      })}
                    </Tabs>
                  )}
                  <TabWizardFooter
                    selectedTabIndex={selectedTabIndex}
                    lastTab={selectedTabIndex === tabsMap.length - 1}
                    changeTabs={changeTabs}
                    onHide={onHide}
                    submitLabel={submitLabel}
                    disableSubmit={disableSubmit}
                    onYamlSubmit={onYamlSubmit}
                    yamlObjectKey={yamlObjectKey}
                    yamlHandler={yamlHandler}
                    elementsRef={elementsRef}
                    formikProps={formikProps}
                    yamlBuilderReadOnlyModeProps={yamlBuilderReadOnlyModeProps}
                    loadingYamlView={loadingYamlView}
                    setSubmittedForm={setSubmittedForm}
                    validate={(arg?: { latestYaml?: string }) =>
                      formikInitialProps?.validate?.({ formikProps, latestYaml: arg?.latestYaml })
                    }
                  />
                </FormikForm>
              )
            }}
          </Formik>
        </Layout.Horizontal>
        {/* // TODO: Remove this
      <div className={css.footerLine}></div> */}
      </section>
    </TabWizardContext.Provider>
  )
}
