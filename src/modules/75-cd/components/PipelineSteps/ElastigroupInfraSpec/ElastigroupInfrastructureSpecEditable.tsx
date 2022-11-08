/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Text,
  Layout,
  FormInput,
  Formik,
  FormikForm,
  Icon,
  getMultiTypeFromValue,
  MultiTypeInputType,
  ButtonSize,
  Button,
  ButtonVariation,
  FormError,
  useToggleOpen
} from '@wings-software/uicore'
import { FontVariation } from '@harness/design-system'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { debounce, get, isEmpty, isPlainObject, noop } from 'lodash-es'
import { Classes, Dialog, FormGroup, IDialogProps, Intent } from '@blueprintjs/core'
import { DeployTabs } from '@pipeline/components/PipelineStudio/CommonUtils/DeployStageSetupShellUtils'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import type { ElastigroupConfiguration, ElastigroupInfrastructure, StoreConfigWrapper } from 'services/cd-ng'

import { StageErrorContext } from '@pipeline/context/StageErrorContext'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { connectorTypes } from '@pipeline/utils/constants'
import { useQueryParams } from '@common/hooks'
import { ConnectorRefFormValueType, getConnectorRefValue } from '@cd/utils/connectorUtils'
import { ConfigFilesMap } from '@pipeline/components/ConfigFilesSelection/ConfigFilesHelper'
import { ElastigroupInfraSpecEditableProps, getValidationSchema } from './ElastigroupInfraTypes'
import { ElastigroupConfig } from './ElastigroupConfig'
import css from './ElastigroupInfra.module.scss'

const DIALOG_PROPS: IDialogProps = {
  isOpen: true,
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: false,
  canOutsideClickClose: false,
  enforceFocus: false,
  style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
}

