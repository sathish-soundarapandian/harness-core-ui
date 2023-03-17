/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Button,
  Text,
  Formik,
  StepProps,
  getMultiTypeFromValue,
  MultiTypeInputType,
  ThumbnailSelect,
  ButtonVariation,
  FormikForm,
  ButtonSize,
  Thumbnail
} from '@harness/uicore'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { isEmpty } from 'lodash-es'
import type { Item } from '@harness/uicore/dist/components/ThumbnailSelect/ThumbnailSelect'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'

import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import {
  ConnectorIcons,
  ConnectorLabelMap,
  ConnectorMap,
  ConnectorTypes,
  StartupScriptPropType,
  StartupScriptWizardInitData
} from './StartupScriptInterface.types'

import css from './StartupScriptSelection.module.scss'

function StartupScriptWizardStepOne({
  handleConnectorViewChange,
  handleStoreChange,
  stepName,
  stepSubtitle,
  isReadonly,
  connectorTypes,
  initialValues,
  expressions,
  allowableTypes,
  prevStepData,
  nextStep,
  singleAvailableStore
}: StepProps<ConnectorConfigDTO> & StartupScriptPropType): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const [isLoadingConnectors, setIsLoadingConnectors] = React.useState<boolean>(true)
  const [selectedStore, setSelectedStore] = useState(
    singleAvailableStore ? singleAvailableStore : prevStepData?.selectedStore ?? initialValues.selectedStore
  )
  const [multitypeInputValue, setMultiTypeValue] = useState<MultiTypeInputType | undefined>(undefined)

  if (singleAvailableStore) {
    if (
      getMultiTypeFromValue(initialValues.connectorRef) !== MultiTypeInputType.FIXED &&
      initialValues.selectedStore !== singleAvailableStore
    ) {
      setMultiTypeValue(MultiTypeInputType.FIXED)
    } else if (multitypeInputValue !== undefined) {
      setMultiTypeValue(undefined)
    }
    handleStoreChange(singleAvailableStore)
  }

  const isHarness = (store?: string): boolean => {
    return store === 'Harness'
  }

  const isValidConnectorStore = (): boolean => {
    return selectedStore && !isHarness(selectedStore)
  }

  const newConnectorLabel =
    isValidConnectorStore() &&
    `${getString('newLabel')} ${getString(ConnectorLabelMap[selectedStore as ConnectorTypes])} ${getString(
      'connector'
    )}`

  const [canCreate] = usePermission({
    resource: {
      resourceType: ResourceType.CONNECTOR
    },
    permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
  })

  const submitFirstStep = async (formData: StartupScriptWizardInitData): Promise<void> => {
    nextStep?.({ ...formData })
  }

  function shouldGotoNextStep(connectorRefValue: ConnectorSelectedValue | string): boolean {
    return (
      !isLoadingConnectors ||
      (!!selectedStore &&
        ((getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.FIXED &&
          !isEmpty((connectorRefValue as ConnectorSelectedValue)?.connector)) ||
          !isEmpty(connectorRefValue)))
    )
  }

  const handleOptionSelection = /* istanbul ignore next */ (
    formikData: StartupScriptWizardInitData,
    storeSelected: ConnectorTypes
  ): void => {
    if (
      getMultiTypeFromValue(formikData.connectorRef) !== MultiTypeInputType.FIXED &&
      formikData.selectedStore !== storeSelected
    ) {
      setMultiTypeValue(MultiTypeInputType.FIXED)
    } else if (multitypeInputValue !== undefined) {
      setMultiTypeValue(undefined)
    }
    handleStoreChange(storeSelected)
    setSelectedStore(storeSelected)
  }

  const getInitialValues = useCallback((): StartupScriptWizardInitData => {
    const initValues = { ...initialValues }
    if (prevStepData?.connectorRef) {
      initValues.connectorRef = prevStepData.connectorRef
      handleStoreChange(selectedStore)
    }

    if (selectedStore !== initValues.selectedStore && selectedStore !== prevStepData?.selectedStore) {
      initValues.connectorRef = ''
    }
    return { ...initValues, selectedStore: selectedStore }
  }, [selectedStore])

  const connectorTypesOptions = useMemo(
    (): Item[] =>
      connectorTypes.map(store => ({
        label: store,
        icon: ConnectorIcons[store],
        value: store
      })),
    [connectorTypes]
  )
  const validationSchema = () => {
    if (isHarness(selectedStore)) return
    return Yup.object().shape({
      connectorRef: Yup.mixed().required(getString('pipelineSteps.build.create.connectorRequiredError'))
    })
  }

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'xxxlarge' }}>
        {stepName}
      </Text>

      <Text font={{ variation: FontVariation.H6 }} margin={{ bottom: 'medium' }}>
        {stepSubtitle}
      </Text>

      <Formik
        initialValues={getInitialValues()}
        formName="startupScriptStore"
        validationSchema={validationSchema()}
        onSubmit={formData => {
          submitFirstStep({ ...formData })
        }}
        enableReinitialize={true}
      >
        {formik => (
          <FormikForm>
            <Layout.Vertical
              flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
              className={css.startupScriptForm}
            >
              <Layout.Vertical>
                <Layout.Horizontal spacing="large">
                  {singleAvailableStore ? (
                    <Thumbnail
                      selected
                      value={singleAvailableStore}
                      label={singleAvailableStore}
                      icon={ConnectorIcons[singleAvailableStore]}
                    />
                  ) : (
                    <ThumbnailSelect
                      className={css.thumbnailSelect}
                      name={'selectedStore'}
                      items={connectorTypesOptions}
                      isReadonly={isReadonly}
                      onChange={storeSelected => {
                        handleOptionSelection(formik?.values, storeSelected as ConnectorTypes)
                      }}
                    />
                  )}
                </Layout.Horizontal>

                {!isEmpty(formik.values.selectedStore) && !isHarness(formik.values.selectedStore) ? (
                  <Layout.Horizontal
                    spacing={'medium'}
                    flex={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}
                    className={css.connectorContainer}
                  >
                    <FormMultiTypeConnectorField
                      key={formik.values.selectedStore}
                      onLoadingFinish={() => {
                        setIsLoadingConnectors(false)
                      }}
                      name={'connectorRef'}
                      label={`${getString('connector')}`}
                      placeholder={`${getString('select')} ${getString('connector')}`}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      width={400}
                      multiTypeProps={{ expressions, allowableTypes }}
                      isNewConnectorLabelVisible={
                        !(
                          getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME &&
                          (isReadonly || !canCreate)
                        )
                      }
                      createNewLabel={newConnectorLabel as string}
                      type={ConnectorMap[formik.values.selectedStore]}
                      enableConfigureOptions={false}
                      multitypeInputValue={multitypeInputValue}
                      gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                    />
                    {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME ? (
                      <ConfigureOptions
                        className={css.configureOptions}
                        value={formik.values.connectorRef as unknown as string}
                        type={ConnectorMap[formik.values.selectedStore]}
                        variableName="connectorRef"
                        showRequiredField={false}
                        showDefaultField={false}
                        onChange={
                          /* istanbul ignore next */ value => {
                            formik.setFieldValue('connectorRef', value)
                          }
                        }
                        isReadonly={isReadonly}
                      />
                    ) : (
                      <Button
                        variation={ButtonVariation.LINK}
                        size={ButtonSize.SMALL}
                        disabled={isReadonly || !canCreate}
                        id="new-startup-script-connector"
                        text={newConnectorLabel}
                        className={css.addStartupScript}
                        icon="plus"
                        iconProps={{ size: 12 }}
                        onClick={() => {
                          handleConnectorViewChange()
                          nextStep?.({
                            ...prevStepData,
                            selectedStore
                          })
                        }}
                      />
                    )}
                  </Layout.Horizontal>
                ) : null}
              </Layout.Vertical>

              <Layout.Horizontal spacing="medium" className={css.saveBtn}>
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={getString('continue')}
                  rightIcon="chevron-right"
                  disabled={
                    selectedStore !== 'Harness'
                      ? !shouldGotoNextStep(formik.values.connectorRef as ConnectorSelectedValue | string)
                      : false
                  }
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </FormikForm>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default StartupScriptWizardStepOne
