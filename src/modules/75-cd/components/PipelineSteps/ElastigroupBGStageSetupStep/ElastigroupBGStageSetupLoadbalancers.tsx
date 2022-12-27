/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import type { FormikProps } from 'formik'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Color, FontVariation } from '@harness/design-system'
import {
  Button,
  Card,
  FormInput,
  getMultiTypeFromValue,
  Icon,
  Layout,
  MultiTypeInputType,
  SelectOption,
  Text
} from '@harness/uicore'
import { Collapse } from '@blueprintjs/core'
import { defaultTo, get, isEmpty } from 'lodash-es'
import produce from 'immer'
import { useStrings } from 'framework/strings'
import { EXPRESSION_STRING } from '@pipeline/utils/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { listenerRulesPromise, ResponseListString, useElasticLoadBalancers, useListeners } from 'services/cd-ng'
import { shouldFetchFieldData } from '../PipelineStepsUtil'

import type { ElastigroupBGStageSetupData } from './ElastigroupBGStageSetupStepTypes'

import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'
import css from './ElastigroupBGStageSetupStep.module.scss'

export const extractPort = (listenerPort: string): string => {
  const splitString = listenerPort.split(': ')
  if (splitString.length !== 2) {
    return listenerPort
  }
  return splitString[1]
}

