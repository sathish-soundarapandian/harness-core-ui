import { Drawer, Position } from '@blueprintjs/core';
import { Layout, Text, Button, ButtonVariation, Color, Icon } from '@harness/uicore';
import { useStrings } from 'framework/strings';
import React from 'react';
import { Link } from 'react-router-dom';
import addDiscoveryAgent from '../../../images/create-discovery-agent.svg';

const AddDiscoveryAgent: React.FC = () => {
    const { getString } = useStrings();
    const [openDrawer, setOpenDrawer] = React.useState(false);

    return <Layout.Vertical spacing="large" style={{ margin: "auto" }} flex={{ alignItems: "center" }}>
        <img src={addDiscoveryAgent} width="210px" height="140px" />
        <Text color={Color.BLACK} font={{ size: "medium", weight: "semi-bold" }}  >
            {getString('discovery.homepage.noDiscoveryAgent')}
        </Text>
        <Text width={600} style={{ textAlign: "center" }}>
            {getString('discovery.homepage.discoveryAgentDesc')}
        </Text>
        <Button onClick={() => { setOpenDrawer(!openDrawer) }} text={getString('discovery.homepage.newDiscoveryAgentBtn')} icon="plus" variation={ButtonVariation.PRIMARY} />
        <Link to={"#"} target="_blank">
            <Text inline color={Color.PRIMARY_7} margin={{ right: 'xsmall' }}>
                {getString('common.learnMore')}
            </Text>
            <Icon color={Color.PRIMARY_7} name="launch" size={12} />
        </Link>
        <Drawer position={Position.RIGHT} isOpen={openDrawer} isCloseButtonShown={true} size={'86%'}>
            <Text>Add Discovery Agent Drawer</Text>
            <Button width={20} intent='primary' icon='cross' onClick={() => { setOpenDrawer(false) }} />
        </Drawer>
    </Layout.Vertical>
}

export default AddDiscoveryAgent;