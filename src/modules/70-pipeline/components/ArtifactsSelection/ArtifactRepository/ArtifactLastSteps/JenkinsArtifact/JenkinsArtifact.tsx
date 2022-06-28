/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useRef } from 'react'
import {
  Formik,
  Layout,
  Button,
  StepProps,
  Text,
  ButtonVariation,
  MultiTypeInputType,
  SelectOption,
  getMultiTypeFromValue,
  FormInput
} from '@wings-software/uicore'
import { Form } from 'formik'
import * as Yup from 'yup'
import { FontVariation } from '@harness/design-system'
import { cloneDeep, isEqual } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { GitQueryParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import { ConnectorConfigDTO, JobDetails, useGetJobDetailsForJenkins } from 'services/cd-ng'
import { getArtifactFormData } from '@pipeline/components/ArtifactsSelection/ArtifactUtils'
import type {
  ArtifactType,
  JenkinsArtifactProps,
  JenkinsArtifactType
} from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { getGenuineValue } from '@pipeline/components/PipelineSteps/Steps/JiraApproval/helper'
import type { SubmenuSelectOption } from '@pipeline/components/PipelineSteps/Steps/JenkinsStep/types'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ArtifactIdentifierValidation, ModalViewFor } from '../../../ArtifactHelper'
import SideCarArtifactIdentifier from '../SideCarArtifactIdentifier'
import css from '../../ArtifactConnector.module.scss'

