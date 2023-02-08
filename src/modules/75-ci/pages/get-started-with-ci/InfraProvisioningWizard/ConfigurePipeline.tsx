/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import type { FormikContextType } from 'formik'
import { noop } from 'lodash-es'
import {
  Text,
  Layout,
  Card,
  Icon,
  IconName,
  Container,
  FormError,
  Formik,
  FormikForm,
  FormInput,
  SelectOption,
  Collapse
} from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { Separator } from '@common/components'
import RepoBranchSelectV2 from '@common/components/RepoBranchSelectV2/RepoBranchSelectV2'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Connectors } from '@connectors/constants'
import { getScmConnectorPrefix } from '@ci/utils/HostedBuildsUtils'

import css from './InfraProvisioningWizard.module.scss'

export enum PipelineConfigurationOption {
  StarterPipeline = 'STARTER_PIPELINE',
  ChooseExistingYAML = 'CHOOSE_EXISTING_YAML',
  ChooseStarterConfig_DotNetCore = 'CHOOSE_STARTER_CONFIG_DOT_NET_CORE',
  ChooseStarterConfig_JavenWithMaven = 'CHOOSE_STARTER_CONFIG_JAVA_WITH_MAVEN',
  ChooseStarterConfig_Go = 'CHOOSE_STARTER_CONFIG_GO',
  ChooseStarterConfig_NodeJS = 'CHOOSE_STARTER_CONFIG_NODE_JS',
  ChooseStarterConfig_Python = 'CHOOSE_STARTER_CONFIG_PYTHON'
}

export const StarterConfigurations = [
  PipelineConfigurationOption.ChooseStarterConfig_DotNetCore,
  PipelineConfigurationOption.ChooseStarterConfig_JavenWithMaven,
  PipelineConfigurationOption.ChooseStarterConfig_Go,
  PipelineConfigurationOption.ChooseStarterConfig_NodeJS,
  PipelineConfigurationOption.ChooseStarterConfig_Python
]

export const StarterConfigIdToOptionMap: { [key: string]: PipelineConfigurationOption } = {
  'starter-pipeline': PipelineConfigurationOption.StarterPipeline,
  'choose-existing-yaml': PipelineConfigurationOption.ChooseExistingYAML,
  'dot-net-core': PipelineConfigurationOption.ChooseStarterConfig_DotNetCore,
  'java-with-maven': PipelineConfigurationOption.ChooseStarterConfig_JavenWithMaven,
  go: PipelineConfigurationOption.ChooseStarterConfig_Go,
  nodejs: PipelineConfigurationOption.ChooseStarterConfig_NodeJS,
  python: PipelineConfigurationOption.ChooseStarterConfig_Python
}

export interface ImportPipelineYAMLInterface {
  branch?: string
  yamlPath?: string
}

export interface ConfigurePipelineRef {
  values?: ImportPipelineYAMLInterface
  configuredOption?: StarterTemplate
  showValidationErrors: () => void
}

export type ConfigurePipelineForwardRef =
  | ((instance: ConfigurePipelineRef | null) => void)
  | React.MutableRefObject<ConfigurePipelineRef | null>
  | null

interface ConfigurePipelineProps {
  configuredGitConnector: ConnectorInfoDTO | undefined
  repoName: string
  showError?: boolean
  disableNextBtn: () => void
  enableNextBtn: () => void
  enableForTesting?: boolean
}

interface StarterTemplate {
  name: string
  label?: string
  description: string
  pipelineYaml?: string
  icon: IconName
  id: string
}

