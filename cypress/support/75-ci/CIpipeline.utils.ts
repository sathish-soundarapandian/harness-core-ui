import {
  gitSyncEnabledCall,
  pipelineDetails,
  pipelineSaveCall,
  stepLibrary,
  pipelineVariablesCall,
  stagesExecutionList,
  inputSetsCall,
  inputSetsTemplateCall,
  pipelineSummaryCallAPIWIthMetadataOnly,
  pipelineDetailsWithRoutingIdCall,
  inputSetsRoute,
  triggersRoute,
  templatesListCall,
  templatesListRoute
} from '../70-pipeline/constants'

import { getTriggerListAPI } from '../../integration/72-triggers/constansts'

import {
  pipelineStudioRoute,
  echoStepPipelineYaml,
  echoStepInputSetTemplateYaml,
  echoStepResolvedTemplatesPipelineYaml,
  GHAPluginStepPipelineYaml,
  GHAPluginInputSetPipelineYaml,
  GHAPluginStepResolvedTemplatesPipelineYaml,
  BitrisePluginStepPipelineYaml,
  BitrisePluginStepInputSetTemplateYaml,
  BitrisePluginStepResolvedTemplatesPipelineYaml
} from './constants'

export const BasePipelineTypes = {
  BASE_ECHO: 'BASE_ECHO', // pipeline has one echo script as run step
  INPUT_SET_RUN_STEP: 'INPUT_SET_RUN', // pipeline has run step with all fields as run time inputs,
  GHA_PLUGIN_STEP: 'GHA_PLUGIN_STEP',
  BITRISE_PLUGIN_STEP: 'BITRISE_PLUGIN_STEP'
} as const

type BasePipelineTypeKeys = keyof typeof BasePipelineTypes
type BasePipelineTypeValues = typeof BasePipelineTypes[BasePipelineTypeKeys]

export const visitExecutionStageWithAssertion = (): void => {
  cy.visit(pipelineStudioRoute, {
    timeout: 30000
  })
  cy.wait(2000)
  cy.visitPageAssertion()
  cy.wait('@pipelineDetailsAPIRoute', { timeout: 30000 })
  cy.wait(2000)
}

export const setupBasePipeline = (type: BasePipelineTypeValues): void => {
  // sets token
  cy.initializeRoute()

  cy.intercept('GET', gitSyncEnabledCall, {
    connectivityMode: null,
    gitSyncEnabled: false,
    gitSimplificationEnabled: false
  })
  cy.intercept('POST', pipelineSaveCall, { fixture: 'pipeline/api/pipelines.post' })
  cy.intercept('POST', stepLibrary, { fixture: 'ci/api/common/stepLibraryResponse.json' }).as('stepLibrary')
  cy.intercept('GET', stagesExecutionList, { fixture: 'ci/api/common/stagesExecutionListResponse.json' }).as(
    'stagesExecutionList'
  )

  // fetch the base pipeline
  switch (type) {
    case BasePipelineTypes.INPUT_SET_RUN_STEP:
      cy.intercept('GET', pipelineDetails, { fixture: 'ci/api/runStep/pipelineDetails.json' }).as(
        'pipelineDetailsAPIRoute'
      )
      break
    case BasePipelineTypes.BASE_ECHO:
    default: {
      const dynamicValues = [
        {
          key: 'yamlPipeline',
          value: echoStepPipelineYaml
        }
      ]
      cy.generateCIPipelineYamlDynamicFixture(dynamicValues)
      cy.wait(5000)
      cy.intercept('GET', pipelineDetails, { fixture: 'ci/api/common/dynamicFixtureCIPipelineYAML.json' }).as(
        'pipelineDetailsAPIRoute'
      )
      break
    }
  }
  cy.intercept('POST', pipelineVariablesCall, { fixture: 'pipeline/api/notifications/pipelines.variables' })
  visitExecutionStageWithAssertion()
}

export const selectStage = (stageName: string) => {
  cy.contains('p', stageName).should('be.visible')
  cy.contains('p', stageName).click({ force: true })
}

