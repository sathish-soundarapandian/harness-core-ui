import React from 'react'
import cx from 'classnames'
import { FontVariation, Color } from '@harness/design-system'
import { Layout, CardSelect, Text, Icon, IconName } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { SERVICE_TYPES, EntityType, INFRA_TYPES } from './Constants'
import css from './CDOnboardingWizardWithCLI.module.scss'

function WhatToDeploy(): JSX.Element {
  const [state, setState] = React.useState<{ svcType: EntityType; artifactType: EntityType }>({
    svcType: SERVICE_TYPES.KubernetesService,
    artifactType: INFRA_TYPES[SERVICE_TYPES.KubernetesService.id].KubernetesManifest
  })

  const { getString } = useStrings()
  const setSvc = (selected: EntityType): void => {
    setState({ ...state, svcType: selected })
  }
  const setInfra = (selected: EntityType): void => {
    setState({ ...state, artifactType: selected })
  }
  const svcTypes = React.useMemo((): EntityType[] => {
    return Object.values(SERVICE_TYPES).map((data: EntityType) => {
      return data
    })
  }, [])

  const infraTypes = React.useMemo((): EntityType[] => {
    return Object.values(INFRA_TYPES[state.svcType.id]).map((data: EntityType) => {
      return data
    })
  }, [])
  return (
    <Layout.Vertical className={css.whatToDeploySection}>
      <Text color={Color.BLACK} className={css.bold} font={{ size: 'medium' }} margin={{ bottom: 'xxlarge' }}>
        {getString('cd.getStartedWithCD.flowbyquestions.what.aboutSvc')}
      </Text>
      <CardSelect<EntityType>
        data={svcTypes}
        cornerSelected
        className={css.serviceTypeCards}
        renderItem={(item: EntityType) => (
          <Layout.Horizontal flex spacing={'small'}>
            <Text
              className={cx({ [css.bold]: state.svcType.id === item.id })}
              font={{ variation: FontVariation.FORM_TITLE }}
              color={state.svcType.id === item.id ? Color.PRIMARY_7 : Color.GREY_800}
            >
              {item.label}
            </Text>
          </Layout.Horizontal>
        )}
        selected={state.svcType}
        onChange={setSvc}
      />
      <Text color={Color.BLACK} className={css.bold} margin={{ bottom: 'large' }}>
        {getString('cd.getStartedWithCD.flowbyquestions.what.K8sSteps.k8sSvcRep')}
      </Text>
      <Text color={Color.BLACK} margin={{ bottom: 'xxlarge' }}>
        {getString('cd.getStartedWithCD.flowbyquestions.what.K8sSteps.artifact')}
      </Text>
      <CardSelect<EntityType>
        data={infraTypes}
        cornerSelected
        className={cx(css.serviceTypeCards, css.infraCards)}
        renderItem={(item: EntityType) => (
          <Layout.Vertical flex spacing={'xlarge'}>
            <Icon name={item?.icon as IconName} size={30} />
            <Text
              className={cx({ [css.bold]: state.svcType.id === item.id })}
              font={{ variation: state.artifactType.id === item.id ? FontVariation.FORM_TITLE : FontVariation.BODY }}
              color={state.artifactType.id === item.id ? Color.PRIMARY_7 : Color.GREY_800}
            >
              {item.label}
            </Text>
          </Layout.Vertical>
        )}
        selected={state.artifactType}
        onChange={setInfra}
      />
    </Layout.Vertical>
  )
}

export default WhatToDeploy
