/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement, useRef } from 'react'
import {
  Accordion,
  Button,
  ButtonVariation,
  CardSelect,
  Container,
  Formik,
  FormikForm,
  HarnessDocTooltip,
  Icon,
  IconName,
  Layout,
  Text
} from '@harness/uicore'
import { Color, FontVariation, PopoverProps } from '@harness/design-system'
import cx from 'classnames'
import type { FormikContextType } from 'formik'
import { noop } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { RepoDataType } from '../CDOnboardingUtils'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'
import moduleCss from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export interface DelegateSelectorRefInstance {
  isDelegateInstalled?: boolean
}
export type DelegateSelectorForwardRef =
  | ((instance: DelegateSelectorRefInstance | null) => void)
  | React.MutableRefObject<DelegateSelectorRefInstance | null>
  | null
export interface DelegateTypeSelectorProps {
  disableNextBtn: () => void
  enableNextBtn: () => void
}

const enum REPO_TYPES {
  GIT = 'git',
  HELM = 'helm'
}

export interface RepoTypeItem {
  label: string
  icon: IconName
  value: string
  disabled?: boolean
  tooltip?: ReactElement | string
  tooltipProps?: PopoverProps
}

const ConfigureGitopsRef = (): JSX.Element => {
  const {
    state: { repository: repositoryData }
  } = useCDOnboardingContext()

  const { getString } = useStrings()
  const formikRef = useRef<FormikContextType<RepoDataType>>()

  const handleHaveRepoChange = (val: boolean) => {
    formikRef.current?.setFieldValue('hasRepo', val)
  }

  const repositoryTypes = [
    {
      label: getString('pipeline.manifestType.gitConnectorLabel'),
      icon: 'service-git' as IconName,
      value: REPO_TYPES.GIT
    },
    {
      label: getString('cd.getStartedWithCD.helm'),
      icon: 'service-helm' as IconName,
      value: REPO_TYPES.HELM
    }
  ]

  return (
    <Layout.Vertical width={'100%'} margin={{ left: 'small' }}>
      <Layout.Horizontal>
        <Layout.Vertical width={'55%'}>
          <Container>
            <Text
              font={{ variation: FontVariation.H3, weight: 'semi-bold' }}
              margin={{ bottom: 'small' }}
              color={Color.GREY_600}
              data-tooltip-id="cdOnboardingConfigureStep"
            >
              {getString('cd.getStartedWithCD.gitopsOnboardingConfigureStep')}
              <HarnessDocTooltip tooltipId="cdOnboardingConfigureStep" useStandAlone={true} />
            </Text>
            <div className={css.borderBottomClass} />
            <Accordion collapseProps={{ keepChildrenMounted: false }}>
              <Accordion.Panel
                details={
                  <Formik<RepoDataType>
                    initialValues={{
                      ...repositoryData
                    }}
                    formName="select-deployment-type-cd"
                    onSubmit={noop}
                  >
                    {formikProps => {
                      formikRef.current = formikProps
                      const selectedRepoType: RepoTypeItem | undefined = repositoryTypes?.find(
                        repoType => repoType.value === formikProps.values.repository?.type
                      )
                      const haveGitRepo: boolean | undefined = formikProps.values.hasRepo
                      return (
                        <FormikForm>
                          <Layout.Vertical>
                            <Container padding={{ bottom: 'xxlarge' }}>
                              <Container padding={{ top: 'xxlarge', bottom: 'xxlarge' }}>
                                <CardSelect
                                  data={repositoryTypes as RepoTypeItem[]}
                                  cornerSelected={true}
                                  className={moduleCss.icons}
                                  cardClassName={moduleCss.serviceDeploymentTypeCard}
                                  renderItem={(item: RepoTypeItem) => (
                                    <>
                                      <Layout.Vertical flex>
                                        <Icon
                                          name={item.icon}
                                          size={48}
                                          flex
                                          className={moduleCss.serviceDeploymentTypeIcon}
                                        />
                                        <Text font={{ variation: FontVariation.BODY2 }} className={moduleCss.text1}>
                                          {item.label}
                                        </Text>
                                      </Layout.Vertical>
                                    </>
                                  )}
                                  selected={selectedRepoType}
                                  onChange={(item: RepoTypeItem) => {
                                    formikProps.setFieldValue('repository.type', item.value)
                                  }}
                                />
                              </Container>
                            </Container>
                            <Text font="normal" className={css.marginBottomClass}>
                              {getString('cd.getStartedWithCD.haveGitRepo')}
                            </Text>
                            <Layout.Horizontal spacing="medium">
                              <Button
                                onClick={() => handleHaveRepoChange(true)}
                                className={cx(css.kubernetes, haveGitRepo ? css.active : undefined)}
                              >
                                {getString('yes')}
                              </Button>
                              <Button
                                onClick={() => {
                                  handleHaveRepoChange(false)
                                }}
                                className={cx(css.docker, !haveGitRepo ? css.active : undefined)}
                              >
                                {getString('cd.getStartedWithCD.doesntHaveGitRepo')}
                              </Button>
                            </Layout.Horizontal>
                          </Layout.Vertical>
                          <div className={css.marginTopClass} />

                          <Button
                            variation={ButtonVariation.PRIMARY}
                            type="submit"
                            text={getString('submit')}
                            rightIcon="chevron-right"
                          />
                        </FormikForm>
                      )
                    }}
                  </Formik>
                }
                id={'application-repo'}
                summary={
                  <Text
                    font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
                    margin={{ bottom: 'small' }}
                    color={Color.GREY_600}
                    data-tooltip-id="cdOnboardingInstallDelegate"
                  >
                    {getString('cd.getStartedWithCD.gitopsOnboardingSource')}
                    <HarnessDocTooltip tooltipId="gitopsOnboardingSource" useStandAlone={true} />
                  </Text>
                }
              />
            </Accordion>

            <div className={css.marginTopClass} />
          </Container>
        </Layout.Vertical>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export const ConfigureGitops = React.forwardRef(ConfigureGitopsRef)
