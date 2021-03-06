import React from 'react';
import { Tabs, Icon, Layout } from 'antd';
import WalletsContent from './wallets.content.component';
import StatsContent from './stats.content.component';
import TransactionsContent from './payments.content.component.jsx';

const { Header, Footer, Content } = Layout;

class App extends React.Component {

    render() {
        return (
            <Layout>
                <Header className="Header">
                    <img style={{ marginTop: '10px', height: '40px', width: 'auto', float: 'left', marginRight: '18px' }}
                         src="./images/logo.png"
                         alt="Bitgesel Logo" />

                    <h3>CWK Wallet - Crossplatform Wallet for Bitgesell</h3>
                </Header>
                <Content>
                    <div className="App">
                        <Tabs defaultActiveKey="2" style={{ padding: '16px' }}>
                            {/*<Tabs.TabPane tab={<span><Icon type="line-chart" />Price Charts</span>} key="1">
                                <StatsContent />
                            </Tabs.TabPane>*/}
                            <Tabs.TabPane tab={<span><Icon type="wallet" />Wallets</span>} key="2">
                                <WalletsContent/>
                            </Tabs.TabPane>
                            <Tabs.TabPane tab={<span><Icon type="credit-card" />Payments</span>} key="3">
                                <TransactionsContent/>
                            </Tabs.TabPane>
                        </Tabs>
                    </div>
                </Content>

                <Footer>Developed for CWK by IBI Solutions
                </Footer>
            </Layout>

        );
    }
}

export default App;