export const addStepToPipeline = () => {
  cy.contains('p', 'Add Step').click({ force: true })
  cy.get('button[data-testid="addStepPipeline"]').click({ force: true })
}

export const selectStepInStepLibrary = (step: string) => {
  cy.get(`[data-testid="step-card-${step}"]`).click({ force: true })
  cy.wait(1000)
}

export const interceptDynamicFixtures = () => {
  cy.intercept('POST', inputSetsTemplateCall, {
    fixture: 'ci/api/common/dynamicFixtureCIPipelineTemplate.json'
  }).as('fetchServiceTemplate')
  cy.intercept('GET', pipelineDetailsWithRoutingIdCall, {
    fixture: 'ci/api/common/dynamicFixtureCIPipelineYAML.json'
  }).as('fetchPipelineTemplate')
}

export const inputSetPipelineMocks = (type: BasePipelineTypeValues) => {
  let dynamicValuesPipelineYAML
  let dynamicValuesPipelineTemplate
  switch (type) {
    case BasePipelineTypes.INPUT_SET_RUN_STEP:
      cy.intercept('POST', inputSetsTemplateCall, {
        fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
      }).as('fetchServiceTemplate')
      cy.intercept('GET', pipelineDetailsWithRoutingIdCall, {
        fixture: 'ci/api/runStep/fetchPipelineTemplate'
      }).as('fetchPipelineTemplate')
      break

    case BasePipelineTypes.GHA_PLUGIN_STEP:
      dynamicValuesPipelineTemplate = [
        {
          key: 'inputSetTemplateYaml',
          value: GHAPluginInputSetPipelineYaml
        }
      ]
      cy.generateCIPipelineTemplateYamlDynamicFixture(dynamicValuesPipelineTemplate)
      dynamicValuesPipelineYAML = [
        {
          key: 'yamlPipeline',
          value: GHAPluginStepPipelineYaml
        },
        {
          key: 'resolvedTemplatesPipelineYaml',
          value: GHAPluginStepResolvedTemplatesPipelineYaml
        }
      ]
      cy.generateCIPipelineYamlDynamicFixture(dynamicValuesPipelineYAML)
      cy.wait(5000)
      interceptDynamicFixtures()
      break

    case BasePipelineTypes.BITRISE_PLUGIN_STEP:
      dynamicValuesPipelineTemplate = [
        {
          key: 'inputSetTemplateYaml',
          value: BitrisePluginStepInputSetTemplateYaml
        }
      ]
      cy.generateCIPipelineTemplateYamlDynamicFixture(dynamicValuesPipelineTemplate)
      dynamicValuesPipelineYAML = [
        {
          key: 'yamlPipeline',
          value: BitrisePluginStepPipelineYaml
        },
        {
          key: 'resolvedTemplatesPipelineYaml',
          value: BitrisePluginStepResolvedTemplatesPipelineYaml
        }
      ]
      cy.generateCIPipelineYamlDynamicFixture(dynamicValuesPipelineYAML)
      cy.wait(5000)
      interceptDynamicFixtures()
      break

    case BasePipelineTypes.BASE_ECHO:
    default:
      dynamicValuesPipelineTemplate = [
        {
          key: 'inputSetTemplateYaml',
          value: echoStepInputSetTemplateYaml
        }
      ]
      cy.generateCIPipelineTemplateYamlDynamicFixture(dynamicValuesPipelineTemplate)
      dynamicValuesPipelineYAML = [
        {
          key: 'yamlPipeline',
          value: echoStepPipelineYaml
        },
        {
          key: 'resolvedTemplatesPipelineYaml',
          value: echoStepResolvedTemplatesPipelineYaml
        }
      ]
      cy.generateCIPipelineYamlDynamicFixture(dynamicValuesPipelineYAML)
      cy.wait(5000)
      interceptDynamicFixtures()
      break
  }
}

