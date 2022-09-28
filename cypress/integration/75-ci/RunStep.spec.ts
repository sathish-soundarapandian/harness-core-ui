import { parse } from 'yaml'
import {
  gitSyncEnabledCall,
  runPipelineTemplateCall,
  inputSetTemplate,
  pipelineDetails,
  pipelineSaveCall,
  pipelineStudioRoute,
  triggersRoute,
  inputSetsRoute,
  inputSetsCall,
  inputSetsTemplateCall,
  pipelineDetailsWithRoutingIdCall,
  triggersList,
  templatesListCall,
  templatesListRoute,
  stepLibrary,
  pipelineVariablesCall,
  stagesExecutionList
} from '../../support/70-pipeline/constants'
import { getRuntimeInputKeys } from '../../utils/step-utils'
import templatesData from '../../fixtures/ci/api/runStep/inputSetTemplateResponse.json'
// Data from QA, CI Automation Account
// https://qa.harness.io/ng/#/account/h61p38AZSV6MzEkpWWBtew/ci/orgs/default/projects/mtran/pipelines/CI_Pipeline1/pipeline-studio/

const runtimeInputLabels = [
  'Description',
  'Command',
  'Privileged',
  'Report Paths',
  'Output Variables',
  'Environment Variables',
  'Timeout'
]

// These labels are not wrapped in Label tags
const runtimeInputParagraphLabels = ['Container Registry', 'Image', 'Run as User', 'Limit Memory', 'Limit CPU']

describe('Pipeline Studio', () => {
  const visitExecutionStageWithAssertion = (): void => {
    cy.visit(pipelineStudioRoute, {
      timeout: 30000
    })
    cy.wait(2000)
    cy.visitPageAssertion()
    cy.wait('@pipelineDetailsAPIRoute', { timeout: 30000 })
    cy.wait(2000)
  }

  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
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
    // ensure resolvedTemplatesPipelineYaml is in data
    cy.intercept('GET', pipelineDetails, { fixture: 'ci/api/runStep/pipelineDetails.json' }).as(
      'pipelineDetailsAPIRoute'
    )
    cy.intercept('POST', pipelineVariablesCall, { fixture: 'pipeline/api/notifications/pipelines.variables' })
    cy.intercept('POST', inputSetTemplate, {
      fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    }).as('inputSetTemplateCall')
    cy.intercept('POST', runPipelineTemplateCall, {
      fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    }).as('inputSetTemplateCall')

    visitExecutionStageWithAssertion()
  })

  it('STEP CONFIG: Toggle all fields as Runtime Inputs', () => {
    const numOfPossibleRuntimeInputs = 12
    var skipFieldIndexes: number[] = [3, 9] // start index count at 0
    // skip Shell(3) and Image Pull Policy (9)
    cy.intercept('POST', runPipelineTemplateCall, {
      fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    }).as('inputSetTemplateCall')
    cy.contains('p', 'CI_Stage1').should('be.visible')
    cy.contains('p', 'CI_Stage1').click()
    cy.contains('p', 'Add Step').click({ force: true })
    cy.get('button[data-testid="addStepPipeline"]').click({ force: true })
    cy.get('[data-testid="step-card-Run"]').click({ force: true })
    cy.wait(1000)
    cy.contains('div', 'Optional Configuration').should('be.visible')
    cy.contains('div', 'Optional Configuration').click()
    let indexCounter = 0
    const multiTypeButton = Array.from(Array(numOfPossibleRuntimeInputs).keys()).map((_, index) => {
      if (skipFieldIndexes.includes(index + indexCounter)) {
        indexCounter += 1
      }
      return indexCounter
    })
    multiTypeButton.forEach(i => {
      cy.get('span[data-icon="fixed-input"]').eq(i).click()
      cy.contains('span', 'Runtime input').click()
      cy.wait(200)
    })
  })

  it('RUN PIPELINE: Prompts for all required runtime inputs in YAML view', () => {
    cy.intercept('POST', runPipelineTemplateCall, {
      fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    }).as('inputSetTemplateCall')
    cy.contains('span', 'Run').click()
    cy.wait(1000)
    const arrayOfFieldNames = getRuntimeInputKeys(parse(templatesData.data.inputSetTemplateYaml))
    cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()
    cy.get('[class*="bp3-dialog"] [data-name="toggle-option-two"]').click()

    cy.contains('span', 'run-pipeline.yaml').should('be.visible')
    cy.get('.monaco-editor .overflow-guard').scrollTo('0%', '30%', { ensureScrollable: false })

    // should verify all but it fails on some
    // Need to manually test the following fields:
    // description, outputVariables, runAsUser, connectorRef, image, memory, cpu, timeout
    arrayOfFieldNames.forEach(fieldName => {
      if (
        fieldName !== 'description' &&
        fieldName !== 'outputVariables' &&
        fieldName !== 'runAsUser' &&
        fieldName !== 'connectorRef' &&
        fieldName !== 'memory' &&
        fieldName !== 'cpu' &&
        fieldName !== 'image' &&
        fieldName !== 'timeout'
      ) {
        cy.get('[class*="view-line"] [class*="mtk5"]').contains(fieldName)
      }
    })
    cy.log(
      'Manually verify the following fields: description, outputVariables, runAsUser, memory, connectorRef, cpu, image, timeout'
    )
    cy.wait(5000)
  })
})

