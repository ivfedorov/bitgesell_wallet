import React from 'react';

import { Button, Table, Modal, message, Popconfirm } from 'antd';

import { clipboard } from 'electron';

import Constants from './logic/constants';
import CreateForm from './create.form.modal.component';
import ImportForm from './import.form.modal.component';
import CreateTransaction from './create.transaction.modal.component';
import Hasher from './logic/hasher.util';
import Wallet from './logic/wallet.class';
import bnet from './logic/network';

// Helper Functions

const validateFormHashed = (form) => {
    return new Promise((res, rej) => {
        form.validateFields((err, values) => {
            if (err) rej(err);
            Hasher.hash(values.password).then((hash) => {
                values.password = hash;
                res(values);
            }, (e) => {
                rej(e);
            });
        });
    });
};

const formatAmount = (amount) => {
    const nf = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return nf.format(amount);
};

class WalletsContent extends React.Component {

    constructor(props) {

        super(props);
        this.state = {
            modalOpenCreate: false,
            modalOpenImport: false,
            modalOpenSend: false,
            price: 1.0,
            total: 0.0,
            wallets: [],
            payments: this.props.payments,
            sendingPayment: false,
            sourceWallet: null,
            pybglWalletData: [],
            isPybglWalletDataLoaded: false,
            pybglSendTransactionResponseData: [],
            isSendTransactionResponseLoaded: false,
            pybglImportWalletData: [],
            isPybglImportWalletDataLoaded: false,
        };

        this.handleCreate = this.handleCreate.bind(this);
        this.handleSendit = this.handleSendit.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleReload = this.handleReload.bind(this);
        this.handleImport = this.handleImport.bind(this);


    }

    componentDidMount() {

        bnet.api.getPrice('USD').then((r) => {
            this.setState({ price: r.sell });
        }).catch((e) => {
            console.log(e);
        });

        bnet.api.getFee().then((fee) => {
            console.log(fee);
            this.fee = fee;
        }).catch((e) => {
            console.log('Could not get fee ', e);
        });


        Wallet.all().then((wallets) => {

            wallets.forEach((w) => {
                w.on(Wallet.Events.Updated, () => {
                    const newTotal = this.state.wallets.coins();
                    this.setState({ total: newTotal });
                });
                w.update();
            });

            this.setState({ wallets: wallets });

        }, (e) => {
            console.log(e);
            message.error('Could not load wallets from database');
        });
    }

    pybglCreateWallet(name, password) {
        console.log('pybglCreateWallet');
        fetch('http://localhost:5000/create_wallet?name='+name+'&pass='+password)
            .then(response => response.json())
            .then(
                // handle the result
                (result) => {
                    this.setState({
                        pybglWalletData: result,
                        isPybglWalletDataLoaded: true,
                    });
                    const wallet = new Wallet({
                        name: this.state.pybglWalletData[0].name,
                        address: this.state.pybglWalletData[0].address,
                        wif: this.state.pybglWalletData[0].wif,
                        network: 'bitgessel',
                    });
                    console.log(this.state.pybglWalletData[0].name);
                    const mnemonic = this.state.pybglWalletData[0].mnemonic;
                    console.log(this.state.pybglWalletData[0].mnemonic);
                    this.__addWallet(wallet, mnemonic);
                },
                (error) => {
                    this.setState({
                        isPybglWalletDataLoaded: true,
                        error,
                    });
                },
            );
    }

    pybglImportWallet(name, password, wif) {
        console.log('pybglImportWallet');
        fetch('http://localhost:5000/import_wallet?name='+name+'&pass='+password+'&wif='+wif)
            .then(response => response.json())
            .then(
                // handle the result
                (result) => {
                    this.setState({
                        pybglImportWalletData: result,
                        isPybglImportWalletDataLoaded: true,
                    });
                    const wallet = new Wallet({
                        name: this.state.pybglImportWalletData[0].name,
                        address: this.state.pybglImportWalletData[0].address,
                        wif: wif,
                        network: 'bitgessel',
                    });
                    console.log(this.state.pybglImportWalletData[0].name);
                    const mnemonic = this.state.pybglImportWalletData[0].mnemonic;
                    console.log(this.state.pybglImportWalletData[0].mnemonic);
                    this.__addWallet(wallet, mnemonic);
                },
                (error) => {
                    this.setState({
                        isPybglImportWalletDataLoaded: true,
                        error,
                    });
                },
            );
    }


    handleCreate() {

        validateFormHashed(this.form).then((values) => {

            this.form.resetFields();
            this.setState({ modalOpenCreate: false });
            this.pybglCreateWallet(values.name, values.password);
        });

    }

    __addWallet(wallet, mnemonic) {

        this.setState({
            wallets: this.state.wallets.concat([wallet]),
        });

        wallet.save().then(() => {

            message.success(Constants.Messages.Wallet.Created);

            setTimeout(() => {
                Modal.warning({
                    title: Constants.Messages.Wallet.Mnemonic,
                    content: mnemonic,
                });
            }, 1000);

        }, (e) => {
            Modal.error({
                title: Constants.Messages.Wallet.Failed,
                content: e.toString(),
            });
        });
    }

    handleImport() {

        validateFormHashed(this.form).then((values) => {

            this.form.resetFields();
            this.setState({ modalOpenImport: false });
            this.pybglImportWallet(values.name, values.password, values.wif);
        });

    }

