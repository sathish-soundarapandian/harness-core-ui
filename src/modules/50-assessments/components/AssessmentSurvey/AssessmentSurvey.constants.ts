import type { IDrawerProps} from '@blueprintjs/core';
import { Position } from '@blueprintjs/core'
import type { SectionsGroupedQuestions } from './AssessmentSurvey'

export const DrawerProps: IDrawerProps = {
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  isOpen: true,
  hasBackdrop: true,
  position: Position.RIGHT,
  usePortal: true,
  size: '40%',
  isCloseButtonShown: true
}

export const SURVEY_CHART_OPTIONS = {
  chart: {
    height: 80,
    width: 300
  },
  plotOptions: {
    bar: {
      pointWidth: 10
    }
  }
}

export const LEVEL_FILTER_OPTIONS = [
  { label: 'Level 1', value: 'Level 1' },
  { label: 'Level 2', value: 'Level 2' },
  { label: 'Level 3', value: 'Level 3' },
  { label: 'All', value: 'all' }
]

export const mockData = [
  {
    categoryName: 'Planning and Requirements Process',
    weightage: 5.25,
    percetangeScore: 55,
    scores: {
      companyScore: 64,
      benchmarkScore: 68
    }
  },
  {
    categoryName: 'Discoverability and Documentation',
    weightage: 1.75,
    percetangeScore: 88,
    scores: {
      companyScore: 64,
      benchmarkScore: 68
    }
  },
  {
    categoryName: 'Developer Environment Experience',
    weightage: 4.75,
    percetangeScore: 40,
    scores: {
      companyScore: 64,
      benchmarkScore: 68
    }
  }
]

export const mockDataForSectionsGroupedQuestions: SectionsGroupedQuestions[] = [
  {
    sectionId: 'Planning and Requirements Process',
    sectionName: 'Planning and Requirements Process',
    weightage: 30,
    level: 'Level 3',
    userScore: 85,
    organizationScore: 32,
    benchmarkScore: 68,
    recommendations: 1,
    questions: [
      {
        questionName:
          'Adding additional features or functions of a new product, requirements, or work that is not authorized',
        capability: 'Scope Creep',
        level: 'Level 3',
        userScore: 85,
        organizationScore: 32,
        benchmarkScore: 68,
        recommendations:
          'Scope creep can result in context switches for developers resulting in dissatisfaction, overwork and poor outcomes. Consider leveraging Agile Training and Tooling to understand and chart scope creep'
      },
      {
        questionName:
          'Acceptance criteria are a set of requirements that must be met by a software product or service to be deemed acceptable or satisfactory by the customer or end-user.',
        capability: 'Acceptance Criteria',
        level: 'Level 3',
        userScore: 85,
        organizationScore: 32,
        benchmarkScore: 68,
        recommendations:
          'Lack of acceptance criteria can result in poor quality and rework. Consider tracking acceptance criteria as one of the important gates for starting development'
      },
      {
        questionName:
          'Documentation process is the practice of creating and maintaining documents that describe the software, including requirements, design, implementation, testing, and maintenance details.',
        capability: 'Documentation Process',
        level: 'Level 2',
        userScore: 85,
        organizationScore: 32,
        benchmarkScore: 68,
        recommendations:
          'Documenting and following the development methodology can ensure consistency and repeatability in development. Consider templatizing and documenting the entire development cycle. to ensure the consistency.'
      }
    ]
  },
  {
    sectionId: 'Discoverability and Documentation',
    sectionName: 'Discoverability and Documentation',
    weightage: 40,
    level: 'Level 2',
    userScore: 64,
    organizationScore: 32,
    benchmarkScore: 68,
    recommendations: 0,
    questions: [
      {
        questionName:
          'Adding additional features or functions of a new product, requirements, or work that is not authorized',
        capability: 'Scope Creep',
        level: 'Level 3',
        userScore: 64,
        organizationScore: 32,
        benchmarkScore: 68,
        recommendations: ''
      },
      {
        questionName:
          'Acceptance criteria are a set of requirements that must be met by a software product or service to be deemed acceptable or satisfactory by the customer or end-user.',
        capability: 'Acceptance Criteria',
        level: 'Level 3',
        userScore: 64,
        organizationScore: 32,
        benchmarkScore: 68,
        recommendations: ''
      },
      {
        questionName:
          'Documentation process is the practice of creating and maintaining documents that describe the software, including requirements, design, implementation, testing, and maintenance details.',
        capability: 'Documentation Process',
        level: 'Level 2',
        userScore: 64,
        organizationScore: 32,
        benchmarkScore: 68,
        recommendations: ''
      }
    ]
  },
  {
    sectionId: 'Developer Environment Experience',
    sectionName: 'Developer Environment Experience',
    weightage: 60,
    level: 'Level 3',
    userScore: 64,
    organizationScore: 72,
    benchmarkScore: 68,
    recommendations: 0,
    questions: [
      {
        questionName:
          'Adding additional features or functions of a new product, requirements, or work that is not authorized',
        capability: 'Scope Creep',
        level: 'Level 3',
        userScore: 64,
        organizationScore: 72,
        benchmarkScore: 68,
        recommendations: ''
      },
      {
        questionName:
          'Acceptance criteria are a set of requirements that must be met by a software product or service to be deemed acceptable or satisfactory by the customer or end-user.',
        capability: 'Acceptance Criteria',
        level: 'Level 3',
        userScore: 64,
        organizationScore: 72,
        benchmarkScore: 68,
        recommendations: ''
      },
      {
        questionName:
          'Documentation process is the practice of creating and maintaining documents that describe the software, including requirements, design, implementation, testing, and maintenance details.',
        capability: 'Documentation Process',
        level: 'Level 2',
        userScore: 64,
        organizationScore: 72,
        benchmarkScore: 68,
        recommendations: ''
      }
    ]
  }
]
