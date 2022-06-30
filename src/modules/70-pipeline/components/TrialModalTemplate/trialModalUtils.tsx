/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'

import { CreateOrSelectAProjectTemplate } from '@projects-orgs/components/CreateOrSelectAProjectTemplate/CreateOrSelectAProjectTemplate'
import { CreatePipelineForm } from '@pipeline/components/CreatePipelineForm/CreatePipelineForm'
import { SelectOrCreatePipelineForm } from '@pipeline/components/SelectOrCreatePipelineForm/SelectOrCreatePipelineForm'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

import type { Project } from 'services/cd-ng'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import type { ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import type { Module } from '@common/interfaces/RouteInterfaces'
import type { StringsMap } from 'stringTypes'

export enum TrialType {
  CREATE_OR_SELECT_PIPELINE,
  CREATE_OR_SELECT_PROJECT,
  SET_UP_PIPELINE
}

export interface TrialModalProps {
  selectedProject?: Project
  openProjectModal: (project?: Project) => void
  pushToPipelineStudio: (pipelinId: string, projectData: Project, search?: string) => void
}
export type onCreatePipeline = (values: PipelineInfoConfig) => void
export type onSelectPipeline = (value: string) => void
export type CreateOrSelectProjectProps = {
  onCreateProject: () => void
}
export type PipelineProps = {
  onSuccess: onCreatePipeline | onSelectPipeline
}
export interface UseTrialModalProps {
  actionProps: PipelineProps | CreateOrSelectProjectProps
  trialType: TrialType
  onCloseModal?: () => void
}

export interface UseTrialModalReturns {
  openTrialModal: () => void
  closeTrialModal: () => void
}

export interface FormPropsReturn {
  child: React.ReactElement
  description: string
}

export interface OpenModalProps {
  modal?: ModuleLicenseType
  gettingProjects: boolean
  gettingPipelines: boolean
  selectedProject?: Project
  pipelinesExist: boolean
  projectsExist: boolean
  openProjectModal: (project?: Project) => void
  openTrialModal: () => void
  pushToPipelineStudio: (pipelinId: string, projectData: Project, search?: string) => void
}

export function openModal(props: OpenModalProps): void {
  const {
    modal,
    gettingProjects,
    gettingPipelines,
    selectedProject,
    pipelinesExist,
    projectsExist,
    openProjectModal,
    openTrialModal,
    pushToPipelineStudio
  } = props
  if (modal && !gettingProjects && !gettingPipelines) {
    // selectedProject exists and no pipelines, forward to create pipeline
    if (selectedProject && !pipelinesExist) {
      pushToPipelineStudio('-1', selectedProject, `?modal=${modal}`)
    } else if (!selectedProject && !projectsExist) {
      // selectedProject doesnot exist and projects donot exist, open project modal
      openProjectModal()
    } else {
      // otherwise, just open trial modal
      openTrialModal()
    }
  }
}

export const getTrialModalProps = (props: TrialModalProps): Omit<UseTrialModalProps, 'onCloseModal'> => {
  const { selectedProject, openProjectModal, pushToPipelineStudio } = props
  return selectedProject
    ? {
        actionProps: {
          onSuccess: (pipelineId: string) => pushToPipelineStudio(pipelineId, selectedProject)
        },
        trialType: TrialType.CREATE_OR_SELECT_PIPELINE
      }
    : {
        actionProps: {
          onCreateProject: openProjectModal
        },
        trialType: TrialType.CREATE_OR_SELECT_PROJECT
      }
}

interface FormByModulePropsReturn {
  description: string
  moduleDescription: string
}

function getFormPropsByModule(module: string): FormByModulePropsReturn {
  switch (module) {
    case 'cd': {
      return {
        description: 'cd.cdTrialHomePage.startTrial.description',
        moduleDescription: 'cd.continuous'
      }
    }
    case 'ci': {
      return {
        description: 'ci.ciTrialHomePage.startTrial.description',
        moduleDescription: 'ci.continuous'
      }
    }
    case 'cf': {
      return {
        description: 'cf.cfTrialHomePage.startTrial.description',
        moduleDescription: 'cf.continuous'
      }
    }
  }

  return { description: '', moduleDescription: '' }
}

export function useGetFormPropsByTrialType({
  trialType,
  actionProps,
  module,
  onCloseModal
}: UseTrialModalProps & { module: Module }): FormPropsReturn {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<{ accountId: string }>()
  const { selectedProject } = useAppStore()
  let child = <></>

  const pipelineProps = actionProps as PipelineProps
  const projectProps = actionProps as CreateOrSelectProjectProps

  const { description, moduleDescription } = getFormPropsByModule(module)
  let formDescription = getString(description as keyof StringsMap)

  switch (trialType) {
    case TrialType.SET_UP_PIPELINE: {
      child = (
        <CreatePipelineForm handleSubmit={pipelineProps.onSuccess as onCreatePipeline} closeModal={onCloseModal} />
      )
      break
    }
    case TrialType.CREATE_OR_SELECT_PIPELINE: {
      child = (
        <SelectOrCreatePipelineForm
          handleSubmit={pipelineProps.onSuccess as onSelectPipeline}
          closeModal={onCloseModal}
          openCreatPipeLineModal={() => {
            history.push(
              routes.toPipelineStudio({
                orgIdentifier: selectedProject?.orgIdentifier || '',
                projectIdentifier: selectedProject?.identifier || '',
                pipelineIdentifier: '-1',
                accountId,
                module
              })
            )
          }}
        />
      )
      formDescription = getString('pipeline.selectOrCreateForm.description')
      break
    }
    case TrialType.CREATE_OR_SELECT_PROJECT: {
      child = (
        <CreateOrSelectAProjectTemplate
          onCreateProject={() => {
            projectProps.onCreateProject()
          }}
          closeModal={onCloseModal}
          moduleDescription={getString(moduleDescription as keyof StringsMap)}
        />
      )
    }
  }

  return { child, description: formDescription }
}