export default function ElastigroupBGStageSetupLoadBalancer(props: {
  formik: FormikProps<ElastigroupBGStageSetupData>
  readonly?: boolean
  remove: <T>(index: number) => T | undefined
  index: number
}): React.ReactElement {
  const { formik, readonly, index, remove } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const [showInputs, setShow] = useState(!isEmpty(formik.errors.spec?.loadBalancers?.[index]))

  //this is for opening the card when the error is there -- for better user exp.
  useEffect(() => {
    if (!isEmpty(formik.errors.spec?.loadBalancers?.[index])) {
      setShow(true)
    }
  }, [formik.errors.spec?.loadBalancers, index])

  function toggle(): void {
    setShow(show => !show)
  }

  const [listenerList, setListenerList] = useState<SelectOption[]>([])
  const [prodListenerRules, setProdListenerRules] = useState<SelectOption[]>([])
  const [prodListenerRulesLoading, setProdListenerRulesLoading] = useState<boolean>(false)
  const [stageListenerRules, setStageListenerRules] = useState<SelectOption[]>([])
  const [stageListenerRulesLoading, setStageListenerRulesLoading] = useState<boolean>(false)

  const awsConnectorRef = defaultTo(formik.values.spec.connectedCloudProvider.spec.connectorRef, '')
  const region = defaultTo(formik.values.spec.connectedCloudProvider.spec.region, '')
  const shouldFetchLoadBalancers = shouldFetchFieldData([awsConnectorRef, region])

  const reverseMapListener = useRef<Map<string, string>>(new Map<string, string>())

  const shouldFetchListeners = shouldFetchFieldData([
    awsConnectorRef,
    region,
    defaultTo(formik.values.spec.loadBalancers[index].spec.loadBalancer, '')
  ])

  const {
    data: loadBalancers,
    loading: loadingLoadBalancers,
    refetch: refetchLoadBalancers
  } = useElasticLoadBalancers({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      awsConnectorRef,
      region
    },
    lazy: !shouldFetchLoadBalancers
  })
  const loadBalancerOptions: SelectOption[] = React.useMemo(() => {
    return defaultTo(loadBalancers?.data, []).map(loadBalancer => ({
      value: loadBalancer,
      label: loadBalancer
    }))
  }, [loadBalancers?.data])

  const {
    data: listeners,
    loading: loadingListeners,
    refetch: refetchListeners
  } = useListeners({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      awsConnectorRef,
      region,
      elasticLoadBalancer: defaultTo(formik.values.spec.loadBalancers[index].spec.loadBalancer, '')
    },
    lazy: !shouldFetchListeners
  })

  React.useEffect(() => {
    const listenerData = defaultTo(listeners?.data, {})
    const listenerOptions = Object.keys(listenerData).map(listenerKey => ({
      value: listenerData[listenerKey],
      label: extractPort(listenerKey)
    }))

    reverseMapListener.current.clear()
    Object.keys(listenerData).map(listenerKey => {
      reverseMapListener.current.set(extractPort(listenerKey), listenerData[listenerKey])
    })

    setListenerList(listenerOptions)
  }, [listeners?.data])

  React.useEffect(() => {
    if (
      shouldFetchFieldData([
        defaultTo(formik.values.spec.loadBalancers[index].spec.loadBalancer, ''),
        defaultTo(formik.values.spec.loadBalancers[index].spec.prodListenerPort, '')
      ])
    ) {
      const listenerPort = defaultTo(formik.values.spec.loadBalancers[index].spec.prodListenerPort, '')
      fetchProdListenerRules(
        defaultTo(formik.values.spec.loadBalancers[index].spec.loadBalancer, ''),
        defaultTo(reverseMapListener.current.get(listenerPort), ''),
        undefined,
        true
      )
    }
    if (
      shouldFetchFieldData([
        defaultTo(formik.values.spec.loadBalancers[index].spec.loadBalancer, ''),
        defaultTo(formik.values.spec.loadBalancers[index].spec.stageListenerPort, '')
      ])
    ) {
      const listenerPort = defaultTo(formik.values.spec.loadBalancers[index].spec.stageListenerPort, '')
      fetchStageListenerRules(
        defaultTo(formik.values.spec.loadBalancers[index].spec.loadBalancer, ''),
        defaultTo(reverseMapListener.current.get(listenerPort), ''),
        undefined,
        true
      )
    }
  }, [
    formik.values.spec.loadBalancers[index].spec.loadBalancer,
    formik.values.spec.loadBalancers[index].spec.prodListenerPort,
    formik.values.spec.loadBalancers[index].spec.stageListenerPort
  ])

  const fetchLoadBalancers = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
      return
    }
    if (!loadingLoadBalancers) {
      if (awsConnectorRef && region) {
        refetchLoadBalancers()
      }
    }
  }

  const fetchListeners = (e: React.FocusEvent<HTMLInputElement>, selectedLoadBalancer: string) => {
    if (e?.target?.type !== 'text' || (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)) {
      return
    }

    if (!loadingListeners) {
      if (shouldFetchFieldData([awsConnectorRef, region, selectedLoadBalancer])) {
        refetchListeners({
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            awsConnectorRef,
            region,
            elasticLoadBalancer: selectedLoadBalancer
          }
        })
      }
    }
  }

  const fetchProdListenerRules = (
    selectedLoadBalancer: string,
    selectedProdListener: string,
    e?: React.FocusEvent<HTMLInputElement>,
    fromEffect = false
  ) => {
    if (
      (!fromEffect && e?.target?.type !== 'text') ||
      (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
    ) {
      return
    }

    if (shouldFetchFieldData([awsConnectorRef, region, selectedLoadBalancer, selectedProdListener])) {
      setProdListenerRulesLoading(true)
      listenerRulesPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          awsConnectorRef,
          region,
          elasticLoadBalancer: selectedLoadBalancer,
          listenerArn: selectedProdListener
        }
      })
        .then((response: ResponseListString) => {
          setProdListenerRulesLoading(false)
          const listenerRulesData = defaultTo(response?.data, [])
          const listenerRulesOptions = listenerRulesData.map(listenerRule => ({
            value: listenerRule,
            label: listenerRule
          }))
          setProdListenerRules(listenerRulesOptions)
        })
        .catch(() => {
          setProdListenerRulesLoading(false)
          setProdListenerRules([])
        })
    }
  }

  const fetchStageListenerRules = (
    selectedLoadBalancer: string,
    selectedStageListener: string,
    e?: React.FocusEvent<HTMLInputElement>,
    fromEffect = false
  ) => {
    if (
      (!fromEffect && e?.target?.type !== 'text') ||
      (e?.target?.type === 'text' && e?.target?.placeholder === EXPRESSION_STRING)
    ) {
      return
    }

    if (shouldFetchFieldData([awsConnectorRef, region, selectedLoadBalancer, selectedStageListener])) {
      setStageListenerRulesLoading(true)
      listenerRulesPromise({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          awsConnectorRef,
          region,
          elasticLoadBalancer: selectedLoadBalancer,
          listenerArn: selectedStageListener
        }
      })
        .then((response: ResponseListString) => {
          setStageListenerRulesLoading(false)
          const listenerRulesData = defaultTo(response?.data, [])
          const listenerRulesOptions = listenerRulesData.map(listenerRule => ({
            value: listenerRule,
            label: listenerRule
          }))
          setStageListenerRules(listenerRulesOptions)
        })
        .catch(() => {
          setStageListenerRulesLoading(false)
          setStageListenerRules([])
        })
    }
  }

  const onLoadBalancerChange = (selectedLoadBalancer: string, idx: number) => {
    const updatedValues = produce(formik.values, draft => {
      draft.spec.loadBalancers[idx].spec.loadBalancer = selectedLoadBalancer
      if (
        getMultiTypeFromValue(formik.values.spec.loadBalancers[idx].spec.prodListenerPort) === MultiTypeInputType.FIXED
      ) {
        draft.spec.loadBalancers[idx].spec.prodListenerPort = ''
      }
      if (
        getMultiTypeFromValue(formik.values.spec.loadBalancers[idx].spec.prodListenerRuleArn) ===
        MultiTypeInputType.FIXED
      ) {
        draft.spec.loadBalancers[idx].spec.prodListenerRuleArn = ''
      }
      if (
        getMultiTypeFromValue(formik.values.spec.loadBalancers[idx].spec.stageListenerPort) === MultiTypeInputType.FIXED
      ) {
        draft.spec.loadBalancers[idx].spec.stageListenerPort = ''
      }
      if (
        getMultiTypeFromValue(formik.values.spec.loadBalancers[idx].spec.stageListenerRuleArn) ===
        MultiTypeInputType.FIXED
      ) {
        draft.spec.loadBalancers[idx].spec.stageListenerRuleArn = ''
      }
    })
    formik.setValues(updatedValues)
  }

  const loadBalancerSummaryView = (type: string, idx: number, portPath: string, rulePath: string): JSX.Element => {
    const port = get(formik.values, `spec.loadBalancers[${idx}].spec.${portPath}`)
    const rule = get(formik.values, `spec.loadBalancers[${idx}].spec.${rulePath}`)
    return (
      <Layout.Horizontal className={css.summaryStyle}>
        <Text className={css.loadBalancerTitles} color={Color.GREY_900}>
          {type}
        </Text>
        <Text>{getString('cd.ElastigroupBGStageSetup.listenerColon')}</Text>
        <Text lineClamp={1} className={css.loadBalancerTitles} color={Color.GREY_900}>
          {port ? port : ' - '}
        </Text>
        <Text>{getString('cd.ElastigroupBGStageSetup.ruleColon')}</Text>
        <Text lineClamp={1} className={css.loadBalancerTitles} color={Color.GREY_900}>
          {rule ? rule : ' - '}
        </Text>
      </Layout.Horizontal>
    )
  }

  const onLoadingText = (loadingBool: boolean): string => {
    return loadingBool ? getString('loading') : getString('select')
  }

  return (
    <Card key={index} className={css.cardStyle}>
      <Layout.Horizontal
        className={css.collapseHeader}
        onClick={() => {
          toggle()
        }}
      >
        <Layout.Horizontal flex={{ alignItems: 'center' }}>
          <Icon name={showInputs ? 'chevron-up' : 'chevron-down'} style={{ marginRight: 6 }} color={Color.PRIMARY_7} />
          <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREY_900} style={{ marginRight: 12 }}>
            {getString('cd.steps.ecsBGCreateServiceStep.labels.elasticLoadBalancer')}
          </Text>
          {!showInputs ? (
            <Text lineClamp={1} width="230px">
              {formik.values.spec.loadBalancers[index].spec.loadBalancer}
            </Text>
          ) : null}
        </Layout.Horizontal>
        <Layout.Horizontal>
          {!showInputs ? <Button minimal icon="edit" disabled={readonly} /> : null}
          {formik.values.spec.loadBalancers.length > 1 ? (
            <Button
              minimal
              icon="main-trash"
              onClick={() => {
                setListenerList([])
                setProdListenerRules([])
                setStageListenerRules([])
                remove(index)
              }}
              disabled={readonly}
            />
          ) : null}
        </Layout.Horizontal>
      </Layout.Horizontal>
      <div className={css.divider} />
      <Collapse keepChildrenMounted={true} isOpen={true} className={css.collapseCardStyle}>
        {showInputs ? (
          <>
            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTypeInput
                name={`spec.loadBalancers[${index}].spec.loadBalancer`}
                selectItems={loadBalancerOptions}
                useValue
                multiTypeInputProps={{
                  expressions,
                  selectProps: {
                    items: loadBalancerOptions,
                    popoverClassName: css.dropdownMenu,
                    allowCreatingNewItems: true,
                    loadingItems: loadingLoadBalancers
                  },
                  width: 400,
                  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                  onChange: selectedValue => {
                    const selectedValueString =
                      typeof selectedValue === 'string'
                        ? selectedValue
                        : ((selectedValue as SelectOption)?.value as string)
                    onLoadBalancerChange(selectedValueString, index)
                  },
                  onFocus: fetchLoadBalancers
                }}
                label={getString('cd.ElastigroupBGStageSetup.awsLoadBalancer')}
                placeholder={onLoadingText(loadingLoadBalancers)}
                disabled={readonly}
              />
            </div>

            <div className={css.loadBalancerTitles} color={Color.GREY_900}>
              {getString('cd.ElastigroupBGStageSetup.configureProductionListener')}
            </div>

            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTypeInput
                name={`spec.loadBalancers[${index}].spec.prodListenerPort`}
                selectItems={listenerList}
                useValue
                multiTypeInputProps={{
                  expressions,
                  selectProps: {
                    items: listenerList,
                    popoverClassName: css.dropdownMenu,
                    allowCreatingNewItems: true,
                    loadingItems: loadingListeners
                  },
                  width: 400,
                  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                  onChange: selectedValue => {
                    const selectedValueString =
                      typeof selectedValue === 'string'
                        ? selectedValue
                        : ((selectedValue as SelectOption).label as string)
                    const updatedValues = produce(formik.values, draft => {
                      draft.spec.loadBalancers[index].spec.prodListenerPort = selectedValueString
                      if (
                        getMultiTypeFromValue(draft.spec.loadBalancers[index].spec.prodListenerRuleArn) ===
                        MultiTypeInputType.FIXED
                      ) {
                        draft.spec.loadBalancers[index].spec.prodListenerRuleArn = ''
                      }
                    })
                    formik.setValues(updatedValues)
                  },
                  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                    fetchListeners(e, defaultTo(formik.values.spec.loadBalancers[index].spec.loadBalancer, ''))
                  }
                }}
                label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListener')}
                placeholder={onLoadingText(loadingListeners)}
                disabled={readonly}
              />
            </div>

            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTypeInput
                name={`spec.loadBalancers[${index}].spec.prodListenerRuleArn`}
                selectItems={prodListenerRules}
                useValue
                multiTypeInputProps={{
                  expressions,
                  selectProps: {
                    items: prodListenerRules,
                    popoverClassName: css.dropdownMenu,
                    allowCreatingNewItems: true,
                    loadingItems: prodListenerRulesLoading
                  },
                  width: 400,
                  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                    const listenerPort = defaultTo(formik.values.spec.loadBalancers[index].spec.prodListenerPort, '')
                    fetchProdListenerRules(
                      defaultTo(formik.values.spec.loadBalancers[index].spec.loadBalancer, ''),
                      defaultTo(reverseMapListener.current.get(listenerPort), ''),
                      e
                    )
                  }
                }}
                label={getString('cd.steps.ecsBGCreateServiceStep.labels.prodListenerRuleARN')}
                placeholder={onLoadingText(prodListenerRulesLoading)}
                disabled={readonly}
              />
            </div>

            <div className={css.loadBalancerTitles} color={Color.GREY_900}>
              {getString('cd.ElastigroupBGStageSetup.configureStageListener')}
            </div>

            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTypeInput
                name={`spec.loadBalancers[${index}].spec.stageListenerPort`}
                selectItems={listenerList}
                useValue
                multiTypeInputProps={{
                  expressions,
                  selectProps: {
                    items: listenerList,
                    popoverClassName: css.dropdownMenu,
                    allowCreatingNewItems: true,
                    loadingItems: loadingListeners
                  },
                  width: 400,
                  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                  onChange: selectedValue => {
                    const selectedValueString =
                      typeof selectedValue === 'string'
                        ? selectedValue
                        : ((selectedValue as SelectOption).label as string)
                    const updatedValues = produce(formik.values, draft => {
                      draft.spec.loadBalancers[index].spec.stageListenerPort = selectedValueString
                      if (
                        getMultiTypeFromValue(draft.spec.loadBalancers[index].spec.stageListenerRuleArn) ===
                        MultiTypeInputType.FIXED
                      ) {
                        draft.spec.loadBalancers[index].spec.stageListenerRuleArn = ''
                      }
                    })
                    formik.setValues(updatedValues)
                  },
                  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                    fetchListeners(e, defaultTo(formik.values.spec.loadBalancers[index].spec.loadBalancer, ''))
                  }
                }}
                label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListener')}
                placeholder={onLoadingText(loadingListeners)}
                disabled={readonly}
              />
            </div>

            <div className={cx(stepCss.formGroup, stepCss.lg)}>
              <FormInput.MultiTypeInput
                name={`spec.loadBalancers[${index}].spec.stageListenerRuleArn`}
                selectItems={stageListenerRules}
                useValue
                multiTypeInputProps={{
                  expressions,
                  selectProps: {
                    items: stageListenerRules,
                    popoverClassName: css.dropdownMenu,
                    allowCreatingNewItems: true,
                    loadingItems: stageListenerRulesLoading
                  },
                  width: 400,
                  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
                    const listenerPort = defaultTo(formik.values.spec.loadBalancers[index].spec.stageListenerPort, '')
                    fetchStageListenerRules(
                      defaultTo(formik.values.spec.loadBalancers[index].spec.loadBalancer, ''),
                      defaultTo(reverseMapListener.current.get(listenerPort), ''),
                      e
                    )
                  }
                }}
                label={getString('cd.steps.ecsBGCreateServiceStep.labels.stageListenerRuleARN')}
                placeholder={onLoadingText(stageListenerRulesLoading)}
                disabled={readonly}
              />
            </div>
          </>
        ) : (
          <Layout.Vertical>
            {loadBalancerSummaryView(getString('production'), index, 'prodListenerPort', 'prodListenerRuleArn')}
            {loadBalancerSummaryView(getString('common.stage'), index, 'stageListenerPort', 'stageListenerRuleArn')}
          </Layout.Vertical>
        )}
      </Collapse>
    </Card>
  )
}
