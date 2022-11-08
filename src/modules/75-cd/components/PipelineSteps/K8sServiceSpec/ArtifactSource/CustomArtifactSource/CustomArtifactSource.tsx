/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { defaultTo, get, isArray, memoize } from 'lodash-es'
import cx from 'classnames'
import { FormInput, Layout, Text } from '@wings-software/uicore'
import { FieldArray } from 'formik'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import { Menu } from '@blueprintjs/core'
import { ArtifactSourceBase, ArtifactSourceRenderProps } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBase'
import MultiTypeFieldScriptSelector, {
  MultiTypeFieldSelector
} from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useStrings } from 'framework/strings'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ScriptType, ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import { scriptInputType } from '@cd/components/PipelineSteps/ShellScriptStep/shellScriptTypes'
import { BuildDetails, SidecarArtifact, useGetJobDetailsForCustom } from 'services/cd-ng'
import type { AccountPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import DelegateSelectors from '@common/components/DelegateSelectors/DelegateSelectors'
import { TriggerDefaultFieldList } from '@triggers/components/Triggers/utils'
import { NoTagResults } from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactLastSteps/ArtifactImagePathTagView/ArtifactImagePathTagView'
import { isFieldFixedAndNonEmpty } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { useMutateAsGet } from '@common/hooks'
import { getFqnPath, isFieldfromTriggerTabDisabled, isNewServiceEnvEntity } from '../artifactSourceUtils'
import { isFieldRuntime } from '../../K8sServiceSpecHelper'
import css from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactConnector.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
interface CustomArtifactRenderContent extends ArtifactSourceRenderProps {
  isTagsSelectionDisabled: (data: ArtifactSourceRenderProps) => boolean
}

const DELEGATE_POLLING_INTERVAL_IN_MS = 5000

const Content = (props: CustomArtifactRenderContent): React.ReactElement => {
  const {
    isPrimaryArtifactsRuntime,
    isSidecarRuntime,
    template,
    formik,
    path,
    accountId,
    readonly,
    stageIdentifier,
    allowableTypes,
    fromTrigger,
    artifact,
    isSidecar,
    pipelineIdentifier,
    artifactPath,
    serviceIdentifier,
    initialValues
  } = props

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const scriptType: ScriptType = get(template, `artifacts.${artifactPath}.spec.source.spec.script`) || 'Bash'
  const { projectIdentifier, orgIdentifier } = useParams<PipelineType<PipelinePathProps & AccountPathProps>>()
  const scope = { projectIdentifier, orgIdentifier }
  const isFieldDisabled = (fieldName: string): boolean => {
    /* instanbul ignore else */
    if (
      readonly ||
      isFieldfromTriggerTabDisabled(
        fieldName,
        formik,
        stageIdentifier,
        fromTrigger,
        isSidecar ? (artifact as SidecarArtifact)?.identifier : undefined
      )
    ) {
      return true
    }
    return false
  }
  const versionPathValue = defaultTo(
    get(formik, `values.${path}.artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.versionPath`),
    artifact?.spec?.scripts?.fetchAllArtifacts?.versionPath
  )
  const artifactsArrayPathValue = defaultTo(
    get(formik, `values.${path}.artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.artifactsArrayPath`),
    artifact?.spec?.scripts?.fetchAllArtifacts?.artifactsArrayPath
  )
  const scriptValue = defaultTo(
    get(formik, `values.${path}.artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.spec.source.spec.script`),
    artifact?.spec?.scripts?.fetchAllArtifacts?.spec?.source?.spec?.script
  )
  const inputValue = defaultTo(
    get(formik, `values.${path}.artifacts.${artifactPath}.spec.inputs`),
    artifact?.spec?.inputs
  )

  const isAllFieldsAreFixed = (): boolean => {
    return isFieldFixedAndNonEmpty(versionPathValue || '') && isFieldFixedAndNonEmpty(artifactsArrayPathValue || '')
  }
  const isPropagatedStage = path?.includes('serviceConfig.stageOverrides')

  const {
    data: buildDetails,
    refetch: refetchBuildDetails,
    loading: fetchingBuilds,
    error
  } = useMutateAsGet(useGetJobDetailsForCustom, {
    lazy: true,
    body: {
      script: scriptValue,
      inputs: inputValue
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      versionPath: versionPathValue || '',
      arrayPath: artifactsArrayPathValue || '',
      pipelineIdentifier,
      serviceId: isNewServiceEnvEntity(path as string) ? serviceIdentifier : undefined,
      fqnPath: getFqnPath(
        path as string,
        !!isPropagatedStage,
        stageIdentifier,
        defaultTo(
          isSidecar
            ? artifactPath?.split('[')[0].concat(`.${get(initialValues?.artifacts, `${artifactPath}.identifier`)}`)
            : artifactPath,
          ''
        ),
        'version'
      )
    }
  })

  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={fetchingBuilds}
        onClick={handleClick}
      />
    </div>
  ))

  const selectItems = useMemo(() => {
    return buildDetails?.data?.map((builds: BuildDetails) => ({
      value: defaultTo(builds.number, ''),
      label: defaultTo(builds.number, '')
    }))
  }, [buildDetails?.data])

  const getBuildDetails = (): { label: string; value: string }[] => {
    if (fetchingBuilds) {
      return [{ label: 'Loading Builds...', value: 'Loading Builds...' }]
    }
    return defaultTo(selectItems, [])
  }

  const isRuntime = isPrimaryArtifactsRuntime || isSidecarRuntime
  return (
    <>
      {isRuntime && (
        <Layout.Vertical key={artifactPath} className={css.inputWidth}>
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            {isFieldRuntime(`artifacts.${artifactPath}.spec.timeout`, template) && (
              <FormMultiTypeDurationField
                name={`${path}.artifacts.${artifactPath}.spec.timeout`}
                label={getString('pipelineSteps.timeoutLabel')}
                disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.timeout`)}
                multiTypeDurationProps={{
                  width: 391,
                  expressions,
                  enableConfigureOptions: false,
                  allowableTypes
                }}
              />
            )}
          </div>
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            {isFieldRuntime(
              `artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.spec.source.spec.script`,
              template
            ) && (
              <MultiTypeFieldScriptSelector
                name={`${path}.artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.spec.source.spec.script`}
                label={getString('common.script')}
                defaultValueToReset=""
                disabled={isFieldDisabled(
                  `artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.spec.source.spec.script`
                )}
                allowedTypes={allowableTypes}
                disableTypeSelection={readonly}
                skipRenderValueInExpressionLabel
                expressionRender={() => {
                  return (
                    <ShellScriptMonacoField
                      name={`${path}.artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.spec.source.spec.script`}
                      scriptType={scriptType}
                      disabled={readonly}
                      expressions={expressions}
                    />
                  )
                }}
              >
                <ShellScriptMonacoField
                  name={`${path}.artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.spec.source.spec.script`}
                  scriptType={scriptType}
                  disabled={readonly}
                  expressions={expressions}
                />
              </MultiTypeFieldScriptSelector>
            )}
          </div>
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            {isFieldRuntime(
              `artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.artifactsArrayPath`,
              template
            ) && (
              <FormInput.MultiTextInput
                name={`${path}.artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.artifactsArrayPath`}
                label={getString('pipeline.artifactsSelection.artifactsArrayPath')}
                placeholder={getString('pipeline.artifactsSelection.artifactPathPlaceholder')}
                disabled={isFieldDisabled(
                  `artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.artifactsArrayPath`
                )}
                multiTextInputProps={{
                  width: 391,
                  expressions,
                  allowableTypes
                }}
              />
            )}
          </div>
          <div className={cx(stepCss.formGroup, stepCss.md)}>
            {isFieldRuntime(`artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.versionPath`, template) && (
              <FormInput.MultiTextInput
                name={`${path}.artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.versionPath`}
                label={getString('pipeline.artifactsSelection.versionPath')}
                placeholder={getString('pipeline.artifactsSelection.versionPathPlaceholder')}
                disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.versionPath`)}
                multiTextInputProps={{
                  width: 391,
                  expressions,
                  allowableTypes
                }}
              />
            )}
          </div>

          <div className={cx(cx(stepCss.formGroup, stepCss.md))}>
            {!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.version`, template) && (
              <FormInput.MultiTypeInput
                selectItems={getBuildDetails()}
                label={getString('version')}
                name={`${path}.artifacts.${artifactPath}.spec.version`}
                disabled={isFieldDisabled(`artifacts.${artifactPath}.spec.version`)}
                placeholder={getString('pipeline.artifactsSelection.versionPlaceholder')}
                useValue
                multiTypeInputProps={{
                  width: 391,
                  expressions,
                  allowableTypes,
                  selectProps: {
                    noResults: (
                      <NoTagResults
                        tagError={error}
                        isServerlessDeploymentTypeSelected={false}
                        defaultErrorText={getString('pipeline.artifactsSelection.validation.noBuild')}
                      />
                    ),
                    itemRenderer: itemRenderer,
                    items: getBuildDetails(),
                    allowCreatingNewItems: true
                  },
                  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                    if (
                      e?.target?.type !== 'text' ||
                      (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
                    ) {
                      return
                    }
                    if (isAllFieldsAreFixed()) {
                      refetchBuildDetails()
                    }
                  }
                }}
              />
            )}
          </div>
          {!!fromTrigger && isFieldRuntime(`artifacts.${artifactPath}.spec.version`, template) && (
            <FormInput.MultiTextInput
              label={getString('version')}
              multiTextInputProps={{
                width: 391,
                expressions,
                value: TriggerDefaultFieldList.build,
                allowableTypes
              }}
              disabled={true}
              name={`${path}.artifacts.${artifactPath}.spec.version`}
            />
          )}

          {get(template, `artifacts.${artifactPath}.spec.inputs`) &&
          isArray(get(template, `artifacts.${artifactPath}.spec.inputs`)) ? (
            <div className={stepCss.formGroup}>
              <MultiTypeFieldSelector
                name={`${path}.artifacts.${artifactPath}.spec.inputs`}
                label={getString('pipeline.scriptInputVariables')}
                defaultValueToReset={[]}
                disableTypeSelection
                formik={formik}
              >
                <FieldArray
                  name={`${path}.artifacts.${artifactPath}.spec.inputs`}
                  render={() => {
                    return (
                      <div className={css.panel}>
                        <div className={css.variables}>
                          <span className={css.label}>Name</span>
                          <span className={css.label}>Type</span>
                          <span className={css.label}>Value</span>
                        </div>
                        {get(template, `artifacts.${artifactPath}.spec.inputs`)?.map((type: any, i: number) => {
                          return (
                            <div className={css.variables} key={type.value}>
                              <FormInput.Text
                                name={`${path}.artifacts.${artifactPath}.spec.inputs[${i}].name`}
                                placeholder={getString('name')}
                                disabled={true}
                              />
                              <FormInput.Select
                                items={scriptInputType}
                                name={`${path}.artifacts.${artifactPath}.spec.inputs[${i}].type`}
                                placeholder={getString('typeLabel')}
                                disabled={true}
                              />
                              <FormInput.MultiTextInput
                                name={`${path}.artifacts.${artifactPath}.spec.inputs[${i}].value`}
                                multiTextInputProps={{
                                  allowableTypes,
                                  expressions,
                                  disabled: readonly
                                }}
                                label=""
                                disabled={readonly}
                                placeholder={getString('valueLabel')}
                              />
                            </div>
                          )
                        })}
                      </div>
                    )
                  }}
                />
              </MultiTypeFieldSelector>
            </div>
          ) : null}

          {get(template, `artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.attributes`) &&
          isArray(get(template, `artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.attributes`)) ? (
            <div className={stepCss.formGroup}>
              <MultiTypeFieldSelector
                name={`${path}.artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.attributes`}
                label={getString('common.additionalAttributes')}
                defaultValueToReset={[]}
                disableTypeSelection
                formik={formik}
              >
                <FieldArray
                  name={`${path}.artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.attributes`}
                  render={() => {
                    return (
                      <div className={css.panel}>
                        <div className={css.variables}>
                          <span className={css.label}>Name</span>
                          <span className={css.label}>Type</span>
                          <span className={css.label}>Value</span>
                        </div>
                        {get(template, `artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.attributes`)?.map(
                          (type: any, i: number) => {
                            return (
                              <div className={css.variables} key={type.value}>
                                <FormInput.Text
                                  name={`${path}.artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.attributes[${i}].name`}
                                  placeholder={getString('name')}
                                  disabled={true}
                                />
                                <FormInput.Select
                                  items={scriptInputType}
                                  name={`${path}.artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.attributes[${i}].type`}
                                  placeholder={getString('typeLabel')}
                                  disabled={true}
                                />
                                <FormInput.MultiTextInput
                                  name={`${path}.artifacts.${artifactPath}.spec.scripts.fetchAllArtifacts.attributes[${i}].value`}
                                  multiTextInputProps={{
                                    allowableTypes,
                                    expressions,
                                    disabled: readonly
                                  }}
                                  label=""
                                  disabled={readonly}
                                  placeholder={getString('valueLabel')}
                                />
                              </div>
                            )
                          }
                        )}
                      </div>
                    )
                  }}
                />
              </MultiTypeFieldSelector>
            </div>
          ) : null}

          {isFieldRuntime(`artifacts.${artifactPath}.spec.delegateSelectors`, template) && (
            <div className={cx(css.customArtifactContainer)}>
              <Text color={Color.GREY_800} margin={{ top: 'xlarge', bottom: 'small' }}>
                {getString('common.defineDelegateSelector')}
              </Text>
              <DelegateSelectors
                allowNewTag={false}
                placeholder={getString('pipeline.artifactsSelection.delegateselectionPlaceholder')}
                selectedItems={get(formik, `values.${path}.artifacts.${artifactPath}.spec.delegateSelectors`)}
                onChange={selectors => {
                  formik.setFieldValue(`${path}.artifacts.${artifactPath}.spec.delegateSelectors`, selectors)
                }}
                pollingInterval={DELEGATE_POLLING_INTERVAL_IN_MS}
                {...scope}
              ></DelegateSelectors>
            </div>
          )}
        </Layout.Vertical>
      )}
    </>
  )
}

export class CustomArtifactSource extends ArtifactSourceBase<ArtifactSourceRenderProps> {
  protected artifactType = ENABLED_ARTIFACT_TYPES.CustomArtifact
  protected isSidecar = false

  isTagsSelectionDisabled(): boolean {
    return false
  }

  renderContent(props: ArtifactSourceRenderProps): JSX.Element | null {
    if (!props.isArtifactsRuntime) {
      return null
    }

    this.isSidecar = defaultTo(props.isSidecar, false)

    return <Content {...props} isTagsSelectionDisabled={this.isTagsSelectionDisabled.bind(this)} />
  }
}