    pybglCreateTransaction(wallet, amount, address, wif, tx_hash) {
        console.log('pybglCreateWallet');
        fetch('http://localhost:5000/create_transaction?recipient='+wallet+'&bgl='+amount+'&wif='+wif+'&sender='+address+'&tx_hash='+tx_hash)
            .then(response => response.json())
            .then(
                // handle the result
                (result) => {
                    this.setState({
                        pybglSendTransactionResponseData: result,
                        isSendTransactionResponseLoaded: true
                    });
                    message.success(Constants.Messages.Transactions.Sent + result.result);
                    this.handleReload();
                },
                (error) => {
                    this.setState({
                        isSendTransactionResponseLoaded: false,
                        error,
                    });
                    const info = { title: Constants.Messages.Transactions.NOTSent };
                    const substring = Constants.ReturnValues.Fragments.MinimumFeeNotMet;
                    if (e.toString().includes(substring)) {
                        info.content = Constants.Messages.Errors.FeeNotMet;
                    }
                    Modal.error(info);
                },
            );
    }

    handleSendit() {
        validateFormHashed(this.form).then((values) => {

            this.setState({ modalOpenSend: false });

            if (!this.state.sourceWallet.matches(values.password)) {
                message.error('Wrong password entered.');
                return;
            }
            console.log(values.bitcoin);
            console.log(values.address);

            this.pybglCreateTransaction(values.address, values.bitcoin, this.state.sourceWallet.__address, this.state.sourceWallet.__wif, 'a23ba8030421f2f6f3f7b4f3ab70f19db9de146cb6567584c4c3471a2e2bb74d');
        }, (e) => {
            console.log(e);
            message.error('Bad format for password entered');
        });


    }

    handleCancel() {
        this.setState({
            modalOpenCreate: false,
            modalOpenSend: false,
            modalOpenImport: false,
        });
        this.form = null;
    }

    handleReload() {
        this.state.wallets.forEach(w => w.update());
    }




    render() {

        const openSendModal = (event, record) => {
            event.stopPropagation();
            this.setState({
                sourceWallet: record,
                modalOpenSend: true,
            });
        };

        const onDeleteRow = (event, record) => {
            event.stopPropagation();
            this.setState({
                wallets: this.state.wallets.filter(w => w !== record)
            });
            record.erase();

        };

        const onAddressClick = (event, record) => {
            clipboard.writeText(record.address);
            message.success('Adress copied to the clipboard');
        };


        const columns = [
            { title: 'Name', dataIndex: 'name', key: 'name' },
            { title: 'Address', key: 'address', render: (r) => {
                return (
                        <span tabIndex={0}
                              role="button"
                              style={{ cursor: 'copy' }}
                              onClick={e => onAddressClick(e, r)}>{r.address}</span>
                    );
                }
            },
            { title: 'Coins', dataIndex: 'coins', key: 'coins' },
            { title: 'Send', key: 'send', render: (r) => {
                return (
                        <Button disabled={this.fees > 0} onClick={e => openSendModal(e, r)} icon="login" />
                    );
                }
            },
            { title: 'Action', key: 'action', render: (r) => {
                return (
                        <Popconfirm title="Sure to delete?"
                                    onConfirm={e => onDeleteRow(e, r)}>
                            <a>Delete</a>
                        </Popconfirm>
                    );
                }
            },
        ];

        return (
            <div className="Wallets">
                <div style={{ marginBottom: '12px' }}>
                    <Button
                      type="primary"
                      icon="down-square-o"
                      onClick={() => this.setState({ modalOpenImport: true, })}>Import
                    </Button>
                    <Button
                      type="primary"
                      icon="plus-circle-o"
                      style={{ marginLeft: '8px' }}
                      onClick={() => this.setState({ modalOpenCreate: true, })}>Create
                    </Button>
                    <Button type="primary"
                            shape="circle"
                            icon="reload"
                            style={{ marginLeft: '8px' }}
                            onClick={this.handleReload} />
                </div>
                <Modal
                  title="Create a New Wallet"
                  visible={this.state.modalOpenCreate}
                  okText="Create"
                  onCancel={this.handleCancel}
                  onOk={this.handleCreate}>
                    <CreateForm
                        ref={form => (this.form = form)}
                        handleCreate={this.handleCreate} />
                </Modal>

                <Modal
                    title="Import Wallet"
                    visible={this.state.modalOpenImport}
                    okText="Import"
                    onCancel={this.handleCancel}
                    onOk={this.handleImport}>
                    <ImportForm
                        ref={form => (this.form = form)}
                        handleImport={this.handleImport} />
                </Modal>


                <Table columns={columns}
                       dataSource={this.state.wallets}
                       pagination={false}
                       style={{ height: '250px', backgroundColor: 'white' }} />

                <Modal
                    title="Send Money"
                    visible={this.state.modalOpenSend}
                    okText="Send"
                    onCancel={this.handleCancel}
                    confirmLoading={this.state.sendingPayment}
                    onOk={this.handleSendit}>
                    <CreateTransaction
                        ref={form => (this.form = form)}
                        sender={this.state.sourceWallet}
                        fees={this.fee}
                        rate={1.0 / this.state.price} />
                </Modal>

                <div style={{ marginTop: '24px' }}>
                    <h3>Total: {`${formatAmount(this.state.total * this.state.price)}` }</h3>
                    <span>{`(at ${formatAmount(0.01)} per BGL)`}</span>
                </div>
            </div>
        );
    }
}

export default WalletsContent;
