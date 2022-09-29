/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import {
  Layout,
  Text,
  StepWizard,
  StepProps,
  Button,
  ButtonSize,
  ButtonVariation,
  Label,
  AllowedTypes
} from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { FontVariation, Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { Dialog, IDialogProps, Classes } from '@blueprintjs/core'
import type { FormikProps } from 'formik'
import { get, isEmpty, noop } from 'lodash-es'
import type { IconProps } from '@harness/icons'
import { useStrings } from 'framework/strings'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import StepHelmAuth from '@connectors/components/CreateConnector/HelmRepoConnector/StepHelmRepoAuth'
import type { ConnectorConfigDTO, PageConnectorResponse } from 'services/cd-ng'
import StepAWSAuthentication from '@connectors/components/CreateConnector/AWSConnector/StepAuth/StepAWSAuthentication'
import { CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import {
  buildAWSPayload,
  buildGcpPayload,
  buildHelmPayload,
  buildOCIHelmPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import GcpAuthentication from '@connectors/components/CreateConnector/GcpConnector/StepAuth/GcpAuthentication'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { getConnectorNameFromValue, getStatus } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import {
  getHelmManifestSpec,
  getManifestTriggerInitialSource
} from '@triggers/components/Triggers/ManifestTrigger/ManifestWizardPageUtils'
import {
  ManifestDataType,
  ManifestToConnectorMap,
  ManifestStoreMap,
  manifestTypeIcons,
  getManifestLocation
} from '@pipeline/components/ManifestSelection/Manifesthelper'
import type { ManifestTypes, ManifestStores } from '@pipeline/components/ManifestSelection/ManifestInterface'
import { ManifestWizard } from '../ManifestWizard/ManifestWizard'
import HelmWithHttp from '../ManifestWizardSteps/HelmWithHttp/HelmWithHttp'
import HelmWithGcs from '../ManifestWizardSteps/HelmWithGcs/HelmWithGcs'
import HelmWithS3 from '../ManifestWizardSteps/HelmWithS3/HelmWithS3'
import ConnectorField from './ConnectorField'
import type { ManifestLastStepProps, ManifestTriggerSource } from '../ManifestInterface'
import css from '../ManifestSelection.module.scss'

const DIALOG_PROPS: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}

interface ManifestListViewProps {
  connectors: PageConnectorResponse | undefined
  isReadonly: boolean
  allowableTypes: AllowedTypes
  formikProps: FormikProps<any>
}

export default function ManifestListView({
  connectors,
  isReadonly,
  allowableTypes,
  formikProps
}: ManifestListViewProps): JSX.Element {
  const { source: triggerSource } = formikProps.values
  const { spec: triggerSpec } = triggerSource ?? getManifestTriggerInitialSource()
  const { type: selectedManifest, spec: manifestSpec } = triggerSpec ?? getHelmManifestSpec()
  const { store } = manifestSpec
  const [connectorView, setConnectorView] = useState(false)
  const [manifestStore, setManifestStore] = useState(store.type ?? '')
  const [isEditMode, setIsEditMode] = useState(false)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const handleSubmit = (manifestTriggerSource: ManifestTriggerSource): void => {
    formikProps.setValues({ ...formikProps.values, source: manifestTriggerSource })

    hideConnectorModal()
    setConnectorView(false)
    setManifestStore('')
  }

  const removeManifest = (): void => {
    handleSubmit(getManifestTriggerInitialSource())
  }

  const handleConnectorViewChange = (isConnectorView: boolean): void => {
    setConnectorView(isConnectorView)
    setIsEditMode(false)
  }
  const handleStoreChange = (selectedStore?: ManifestStores): void => {
    setManifestStore(selectedStore as string)
  }

  const lastStepProps = useMemo((): ManifestLastStepProps => {
    const manifestDetailsProps: ManifestLastStepProps = {
      key: getString('pipeline.manifestType.manifestDetails'),
      name: getString('pipeline.manifestType.manifestDetails'),
      expressions,
      allowableTypes,
      stepName: getString('pipeline.manifestType.manifestDetails'),
      initialValues: triggerSpec,
      handleSubmit,
      isReadonly
    }

    return manifestDetailsProps
  }, [expressions, allowableTypes, triggerSpec, isReadonly])

  const getIconProps = (): IconProps => {
    const iconProps: IconProps = {
      name: manifestTypeIcons[selectedManifest as ManifestTypes]
    }
    if (selectedManifest === ManifestDataType.HelmChart) {
      iconProps.color = Color.WHITE
    }
    return iconProps
  }

  const lastStep = useMemo((): React.ReactElement<StepProps<ConnectorConfigDTO>> => {
    const selectedStore = (manifestStore || store.type) as ManifestStores
    switch (selectedStore) {
      case 'Http':
        return <HelmWithHttp {...lastStepProps} />
      case 'S3':
        return <HelmWithS3 {...lastStepProps} />
      case 'Gcs':
        return <HelmWithGcs {...lastStepProps} />
      default:
        return <></>
    }
  }, [lastStepProps, manifestStore])

  const connectorDetailStepProps = {
    type: ManifestToConnectorMap[manifestStore],
    name: getString('overview'),
    isEditMode,
    gitDetails: { repoIdentifier, branch, getDefaultFromOtherRepo: true }
  }

  const delegateSelectorStepProps = {
    name: getString('delegate.DelegateselectionLabel'),
    isEditMode,
    setIsEditMode,
    connectorInfo: undefined
  }

  const ConnectorTestConnectionProps = {
    name: getString('connectors.stepThreeName'),
    connectorInfo: undefined,
    isStep: true,
    isLastStep: false,
    type: ManifestToConnectorMap[manifestStore]
  }

  const gitTypeStoreAuthenticationProps = {
    name: getString('credentials'),
    isEditMode,
    setIsEditMode,
    accountId,
    orgIdentifier,
    projectIdentifier,
    connectorInfo: undefined,
    onConnectorCreated: noop
  }

  const authenticationStepProps = {
    ...gitTypeStoreAuthenticationProps,
    identifier: CONNECTOR_CREDENTIALS_STEP_IDENTIFIER
  }

  const getNewConnectorSteps = useCallback((): JSX.Element => {
    switch (manifestStore) {
      case ManifestStoreMap.Http:
        return (
          <StepWizard title={getString('connectors.createNewConnector')}>
            <ConnectorDetailsStep {...connectorDetailStepProps} />
            <StepHelmAuth {...authenticationStepProps} isOCIHelm={manifestStore === ManifestStoreMap.OciHelmChart} />
            <DelegateSelectorStep
              {...delegateSelectorStepProps}
              buildPayload={manifestStore === ManifestStoreMap.Http ? buildHelmPayload : buildOCIHelmPayload}
            />
            <ConnectorTestConnection {...ConnectorTestConnectionProps} />
          </StepWizard>
        )
      case ManifestStoreMap.S3:
        return (
          <StepWizard iconProps={{ size: 37 }} title={getString('connectors.createNewConnector')}>
            <ConnectorDetailsStep {...connectorDetailStepProps} />
            <StepAWSAuthentication {...authenticationStepProps} />
            <DelegateSelectorStep {...delegateSelectorStepProps} buildPayload={buildAWSPayload} />
            <ConnectorTestConnection {...ConnectorTestConnectionProps} />
          </StepWizard>
        )
      case ManifestStoreMap.Gcs:
      default:
        return (
          <StepWizard iconProps={{ size: 37 }} title={getString('connectors.createNewConnector')}>
            <ConnectorDetailsStep {...connectorDetailStepProps} />
            <GcpAuthentication {...authenticationStepProps} />
            <DelegateSelectorStep {...delegateSelectorStepProps} buildPayload={buildGcpPayload} />
            <ConnectorTestConnection {...ConnectorTestConnectionProps} />
          </StepWizard>
        )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorView, manifestStore])

  const [showConnectorModal, hideConnectorModal] = useModalHook(() => {
    const onClose = (): void => {
      setConnectorView(false)
      hideConnectorModal()
      setManifestStore('')
      setIsEditMode(false)
    }

    return (
      <Dialog onClose={onClose} {...DIALOG_PROPS} className={cx(css.modal, Classes.DIALOG)}>
        <div className={css.createConnectorWizard}>
          <ManifestWizard
            manifestStores={['Http', 'S3', 'Gcs']} // Update list once we start supporting more ManifestStores
            newConnectorView={connectorView}
            expressions={expressions}
            allowableTypes={allowableTypes}
            handleConnectorViewChange={handleConnectorViewChange}
            handleStoreChange={handleStoreChange}
            initialValues={triggerSpec}
            newConnectorSteps={getNewConnectorSteps()}
            lastStep={lastStep}
            iconsProps={getIconProps()}
            isReadonly={isReadonly}
          />
        </div>
        <Button minimal icon="cross" onClick={onClose} className={css.crossIcon} />
      </Dialog>
    )
  }, [connectorView, expressions.length, expressions, allowableTypes, isReadonly, lastStep])

  const isManifestPresent = !!store?.type && !!store?.spec?.connectorRef

  if (isManifestPresent) {
    const connectorRef = store?.spec?.connectorRef
    const { color } = getStatus(connectorRef, connectors, accountId)
    const connectorName = getConnectorNameFromValue(connectorRef, connectors)
    const manifestLocation = get(manifestSpec, getManifestLocation(selectedManifest, store?.type as ManifestStores))

    return (
      <Layout.Vertical style={{ width: '100%' }}>
        <Layout.Vertical spacing="small" style={{ flexShrink: 'initial' }}>
          <div className={cx(css.manifestList, css.listHeader)}>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('pipelineSteps.serviceTab.manifestList.manifestType')}
            </Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>
              {getString('pipelineSteps.serviceTab.manifestList.manifestStore')}
            </Text>
            <Text font={{ variation: FontVariation.TABLE_HEADERS }}>{getString('location')}</Text>
            <span></span>
          </div>
          <Layout.Vertical style={{ flexShrink: 'initial' }}>
            <section>
              <div className={css.rowItem}>
                <section className={css.manifestList}>
                  <div>{getString('pipeline.manifestTypeLabels.HelmChartLabel')}</div>
                  <ConnectorField
                    manifestStore={store?.type as ManifestStores}
                    connectorRef={connectorRef}
                    connectorName={connectorName}
                    connectorColor={color}
                  />

                  {!isEmpty(manifestLocation) && (
                    <span>
                      <Text lineClamp={1} width={200}>
                        {typeof manifestLocation === 'string' ? manifestLocation : manifestLocation.join(', ')}
                      </Text>
                    </span>
                  )}
                  <span>
                    <Layout.Horizontal>
                      <Button icon="Edit" iconProps={{ size: 18 }} onClick={showConnectorModal} minimal />
                      <Button icon="main-trash" iconProps={{ size: 18 }} onClick={removeManifest} minimal />
                    </Layout.Horizontal>
                  </span>
                </section>
              </div>
            </section>
          </Layout.Vertical>
        </Layout.Vertical>
      </Layout.Vertical>
    )
  }

  return (
    <Layout.Vertical spacing={'medium'} flex={{ alignItems: 'flex-start' }}>
      <div>
        <Label
          style={{
            fontWeight: 'normal'
          }}
          data-tooltip-id={'selectArtifactManifestLabel'}
        >
          {getString('manifestsText')}
        </Label>
        <Button
          className={css.addManifest}
          id="add-manifest"
          size={ButtonSize.SMALL}
          variation={ButtonVariation.LINK}
          data-test-id="addManifest"
          onClick={showConnectorModal}
          text={getString('pipeline.artifactTriggerConfigPanel.defineManifestSource')}
        />
      </div>
    </Layout.Vertical>
  )
}