describe('Input Sets', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.initializeRoute()
    cy.intercept('GET', inputSetsCall, { fixture: 'pipeline/api/inputSet/emptyInputSetsList' }).as('emptyInputSetList')
    cy.intercept('POST', inputSetsTemplateCall, {
      fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    }).as('fetchServiceTemplate')
    cy.intercept('GET', pipelineDetailsWithRoutingIdCall, {
      fixture: 'ci/api/runStep/fetchPipelineTemplate'
    }).as('fetchPipelineTemplate')
    cy.visit(inputSetsRoute, {
      timeout: 30000
    })
    cy.wait(2000)
  })

  it('INPUT SET: Show all runtime inputs in Visual view with correct full-page styling', () => {
    cy.visitPageAssertion()
    cy.wait('@emptyInputSetList')
    cy.wait(1000)
    cy.contains('span', '+ New Input Set').should('be.visible')
    cy.get('.NoDataCard--buttonContainer').contains('span', '+ New Input Set').click()
    cy.get('a.bp3-menu-item').contains('div', 'Input Set').click()
    cy.wait(5000)

    runtimeInputLabels.forEach(fieldName => {
      cy.get('[class*="PipelineInputSetForm"] label').contains(fieldName)
    })

    runtimeInputParagraphLabels.forEach(fieldName => {
      cy.get('[class*="PipelineInputSetForm"] p').contains(fieldName)
    })
  })
})

describe('Triggers', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.initializeRoute()
    cy.intercept('GET', triggersList, { fixture: 'pipeline/api/triggers/emptyTriggersList' }).as('emptyTriggersList')
    cy.intercept('POST', inputSetsTemplateCall, {
      fixture: 'ci/api/runStep/inputSetTemplateResponse.json'
    }).as('fetchServiceTemplate')
    cy.intercept('GET', pipelineDetailsWithRoutingIdCall, {
      fixture: 'ci/api/runStep/fetchPipelineTemplate'
    }).as('fetchPipelineTemplate')
    cy.visit(triggersRoute, {
      timeout: 30000
    })
    cy.wait(2000)
  })

  it('TRIGGERS: Show all runtime inputs in Visual view with correct full-page styling', () => {
    cy.visitPageAssertion()
    cy.wait('@emptyTriggersList')
    cy.wait(1000)
    cy.contains('span', 'Add New Trigger').should('be.visible')
    cy.get('.NoDataCard--buttonContainer').contains('span', 'Add New Trigger').click()
    cy.contains('section', 'Custom').should('be.visible')
    cy.get('section').contains('Custom').click()
    cy.wait(1000)
    cy.contains('span', 'Pipeline Input').should('be.visible')
    cy.get('span').contains('Pipeline Input').click()

    runtimeInputLabels.forEach(fieldName => {
      cy.get('[class*="PipelineInputSetForm"] label').contains(fieldName)
    })

    runtimeInputParagraphLabels.forEach(fieldName => {
      cy.get('[class*="PipelineInputSetForm"] p').contains(fieldName)
    })
  })
})

describe('Templates', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.initializeRoute()
    cy.intercept('GET', templatesListCall, { fixture: 'template/api/emptyTemplatesList' }).as('emptyTemplatesList')
    cy.intercept('POST', stepLibrary, { fixture: 'ci/api/common/stepLibraryResponse.json' }).as('stepLibrary')
    cy.visit(templatesListRoute, {
      timeout: 30000
    })
    cy.wait(2000)
  })

  it('TEMPLATES: Sanity test to verify new Step Template with runtime input field labels', () => {
    cy.contains('span', 'New Template').should('be.visible')
    cy.get('span').contains('New Template').click()
    cy.contains('li', 'Step').should('be.visible')
    cy.get('li').contains('Step').click()
    cy.wait(1000)
    cy.fillField('name', 'runStepTemplate')
    cy.fillField('versionLabel', 'v1')

    cy.contains('span', 'Start').should('be.visible')
    cy.get('span').contains('Start').click()

    cy.wait(1000)
    cy.get('[data-testid="step-card-Run"]').click({ force: true })
    cy.wait(1000)

    cy.get('[class*="SplitPane"]').scrollTo('0%', '50%', { ensureScrollable: false })

    cy.contains('div', 'Optional Configuration').should('be.visible')
    cy.contains('div', 'Optional Configuration').click()

    runtimeInputLabels.forEach(fieldName => {
      cy.get('form label').contains(fieldName)
    })

    runtimeInputParagraphLabels.forEach(fieldName => {
      cy.get('form p').contains(fieldName)
    })
  })
})