export const visitInputSetsPage = (type: BasePipelineTypeValues): void => {
  cy.initializeRoute()
  cy.intercept('GET', inputSetsCall, { fixture: 'pipeline/api/inputSet/emptyInputSetsList' }).as('emptyInputSetList')
  switch (type) {
    case BasePipelineTypes.INPUT_SET_RUN_STEP:
      inputSetPipelineMocks(BasePipelineTypes.INPUT_SET_RUN_STEP)
      break

    case BasePipelineTypes.GHA_PLUGIN_STEP:
      inputSetPipelineMocks(BasePipelineTypes.GHA_PLUGIN_STEP)
      break

    case BasePipelineTypes.BITRISE_PLUGIN_STEP:
      inputSetPipelineMocks(BasePipelineTypes.BITRISE_PLUGIN_STEP)
      break

    case BasePipelineTypes.BASE_ECHO:
    default:
      inputSetPipelineMocks(BasePipelineTypes.BASE_ECHO)
      break
  }
  cy.intercept('GET', pipelineSummaryCallAPIWIthMetadataOnly, {
    fixture: 'pipeline/api/inputSet/pipelineSummary'
  }).as('pipelineMetadata')
  cy.visit(inputSetsRoute, {
    timeout: 30000
  })
  cy.wait(2000)
  cy.visitPageAssertion()
}

export const addInputSet = () => {
  cy.wait('@pipelineMetadata')
  cy.wait('@emptyInputSetList')
  cy.wait(1000)
  cy.contains('span', '+ New Input Set').should('be.visible')
  cy.get('.NoDataCard--buttonContainer').contains('span', '+ New Input Set').click()
  cy.get('a.bp3-menu-item').contains('div', 'Input Set').click()
  cy.wait(2000)
}

export const visitTriggersPage = (type: BasePipelineTypeValues): void => {
  cy.initializeRoute()
  cy.intercept('GET', getTriggerListAPI, { fixture: 'pipeline/api/triggers/emptyTriggersList' }).as('emptyTriggersList')
  switch (type) {
    case BasePipelineTypes.INPUT_SET_RUN_STEP:
      inputSetPipelineMocks(BasePipelineTypes.INPUT_SET_RUN_STEP)
      break

    case BasePipelineTypes.GHA_PLUGIN_STEP:
      inputSetPipelineMocks(BasePipelineTypes.GHA_PLUGIN_STEP)
      break

    case BasePipelineTypes.BITRISE_PLUGIN_STEP:
      inputSetPipelineMocks(BasePipelineTypes.BITRISE_PLUGIN_STEP)
      break

    case BasePipelineTypes.BASE_ECHO:
    default:
      inputSetPipelineMocks(BasePipelineTypes.BASE_ECHO)
      break
  }
  cy.visit(triggersRoute, {
    timeout: 30000
  })
  cy.wait(2000)
  cy.visitPageAssertion()
  cy.wait('@emptyTriggersList')
  cy.wait(1000)
}

export const addTrigger = () => {
  cy.contains('span', 'Add New Trigger').should('be.visible')
  cy.get('.NoDataCard--buttonContainer').contains('span', 'Add New Trigger').click()
  cy.contains('section', 'Custom').should('be.visible')
  cy.get('section').contains('Custom').click()
  cy.wait(1000)
  cy.contains('span', 'Pipeline Input').should('be.visible')
  cy.get('span').contains('Pipeline Input').click()
}

export const visitTemplatesPage = () => {
  cy.initializeRoute()
  cy.intercept('GET', templatesListCall, { fixture: 'template/api/emptyTemplatesList' }).as('emptyTemplatesList')
  cy.intercept('POST', stepLibrary, { fixture: 'ci/api/common/stepLibraryResponse.json' }).as('stepLibrary')
  cy.visit(templatesListRoute, {
    timeout: 30000
  })
  cy.wait(2000)
}

export const addTemplate = (templateName: string) => {
  cy.contains('span', 'New Template').should('be.visible')
  cy.get('span').contains('New Template').click()
  cy.contains('li', 'Step').should('be.visible')
  cy.get('li').contains('Step').click()
  cy.wait(1000)
  cy.fillField('name', templateName)
  cy.fillField('versionLabel', 'v1')
  cy.contains('span', 'Start').should('be.visible')
  cy.get('span').contains('Start').click()
  cy.wait(1000)
}
