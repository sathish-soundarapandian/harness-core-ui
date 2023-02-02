/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Button, Text, Formik, IconName, Layout, StepProps, ThumbnailSelect, ButtonVariation } from '@harness/uicore'
import { Form } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO, ManifestConfigWrapper } from 'services/cd-ng'
import { useQueryParams } from '@common/hooks'
import type { EnvironmentQueryParams } from '@common/interfaces/RouteInterfaces'
import { allowedOverrideManfests, ManifestDataType, manifestTypeIcons, manifestTypeLabels } from '../Manifesthelper'
import type { ManifestStepInitData, ManifestTypes } from '../ManifestInterface'
import css from './ManifestWizardSteps.module.scss'
import style from '@pipeline/components/ArtifactsSelection/ArtifactRepository/ArtifactConnector.module.scss'

interface ManifestPropType {
  changeManifestType: (selected: ManifestTypes | null) => void
  manifestTypes: Array<ManifestTypes>
  selectedManifest: ManifestTypes | null
  stepName: string
  initialValues: ManifestStepInitData
  listOfDisabledManifestTypes?: ManifestTypes[]
  manifestOverridesList?: ManifestConfigWrapper[]
}

export function ManifestRepoTypes({
  selectedManifest,
  manifestTypes,
  changeManifestType,
  stepName,
  prevStepData,
  nextStep,
  initialValues,
  listOfDisabledManifestTypes,
  manifestOverridesList
}: StepProps<ConnectorConfigDTO> & ManifestPropType): React.ReactElement {
  const [selectedManifestType, setselectedManifestType] = React.useState(selectedManifest)

  const handleOptionSelection = (selected: ManifestTypes): void => {
    setselectedManifestType(selected)
    changeManifestType(selected)
  }

  const { getString } = useStrings()
  const { sectionId } = useQueryParams<EnvironmentQueryParams>()

  const filterManifest = (manifestType: any) => {
    return manifestOverridesList!.filter(manifest => manifest.manifest?.type === manifestType)
  }

  const checkDisabled = (manifestType: ManifestTypes) => {
    if (
      manifestType === ManifestDataType.HelmRepoOverride &&
      selectedManifestType !== ManifestDataType.HelmRepoOverride &&
      filterManifest(ManifestDataType.HelmRepoOverride).length >= allowedOverrideManfests.HelmRepoOverride // specific to Helm Repo Override Manifest - to be updated
    ) {
      return true
    }
    return defaultTo(listOfDisabledManifestTypes?.includes(manifestType), false)
  }
  const getTooltip = (manifestType: ManifestTypes) => {
    if (manifestType === ManifestDataType.HelmRepoOverride && checkDisabled(manifestType)) {
      if (sectionId === 'SERVICE_OVERRIDES') {
        return getString('pipeline.manifestType.helmRepoOverride.allowedLimitForService')
      } else {
        // sectionId = CONFIGURATION
        return getString('pipeline.manifestType.helmRepoOverride.allowedLimitForEnvironment')
      }
    }
    //return undefined
    return
  }
  const supportedManifestTypes = useMemo(
    () =>
      manifestTypes?.map(manifest => ({
        label: getString(manifestTypeLabels[manifest]),
        icon: manifestTypeIcons[manifest] as IconName,
        value: manifest,
        disabled: checkDisabled(manifest),
        tooltip: getTooltip(manifest) // specific to Helm Repo Override Manifest
      })),
    [getString, listOfDisabledManifestTypes, manifestTypes]
  )

  return (
    <Layout.Vertical height={'inherit'} spacing="medium" className={css.optionsViewContainer}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {stepName}
      </Text>
      <Formik
        initialValues={{ manifestType: selectedManifestType }}
        formName="manifestType"
        validationSchema={Yup.object().shape({
          manifestType: Yup.string().required(getString('pipeline.manifestType.manifestTyperequired'))
        })}
        onSubmit={() => {
          changeManifestType(selectedManifestType)
          if (initialValues.selectedManifest !== selectedManifestType) {
            nextStep?.({ ...prevStepData, store: '' })
          } else {
            nextStep?.({ ...prevStepData })
          }
        }}
        enableReinitialize={true}
      >
        {() => (
          <Form>
            <Layout.Vertical
              flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
              className={css.manifestForm}
            >
              <Layout.Horizontal spacing="large">
                <ThumbnailSelect
                  className={style.thumbnailSelect}
                  name={'manifestType'}
                  items={supportedManifestTypes}
                  onChange={handleOptionSelection}
                  layoutProps={{ className: style.wrapping }}
                />
              </Layout.Horizontal>
              <Layout.Horizontal>
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  disabled={selectedManifestType === null}
                  text={getString('continue')}
                  rightIcon="chevron-right"
                  className={css.saveBtn}
                />
              </Layout.Horizontal>
            </Layout.Vertical>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}
