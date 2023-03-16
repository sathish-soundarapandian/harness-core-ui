import {
  BasePipelineTypes,
  setupBasePipeline,
  addStepToPipeline,
  visitInputSetsPage,
  visitTriggersPage,
  addInputSet,
  addTrigger,
  visitTemplatesPage,
  addTemplate,
  selectStepInStepLibrary
} from '../../support/75-ci/CIpipeline.utils'

const runtimeInputParagraphLabels = ['Uses', 'Settings', 'Environment Variables']

describe('GHA Plugin Step', () => {
  beforeEach(() => {
    setupBasePipeline(BasePipelineTypes.BASE_ECHO)
  })

  it('add GHA plugin step to base pipeline', () => {
    addStepToPipeline()
    selectStepInStepLibrary('Github Action Plugin')
    cy.get('.bp3-input-group').eq(0).type('GHA plugin')
    cy.get('.bp3-input-group').eq(1).type('hello-world-javascript-action@main')
    cy.get('.bp3-button-text').contains('Apply Changes').click()
    cy.wait(1000)
  })
})

describe('Input Sets', () => {
  beforeEach(() => {
    visitInputSetsPage(BasePipelineTypes.GHA_PLUGIN_STEP)
  })

  it('checks input sets for GHA plugin step pipeline', () => {
    addInputSet()
    runtimeInputParagraphLabels.forEach(fieldName => {
      cy.get('[class*="PipelineInputSetForm"] p').contains(fieldName)
    })
  })
})

describe('Triggers', () => {
  beforeEach(() => {
    visitTriggersPage(BasePipelineTypes.GHA_PLUGIN_STEP)
  })
  it('check triggers', () => {
    addTrigger()
    runtimeInputParagraphLabels.forEach(fieldName => {
      cy.get('[class*="PipelineInputSetForm"] p').contains(fieldName)
    })
  })
})

describe('Templates', () => {
  beforeEach(() => {
    visitTemplatesPage()
  })

  it('TEMPLATES: Sanity test to verify new GHA plugin Step Template with runtime input field labels', () => {
    addTemplate('GHA Plugin step')
    selectStepInStepLibrary('Github Action Plugin')

    cy.get('[class*="SplitPane"]').scrollTo('0%', '50%', { ensureScrollable: false })

    cy.contains('div', 'Optional Configuration').should('be.visible')
    cy.contains('div', 'Optional Configuration').click()

    runtimeInputParagraphLabels.forEach(fieldName => {
      cy.get('form p').contains(fieldName)
    })
  })
})
