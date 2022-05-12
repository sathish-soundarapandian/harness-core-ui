import {
  cdFailureStrategiesYaml,
  gitSyncEnabledCall,
  pipelinesRoute,
  pipelineVariablesCall
} from '../../support/70-pipeline/constants'

describe.skip('Pipeline Variables', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: false })
    cy.intercept('GET', cdFailureStrategiesYaml, { fixture: 'pipeline/api/pipelines/failureStrategiesYaml' }).as(
      'cdFailureStrategiesYaml'
    )

    cy.initializeRoute()

    cy.visit(pipelinesRoute)

    cy.contains('span', 'Create a Pipeline').click()

    cy.fillName('testPipeline_Cypress')

    cy.clickSubmit()

    cy.get('[icon="plus"]').click()
    cy.findByTestId('stage-Deployment').click()

    cy.fillName('testStage_Cypress')
    cy.clickSubmit()

    cy.contains('span', 'Variables').click()
    cy.wait('@cdFailureStrategiesYaml')

    cy.intercept('POST', pipelineVariablesCall, {
      fixture: 'pipeline/api/runpipeline/pipelines.variables'
    }).as('pipelineVariablesCall')
  })

  it('expands and collapses on click of header', () => {
    cy.contains('span', 'Add Variable').should('have.length', '1')
    cy.get('div[data-testid="pipeline.variables-summary"]').click({ force: true })

    cy.wait(1000)

    cy.get('div[data-testid="pipeline.variables-panel"]').contains('span', 'Add Variable').should('not.be.visible')
    cy.get('div[data-testid="pipeline.variables-summary"]').click({ force: true })

    cy.contains('span', 'Add Variable').should('have.length', '1')
  })

  it('create pipeline variable, add value and view', () => {
    cy.get('div[data-testid="pipeline.variables-panel"]').contains('span', 'Add Variable').click({ force: true })

    cy.fillName('test')
    cy.get('button[data-testid="addVariableSave"]').click()
    cy.wait('@pipelineVariablesCall')

    cy.get('div[data-testid="pipeline.variables-panel"]').get('input[name="variables[0].value"]').should('be.visible')
  })

  it('change type of pipeline variables', () => {
    cy.get('div[data-testid="pipeline.variables-panel"]').contains('span', 'Add Variable').click({ force: true })

    cy.fillName('test')
    cy.get('button[data-testid="addVariableSave"]').click()
    cy.wait('@pipelineVariablesCall')

    cy.get('input[name="variables[0].value"]').fillField('variables[0].value', 'test1')

    cy.get('div[data-testid="pipeline.variables-panel"]').get('.MultiTypeInput--FIXED').eq(1).click({ force: true })

    cy.get('.bp3-menu>li>a').eq(1).click({ force: true })
    cy.wait(1000)
    cy.get('input[name="variables[0].value"]').should('be.disabled').should('have.value', '<+input>')

    cy.get('div[data-testid="pipeline.variables-panel"]').get('.MultiTypeInput--RUNTIME').eq(0).click({ force: true })

    cy.get('.bp3-menu>li>a').eq(2).click({ force: true })
    cy.wait(1000)
    cy.get('input[name="variables[0].value"]').should('not.be.disabled').should('have.value', '')

    cy.get('div[data-testid="pipeline.variables-panel"]')
      .get('.MultiTypeInput--EXPRESSION')
      .eq(0)
      .click({ force: true })

    cy.get('.bp3-menu>li>a').eq(0).click({ force: true })
    cy.wait(2000)
    cy.get('input[name="variables[0].value"]').should('not.be.disabled').should('have.value', '')
  })

  it('add default values for runtime values', () => {
    cy.get('div[data-testid="pipeline.variables-panel"]').contains('span', 'Add Variable').click({ force: true })

    cy.fillName('test')
    cy.get('button[data-testid="addVariableSave"]').click()
    cy.wait('@pipelineVariablesCall')

    cy.get('input[name="variables[0].value"]').fillField('variables[0].value', 'test1')

    cy.get('div[data-testid="pipeline.variables-panel"]').get('.MultiTypeInput--FIXED').eq(1).click({ force: true })

    cy.get('.bp3-menu>li>a').eq(1).click({ force: true })
    cy.wait(1000)
    cy.get('input[name="variables[0].value"]').should('be.disabled').should('have.value', '<+input>')

    cy.get('svg[data-icon="cog"]').click({ force: true })

    cy.contains('h4', 'configure options')

    cy.get('.RadioButton--radio').eq(1).click()

    cy.fillField('defaultValue', '1')
    cy.get('.bp3-tag-input-values>input').type('1{enter}2{enter}3{enter}4{enter}5{enter}')

    cy.contains('span', 'Submit').click({ force: true })

    cy.get('input[name="variables[0].value"]')
      .should('be.disabled')
      .should('have.value', '<+input>.allowedValues(1,2,3,4,5)')
  })

  it('delete pipeline variable', () => {
    cy.get('div[data-testid="pipeline.variables-panel"]').contains('span', 'Add Variable').click({ force: true })

    cy.fillName('test')
    cy.get('button[data-testid="addVariableSave"]').click()
    cy.wait('@pipelineVariablesCall')

    cy.get('input[name="variables[0].value"]').fillField('variables[0].value', 'test1')

    cy.get('button[data-testid="delete-variable-0"]').click({ force: true })

    cy.get('input[name="variables[0].value"]').should('not.exist')
  })
})
