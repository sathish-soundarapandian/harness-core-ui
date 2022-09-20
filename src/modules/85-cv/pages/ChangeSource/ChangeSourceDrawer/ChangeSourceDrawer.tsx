/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo } from 'react'
import { Text, Formik, FormInput, Container, ThumbnailSelect } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { FormikProps } from 'formik'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import { FormConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/FormConnectorReferenceField'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import type { ConnectorReferenceFieldProps } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import {
  createCardOptions,
  createChangesourceList,
  validateChangeSource,
  getChangeSourceOptions,
  updateSpecByType,
  buildInitialData,
  preSelectChangeSourceConnectorOnCategoryChange
} from './ChangeSourceDrawer.utils'
import type { ChangeSoureDrawerInterface, UpdatedChangeSourceDTO } from './ChangeSourceDrawer.types'
import PageDutyChangeSource from './components/PagerDutyChangeSource/PagerDutyChangeSource'
import { ChangeSourceFieldNames, ChangeSourceTypes } from './ChangeSourceDrawer.constants'
import HarnessCDCurrentGenChangeSource from './components/HarnessCDCurrentGenChangeSource/HarnessCDCurrentGenChangeSource'
import KubernetesChangeSource from './components/KubernetesChangeSource/KubernetesChangeSource'
import style from './ChangeSourceDrawer.module.scss'

export function ChangeSourceDrawer({
  isEdit,
  rowdata,
  tableData,
  onSuccess,
  hideDrawer,
  monitoredServiceType
}: ChangeSoureDrawerInterface): JSX.Element {
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()

  const onSuccessWrapper = (data: UpdatedChangeSourceDTO): void => {
    // for PagerDuty
    if (data.type === ChangeSourceTypes.PagerDuty) {
      data.enabled = true
    }
    data['spec'] = updateSpecByType(data)
    const updatedChangeSources = createChangesourceList(tableData, data)
    onSuccess(updatedChangeSources)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const categoryOptions = useMemo(() => getChangeSourceOptions(getString, monitoredServiceType), [monitoredServiceType])

  const renderChangeSource = useCallback(
    (formik: FormikProps<any>): React.ReactNode => {
      const changeSourceType = formik.values?.type as string
      if (!changeSourceType || changeSourceType === ChangeSourceTypes.HarnessCDNextGen) {
        return null
      }
      let changeSource = null

      switch (changeSourceType) {
        case ChangeSourceTypes.PagerDuty:
          changeSource = <PageDutyChangeSource formik={formik} isEdit={isEdit} />
          break
        case ChangeSourceTypes.HarnessCD:
          changeSource = <HarnessCDCurrentGenChangeSource formik={formik} />
          break
        case ChangeSourceTypes.K8sCluster:
          changeSource = <KubernetesChangeSource formik={formik} isEdit={isEdit} />
          break
        default:
          changeSource = (
            <FormConnectorReferenceField
              width={400}
              formik={formik}
              type={changeSourceType as ConnectorReferenceFieldProps['type']}
              name={'spec.connectorRef'}
              disabled={isEdit}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              placeholder={getString('cv.healthSource.connectors.selectConnector', {
                sourceType: formik?.values?.type
              })}
              label={
                <Text color={Color.BLACK} font={'small'} margin={{ bottom: 'small' }}>
                  {getString('connectors.selectConnector')}
                </Text>
              }
            />
          )
      }

      return (
        <CardWithOuterTitle title={getString('cv.changeSource.connectChangeSource')}>{changeSource}</CardWithOuterTitle>
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountId, orgIdentifier, projectIdentifier]
  )

  return (
    <Formik
      formName={'changeSourceaForm'}
      initialValues={rowdata?.category ? rowdata : buildInitialData(categoryOptions)}
      onSubmit={onSuccessWrapper}
      validate={values => validateChangeSource(values, tableData, isEdit, getString)}
      enableReinitialize
    >
      {formik => {
        return (
          <>
            <CardWithOuterTitle title={getString('cv.changeSource.defineChangeSource')} className={style.outerCard}>
              <Text className={style.selectChangeSource}>{getString('cv.changeSource.selectChangeSource')}</Text>
              <Container
                margin={{ bottom: 'large' }}
                className={cx({
                  [style.removeEditButton]: createCardOptions(formik.values?.category, getString).length === 1
                })}
                width="300px"
              >
                <div className={style.alignHorizontal}>
                  <Text
                    color={Color.BLACK}
                    font={'small'}
                    margin={{ bottom: 'small' }}
                    tooltipProps={{ dataTooltipId: 'changeSourceProviderType' }}
                  >
                    {getString('connectors.docker.dockerProvideType')}
                  </Text>
                  <FormInput.Select
                    name={ChangeSourceFieldNames.CATEGORY}
                    disabled={isEdit}
                    items={categoryOptions}
                    onChange={categoryName =>
                      formik.setValues({
                        [ChangeSourceFieldNames.CATEGORY]: categoryName?.value || ('' as string),
                        [ChangeSourceFieldNames.TYPE]: preSelectChangeSourceConnectorOnCategoryChange(
                          categoryName?.value as string
                        ),
                        spec: {}
                      })
                    }
                  />
                </div>
                {formik.values?.category && (
                  <ThumbnailSelect
                    isReadonly={isEdit}
                    name={ChangeSourceFieldNames.TYPE}
                    items={createCardOptions(formik.values?.category, getString)}
                  />
                )}
              </Container>
              <hr className={style.divider} />
              <Container margin={{ bottom: 'large', top: 'large' }} color={Color.BLACK} width="400px">
                <FormInput.InputWithIdentifier
                  inputLabel={getString('cv.changeSource.sourceName')}
                  isIdentifierEditable={!isEdit}
                />
              </Container>
            </CardWithOuterTitle>
            {renderChangeSource(formik)}
            <DrawerFooter isSubmit onPrevious={hideDrawer} onNext={formik.submitForm} />
          </>
        )
      }}
    </Formik>
  )
}