const ElastigroupInfraSpecEditable: React.FC<ElastigroupInfraSpecEditableProps> = ({
  initialValues,
  onUpdate,
  readonly,
  allowableTypes
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const { expressions } = useVariablesExpression()
  const { getString } = useStrings()

  const { subscribeForm, unSubscribeForm } = React.useContext(StageErrorContext)
  const formikRef = React.useRef<FormikProps<unknown> | null>(null)

  React.useEffect(() => {
    subscribeForm({
      tab: DeployTabs.INFRASTRUCTURE,
      form: formikRef
    })
    return () =>
      unSubscribeForm({
        tab: DeployTabs.INFRASTRUCTURE,
        form: formikRef
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getInitialValues = (): StoreConfigWrapper => {
    const values = formikRef.current?.values as ElastigroupInfrastructure
    const currentValues = values.configuration

    //currently only harness store type supported but still check is added here
    /* istanbul ignore next */ if (currentValues.store.type !== ConfigFilesMap.Harness)
      return null as unknown as StoreConfigWrapper

    return currentValues.store
  }

  const isElastigroupConfigAdded = (): boolean => {
    const values = formikRef.current?.values as ElastigroupInfrastructure

    return (
      values?.configuration.store.spec &&
      (!isEmpty(values.configuration.store.spec?.files) || !isEmpty(values.configuration.store.spec?.secretFiles))
    )
  }

  const formikRefUpdate = (field: string, value: any): void => {
    formikRef.current?.setFieldValue(field, value)
  }

  const removeElastigroupConfig = (): void => {
    formikRefUpdate('configuration.store.spec', {})
  }

  const { isOpen, open: showElastigroupConfigModal, close: hideElastigroupConfigModal } = useToggleOpen()

  const renderElastigroupList = React.useCallback((spec: ElastigroupConfiguration): React.ReactElement => {
    return (
      <div className={css.rowItem}>
        <section className={css.elastigroupList}>
          <div className={css.columnId}>
            <Icon inline name={'harness'} size={20} />
            {getString('harness')}
          </div>
          {get(spec, 'store.spec.files')?.length && (
            <>
              <Text lineClamp={1} width={200} className={css.elastigroupLocation}>
                <span>{getString('pipeline.startup.plainText')}</span>
              </Text>
              <Text lineClamp={1} width={200} className={css.elastigroupLocation}>
                <span>{get(spec, 'store.spec.files')}</span>
              </Text>
            </>
          )}
          {get(spec, 'store.spec.secretFiles')?.length && (
            <>
              <Text lineClamp={1} width={200} className={css.elastigroupLocation}>
                <span>{getString('encrypted')}</span>
              </Text>
              <Text lineClamp={1} width={200} className={css.elastigroupLocation}>
                <span>{get(spec, 'store.spec.secretFiles')}</span>
              </Text>
            </>
          )}

          {!readonly && (
            <span>
              <Layout.Horizontal className={css.elastigroupListButton}>
                <Button icon="Edit" iconProps={{ size: 18 }} onClick={() => showElastigroupConfigModal()} minimal />

                <Button iconProps={{ size: 18 }} icon="main-trash" onClick={removeElastigroupConfig} minimal />
              </Layout.Horizontal>
            </span>
          )}
        </section>
      </div>
    )
  }, [])

  const handleSubmit = (data: ElastigroupConfiguration): void => {
    const specField = data.store.spec
    const currentValues = formikRef.current?.values as ElastigroupInfrastructure
    const newData: ElastigroupInfrastructure = {
      ...currentValues
    }
    if (specField.files) {
      newData.configuration.store.spec = {
        files: specField.files
      }
    }
    if (specField.secretFiles) {
      newData.configuration.store.spec = {
        secretFiles: specField.secretFiles
      }
    }
    formikRef.current?.setValues({ ...newData })
    hideElastigroupConfigModal()
  }

  return (
    <Layout.Vertical spacing="medium">
      <Formik<ElastigroupInfrastructure>
        formName="elastigroupInfra"
        initialValues={initialValues}
        enableReinitialize={false}
        validate={value => {
          const data: Partial<ElastigroupInfrastructure> = {
            ...value,
            configuration: value.configuration,
            connectorRef: undefined,
            allowSimultaneousDeployments: value.allowSimultaneousDeployments
          }
          /* istanbul ignore else */ if (value.connectorRef) {
            data.connectorRef = getConnectorRefValue(value.connectorRef as ConnectorRefFormValueType)
          }
          delayedOnUpdate(data)
        }}
        validationSchema={getValidationSchema(getString)}
        onSubmit={noop}
      >
        {formik => {
          window.dispatchEvent(new CustomEvent('UPDATE_ERRORS_STRIP', { detail: DeployTabs.INFRASTRUCTURE }))
          formikRef.current = formik as FormikProps<unknown> | null
          const errorCheck = /* istanbul ignore next */ (name: string): boolean =>
            ((get(formik?.touched, name) || (formik?.submitCount && formik?.submitCount > 0)) &&
              get(formik?.errors, name) &&
              !isPlainObject(get(formik?.errors, name)) &&
              !isElastigroupConfigAdded()) as boolean
          return (
            <FormikForm>
              <Layout.Horizontal className={css.formRow} spacing="medium">
                <FormMultiTypeConnectorField
                  name="connectorRef"
                  label={
                    <Text font={{ variation: FontVariation.FORM_SUB_SECTION }} margin={{ bottom: 12 }}>
                      {getString('connector')}
                    </Text>
                  }
                  placeholder={getString('connectors.selectConnector')}
                  disabled={readonly}
                  accountIdentifier={accountId}
                  multiTypeProps={{ expressions, allowableTypes }}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={450}
                  connectorLabelClass={css.connectorRef}
                  enableConfigureOptions={false}
                  style={{ marginBottom: 'var(--spacing-large)' }}
                  type={connectorTypes.Spot}
                  tooltipProps={{
                    dataTooltipId: 'elastigroupConnector'
                  }}
                  gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                />
                {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && !readonly && (
                  <ConfigureOptions
                    value={formik.values.connectorRef as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Icon name={getIconByType(connectorTypes.Spot)}></Icon>
                        <Text>{getString('cd.steps.elastigroup.connectorSpot')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="connectorRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={
                      /* istanbul ignore next */ value => {
                        formik.setFieldValue('connectorRef', value)
                      }
                    }
                    isReadonly={readonly}
                    className={css.marginTop}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Vertical
                flex={{ alignItems: 'flex-start' }}
                margin={{ bottom: 'medium', top: 16 }}
                spacing="medium"
              >
                <Text font={{ variation: FontVariation.FORM_SUB_SECTION }}>
                  {getString('cd.steps.elastigroup.elastigroupConfig')}
                </Text>
              </Layout.Vertical>
              <Layout.Horizontal spacing="medium">
                <FormGroup
                  labelFor="configuration.store.spec"
                  helperText={
                    errorCheck('configuration.store.spec') ? (
                      /* istanbul ignore next */ <FormError
                        name={'configuration.store.spec'}
                        errorMessage={get(formik?.errors, 'configuration.store.spec')}
                      />
                    ) : null
                  }
                  intent={
                    errorCheck('configuration.store.spec') ? /* istanbul ignore next */ Intent.DANGER : Intent.NONE
                  }
                  style={{ width: '100%' }}
                >
                  {isElastigroupConfigAdded() ? (
                    <Layout.Vertical style={{ flexShrink: 'initial' }}>
                      <div className={cx(css.elastigroupList, css.listHeader)}>
                        <Text font={{ variation: FontVariation.TABLE_HEADERS }} width={200}>
                          {getString('store')}
                        </Text>
                        <Text font={{ variation: FontVariation.TABLE_HEADERS }} width={200}>
                          {getString('typeLabel')}
                        </Text>
                        <Text font={{ variation: FontVariation.TABLE_HEADERS }} width={200}>
                          {getString('location')}
                        </Text>
                        <span></span>
                      </div>
                      <section>{renderElastigroupList(formik.values.configuration)}</section>
                    </Layout.Vertical>
                  ) : (
                    <Button
                      id="add-elastigroup-config"
                      size={ButtonSize.SMALL}
                      variation={ButtonVariation.LINK}
                      data-test-id="addElastigroupConfig"
                      onClick={() => showElastigroupConfigModal()}
                      icon={'plus'}
                      text={getString('common.addName', { name: getString('cd.steps.elastigroup.elastigroupConfig') })}
                    />
                  )}
                </FormGroup>
              </Layout.Horizontal>
              <Dialog
                onClose={hideElastigroupConfigModal}
                {...DIALOG_PROPS}
                isOpen={isOpen}
                className={cx(css.modal, Classes.DIALOG)}
              >
                <div className={css.createConnectorWizard}>
                  <ElastigroupConfig handleSubmit={handleSubmit} initialValues={getInitialValues()} />
                </div>
                <Button minimal icon="cross" onClick={hideElastigroupConfigModal} className={css.crossIcon} />
              </Dialog>
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }} className={css.lastRow}>
                <FormInput.CheckBox
                  className={css.simultaneousDeployment}
                  tooltipProps={{
                    dataTooltipId: 'elastigroupAllowSimultaneousDeployments'
                  }}
                  name={'allowSimultaneousDeployments'}
                  label={getString('cd.allowSimultaneousDeployments')}
                  disabled={readonly}
                />
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

export const ElastigroupInfrastructureSpecEditable = React.memo(ElastigroupInfraSpecEditable)