export function JenkinsArtifact({
  context,
  handleSubmit,
  expressions,
  allowableTypes,
  prevStepData,
  initialValues,
  previousStep,
  artifactIdentifiers,
  isReadonly = false,
  selectedArtifact
}: StepProps<ConnectorConfigDTO> & JenkinsArtifactProps): React.ReactElement {
  console.log('props', {
    context,
    handleSubmit,
    expressions,
    allowableTypes,
    prevStepData,
    initialValues,
    previousStep,
    artifactIdentifiers,
    isReadonly,
    selectedArtifact
  })
  const { getString } = useStrings()
  const lastOpenedJob = useRef<any>(null)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const [jobDetails, setJobDetails] = useState<SubmenuSelectOption[]>([])
  const commonParams = {
    accountIdentifier: accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier,
    branch
  }
  const schemaObject = {
    imagePath: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.imagePath')),
    tagType: Yup.string().required(),
    tagRegex: Yup.string().when('tagType', {
      is: 'regex',
      then: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.tagRegex'))
    }),
    tag: Yup.mixed().when('tagType', {
      is: 'value',
      then: Yup.mixed().required(getString('pipeline.artifactsSelection.validation.tag'))
    })
  }

  const primarySchema = Yup.object().shape(schemaObject)
  const sidecarSchema = Yup.object().shape({
    ...schemaObject,
    ...ArtifactIdentifierValidation(
      artifactIdentifiers,
      initialValues?.identifier,
      getString('pipeline.uniqueIdentifier')
    )
  })

  const { refetch: refetchJobs, data: jobsResponse } = useGetJobDetailsForJenkins({
    lazy: true,
    queryParams: {
      ...commonParams,
      connectorRef: ''
    }
  })

  const getJobItems = (jobs: JobDetails[]): SubmenuSelectOption[] => {
    return jobs?.map(job => {
      return {
        label: job.jobName || '',
        value: job.url || '',
        submenuItems: [],
        hasSubItems: job.folder
      }
    })
  }

  useEffect(() => {
    // if (typeof initialValues?.jobName === 'string' && jobsResponse?.data?.jobDetails?.length) {
    //   const targetJob = jobsResponse?.data?.jobDetails?.find(job => job.url === initialValues?.jobName)
    //   if (targetJob) {
    //     const jobObj = {
    //       label: targetJob?.jobName || '',
    //       value: targetJob?.url || '',
    //       submenuItems: [],
    //       hasSubItems: targetJob?.folder
    //     }
    //     formik.setValues({
    //       ...formik.values,
    //       spec: {
    //         ...formik.values.spec,
    //         jobName: jobObj as any
    //       }
    //     })
    //   }
    // }
    if (lastOpenedJob.current) {
      setJobDetails((prevState: SubmenuSelectOption[]) => {
        const clonedJobDetails = cloneDeep(prevState)
        const parentJob = clonedJobDetails.find(obj => obj.value === lastOpenedJob.current)
        if (parentJob) {
          parentJob.submenuItems = [...getJobItems(jobsResponse?.data?.jobDetails || [])]
        }
        return clonedJobDetails
      })
    } else {
      const jobs = jobsResponse?.data?.jobDetails?.map(job => {
        return {
          label: job.jobName || '',
          value: job.url || '',
          submenuItems: [],
          hasSubItems: job.folder
        }
      })
      if (!isEqual(jobs, jobDetails)) {
        setJobDetails(jobs || [])
      }
    }
  }, [jobsResponse])

  const connectorRefValue = getGenuineValue(prevStepData?.connectorId?.label)

  useEffect(() => {
    refetchJobs({
      queryParams: {
        ...commonParams,
        connectorRef: connectorRefValue?.toString()
      }
    })
  }, [prevStepData])

  const getInitialValues = (): JenkinsArtifactType => {
    return getArtifactFormData(
      initialValues,
      selectedArtifact as ArtifactType,
      context === ModalViewFor.SIDECAR
    ) as JenkinsArtifactType
  }
  //   const submitFormData = (formData: ImagePathTypes & { connectorId?: string }): void => {
  //     const artifactObj = getFinalArtifactObj(formData, context === ModalViewFor.SIDECAR)
  //     handleSubmit(artifactObj)
  //   }

  return (
    <Layout.Vertical spacing="medium" className={css.firstep}>
      <Text font={{ variation: FontVariation.H3 }} margin={{ bottom: 'medium' }}>
        {getString('pipeline.artifactsSelection.artifactDetails')}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="imagePath"
        validationSchema={context === ModalViewFor.SIDECAR ? sidecarSchema : primarySchema}
        onSubmit={formData => {
          //   submitFormData({
          //     ...prevStepData,
          //     ...formData,
          //     tag: defaultTo(formData?.tag?.value, formData?.tag),
          //     connectorId: getConnectorIdValue(prevStepData)
          //   })
        }}
      >
        {formik => {
          console.log('formik', formik)
          return (
            <Form>
              <div className={css.connectorForm}>
                {context === ModalViewFor.SIDECAR && <SideCarArtifactIdentifier />}
                {/* <ArtifactImagePathTagView
                selectedArtifact={selectedArtifact as ArtifactType}
                formik={formik}
                expressions={expressions}
                allowableTypes={allowableTypes}
                isReadonly={isReadonly}
                connectorIdValue={getConnectorIdValue(prevStepData)}
                fetchTags={fetchTags}
                buildDetailsLoading={dockerBuildDetailsLoading}
                tagError={dockerTagError}
                tagList={tagList}
                setTagList={setTagList}
                tagDisabled={isTagDisabled(formik?.values)}
              /> */}
              </div>
              <FormInput.SelectWithSubmenuTypeInput
                label={'Job Name'}
                name={'jobName'}
                placeholder={formik.values.spec.jobName || 'Select a job'}
                selectItems={jobDetails}
                selectWithSubmenuTypeInputProps={{
                  selectWithSubmenuProps: {
                    items: jobDetails,
                    interactionKind: PopoverInteractionKind.CLICK,
                    allowCreatingNewItems: true,
                    onChange: (primaryValue, secondaryValue, type) => {
                      const newJobName = secondaryValue ? secondaryValue : primaryValue
                      if (!primaryValue) {
                        return
                      }
                      formik.setValues({
                        ...formik.values,
                        spec: {
                          ...formik.values.spec,
                          jobName: type === MultiTypeInputType.RUNTIME ? primaryValue : (newJobName as any)
                        }
                      })
                      if (type !== MultiTypeInputType.FIXED) {
                        formik.setValues({
                          ...formik.values,
                          jobName: type === MultiTypeInputType.RUNTIME ? primaryValue : (newJobName as any)
                        })
                      }

                      // resetForm(formik, 'jobName', '')
                    },
                    onOpening: (item: SelectOption) => {
                      lastOpenedJob.current = item.value
                      // TODO: To scroll the jobDetails component to its original height
                      // const indexOfParent = jobDetails.findIndex(obj => obj.value === item.value)
                      // const parentNode = document.getElementsByClassName('Select--menuItem')?.[indexOfParent]
                      // if (parentNode) {
                      //   parentJobY.current = parentNode.getBoundingClientRect()?.y
                      // }
                      refetchJobs({
                        queryParams: {
                          ...commonParams,
                          connectorRef: connectorRefValue?.toString(),
                          parentJobName: item.label
                        }
                      })
                    }
                  }
                }}
              />
              {getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  style={{ marginTop: 14 }}
                  value={formik.values.spec.connectorRef as string}
                  type="String"
                  variableName="jobName"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={value => formik.setFieldValue('jobName', value)}
                  isReadonly={isReadonly}
                />
              )}
              <Layout.Horizontal spacing="medium">
                <Button
                  variation={ButtonVariation.SECONDARY}
                  text={getString('back')}
                  icon="chevron-left"
                  onClick={() => previousStep?.(prevStepData)}
                />
                <Button
                  variation={ButtonVariation.PRIMARY}
                  type="submit"
                  text={getString('submit')}
                  rightIcon="chevron-right"
                />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}
