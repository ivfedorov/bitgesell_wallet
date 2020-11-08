import React from 'react';
import Datastore from 'nedb';

import { Button, Icon, Table, Modal, message } from 'antd';

import TransactionDisplay from './transaction.display';
import Wallet from './logic/wallet.class';
import net from './logic/network';

class PaymentsContent extends React.Component {

    constructor(props) {
        super(props);

        //this.db = new Datastore({ filename: './db/wallets.db', autoload: true });
    }
/*
    componentDidMount() {

        Wallet.all().then((wallets) => {

            this.wallets = wallets;

            net.api.getTransactions(wallets.map(w => w.address)).then((txs) => {
                console.log(txs);
                this.transactions = txs;
            });
        });
    }


    set transactions(txs) {

        this._transactions = txs;

        const addressToWallet = {};
        this.wallets.forEach((w) => {
            addressToWallet[w.address] = w;
        });

        const payments = [];

        // transactions come in the order of the addresses passed
        txs.forEach((tx, i) => {

            const wallet = this.wallets[i];

            console.log(tx);

            tx.out.forEach((out, j) => {

                payments.push({
                    key: `${i}/${j}`,
                    name: wallet ? wallet.name : out.addr,
                    address: out.addr,
                    inflow: wallet !== undefined,
                    time: new Date(tx.time * 1000).toDateString(),
                    coins: out.value / 100000000,
                    hash: tx.hash,
                });
            });
        });

        this.setState({
            payments: payments
        });
    }

    get transactions() {
        if (!this._transactions) this._transactions = [];
        return this._transactions;
    }
*/


    render() {
        const dataSource = [
            {
                key: '1',
                recipient: 'bgl1qq8f657xy7q2mrgzcrhq7qujxhazqakk8npuw05',
                amount: 49.880,
                txhash: 'a23ba8030421f2f6f3f7b4f3ab70f19db9de146cb6567584c4c3471a2e2bb74d',
                confirmations: 0,
            },
        ];

        const columns = [
            {
                title: 'Recipient',
                dataIndex: 'recipient',
                key: 'recipient',
            },
            {
                title: 'Amount',
                dataIndex: 'amount',
                key: 'amount',
            },
            {
                title: 'TxHash',
                dataIndex: 'txhash',
                key: 'txhash',
            },
            {
                title: 'Confirmations',
                dataIndex: 'confirmations',
                key: 'confirmations',
            },
        ];



        return (
            <div>
                <Table dataSource={dataSource} columns={columns} style={{ height: '250px', backgroundColor: 'white' }} pagination={false}/>
            </div>
        );
    }
}

export default PaymentsContent;