const ConfigurePipelineRef = (props: ConfigurePipelineProps, forwardRef: ConfigurePipelineForwardRef) => {
  const { orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { showError, configuredGitConnector, repoName, enableForTesting } = props
  const { getString } = useStrings()
  const [pipelineName, setPipelineName] = useState<string>()
  const pipelineNameToSpecify = `Build ${pipelineName}`
  const formikRef = useRef<FormikContextType<ImportPipelineYAMLInterface>>()
  const starterMinimumPipeline: StarterTemplate = {
    name: getString('ci.getStartedWithCI.createEmptyPipelineConfig'),
    description: getString('ci.getStartedWithCI.starterPipelineHelptext'),
    icon: 'create-via-pipeline-template',
    id: 'starter-pipeline'
  }
  const [selectedConfigOption, setSelectedConfigOption] = useState<StarterTemplate>(starterMinimumPipeline)

  const configuredGitConnectorIdentifier = useMemo(
    (): string =>
      configuredGitConnector?.identifier
        ? `${getScmConnectorPrefix(configuredGitConnector)}${configuredGitConnector.identifier}`
        : '',
    [configuredGitConnector]
  )

  const markFieldsTouchedToShowValidationErrors = React.useCallback((): void => {
    const { values, setFieldTouched } = formikRef.current || {}
    const { branch, yamlPath } = values || {}
    if (!branch) {
      setFieldTouched?.('branch', true)
    }
    if (!yamlPath) {
      setFieldTouched?.('yamlPath', true)
    }
  }, [formikRef.current])

  const setForwardRef = ({ values, configuredOption }: Omit<ConfigurePipelineRef, 'showValidationErrors'>): void => {
    if (!forwardRef || typeof forwardRef === 'function') {
      return
    }

    forwardRef.current = {
      values,
      configuredOption,
      showValidationErrors: markFieldsTouchedToShowValidationErrors
    }
  }

  useEffect(() => {
    if (selectedConfigOption) {
      setForwardRef({ configuredOption: selectedConfigOption })
      setPipelineName(selectedConfigOption.name)
    }
  }, [
    selectedConfigOption,
    pipelineNameToSpecify,
    orgIdentifier,
    projectIdentifier,
    configuredGitConnectorIdentifier,
    repoName
  ])

  const renderCard = useCallback(
    (item: StarterTemplate): JSX.Element => {
      const { name, description, icon, id, label } = item
      const isCurrentOptionSelected = item.id === selectedConfigOption?.id
      return (
        <Card
          onClick={() => setSelectedConfigOption(item)}
          selected={isCurrentOptionSelected}
          cornerSelected={true}
          className={css.configOptionCard}
          key={item.id}
        >
          <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="large">
            <Icon name={icon} size={30} />
            <Layout.Vertical padding={{ left: 'large' }} spacing="xsmall" width="100%">
              <Text font={{ variation: FontVariation.BODY2 }}>{label ?? name}</Text>
              <Text font={{ variation: FontVariation.TINY }}>{description}</Text>
              {isCurrentOptionSelected &&
              StarterConfigIdToOptionMap[id] === PipelineConfigurationOption.ChooseExistingYAML ? (
                <Layout.Vertical>
                  <Container width="90%">
                    <Separator />
                  </Container>
                  <Container width="60%">
                    <Formik<ImportPipelineYAMLInterface>
                      initialValues={{}}
                      onSubmit={noop}
                      formName="importYAMLForm"
                      validationSchema={Yup.object().shape({
                        branch: Yup.string().trim().required(getString('common.git.validation.baseBranchRequired')),
                        yamlPath: Yup.string()
                          .trim()
                          .required(getString('gitsync.gitSyncForm.yamlPathRequired'))
                          .test('is-valid-yaml-file', getString('ci.getStartedWithCI.validYAMLFile'), value => {
                            return (value as string)?.endsWith('.yaml')
                          })
                      })}
                    >
                      {formikProps => {
                        formikRef.current = formikProps
                        setForwardRef({
                          values: formikProps.values,
                          configuredOption: selectedConfigOption
                        })
                        return (
                          <FormikForm>
                            <Layout.Vertical
                              spacing="xsmall"
                              padding={formikProps.errors.yamlPath ? { bottom: 'large' } : {}}
                            >
                              <Container>
                                <Text font={{ variation: FontVariation.FORM_LABEL }} padding={{ bottom: 'xsmall' }}>
                                  {getString('gitsync.selectBranchTitle')}
                                </Text>
                                <RepoBranchSelectV2
                                  name="branch"
                                  noLabel={true}
                                  connectorIdentifierRef={configuredGitConnectorIdentifier}
                                  repoName={repoName}
                                  onChange={(selected: SelectOption) => {
                                    if (formikProps.values.branch !== selected.value) {
                                      formikProps.setFieldValue?.('branch', selected.value)
                                    }
                                  }}
                                  branchSelectorClassName={css.branchSelector}
                                />
                              </Container>
                              <FormInput.Text
                                name="yamlPath"
                                label={
                                  <Text font={{ variation: FontVariation.FORM_LABEL }}>
                                    {getString('gitsync.gitSyncForm.yamlPathLabel')}
                                  </Text>
                                }
                                placeholder={getString('gitsync.gitSyncForm.enterYamlPath')}
                                className={css.yamlPathField}
                              />
                              {showError && !formikProps.values.yamlPath ? (
                                <Container padding={{ top: 'xsmall' }}>
                                  <FormError
                                    name={'yamlPath'}
                                    errorMessage={getString('connectors.cdng.runTimeMonitoredService.pleaseSpecify', {
                                      field: `a ${getString('gitsync.gitSyncForm.yamlPathLabel').toLowerCase()}`
                                    })}
                                  />
                                </Container>
                              ) : null}
                            </Layout.Vertical>
                          </FormikForm>
                        )
                      }}
                    </Formik>
                  </Container>
                </Layout.Vertical>
              ) : null}
            </Layout.Vertical>
          </Layout.Horizontal>
        </Card>
      )
    },
    [selectedConfigOption, showError]
  )

  return (
    <Layout.Vertical width="40%" spacing="small">
      <Container>
        <Layout.Vertical spacing="medium" width="100%">
          <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'xsmall' }}>
            {getString('ci.getStartedWithCI.createPipeline')}
          </Text>
          {renderCard(starterMinimumPipeline)}
          {/* Enable this once limitations related to import yaml api are resolved. */}
          {enableForTesting && configuredGitConnector?.type !== Connectors.GITLAB
            ? renderCard({
                name: getString('ci.getStartedWithCI.chooseExistingYAML'),
                description: getString('ci.getStartedWithCI.chooseExistingYAMLHelptext'),
                icon: 'create-via-pipeline-template',
                id: 'choose-existing-yaml'
              })
            : null}
          {configuredGitConnector?.type !== Connectors.GITLAB ? (
            <Collapse
              isOpen={false}
              heading={
                <Container padding={{ top: 'small' }}>
                  <Text font={{ variation: FontVariation.SMALL }}>{getString('common.seeAdvancedOptions')}</Text>
                </Container>
              }
              iconProps={{ name: 'chevron-right', size: 20, padding: { top: 'small', right: 'xsmall' } }}
              collapseClassName={css.advancedOptions}
            >
              <Text font={{ variation: FontVariation.SMALL }}>{getString('common.seeAdvancedOptions')}</Text>
            </Collapse>
          ) : null}
        </Layout.Vertical>
      </Container>
    </Layout.Vertical>
  )
}

export const ConfigurePipeline = React.forwardRef(ConfigurePipelineRef)
