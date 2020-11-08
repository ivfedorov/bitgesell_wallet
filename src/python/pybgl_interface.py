import pybgl
from flask import Flask, jsonify, request
from flask_cors import CORS, cross_origin
from pybgl import address_to_hash  as address2hash160
from pybgl import *
import requests
import json
app = Flask(__name__)

CORS(app)

@app.route('/')
def hello_world():
    return 'Hello World!'

@app.route('/create_wallet', methods=["GET"])
def create_wallet():
    password = request.args.get('pass')
    name = request.args.get('name')
    wallet = pybgl.Wallet(None, passphrase=password, path_type="BIP84")
    address = wallet.get_address(19)["address"]
    wif = wallet.get_address(19)["private_key"]
    json_data = []
    json_data.append({'name': name, 'seed': wallet.seed, 'mnemonic': wallet.mnemonic, 'address': address, 'wif': wif})
    return jsonify(json_data)

@app.route('/import_wallet', methods=["GET"])
def import_wallet():
    wif = request.args.get('wif')
    name = request.args.get('name')
    password = request.args.get('pass')
    address=pybgl.Address(wif)
    json_data = []
    json_data.append({'name': name, 'seed': 'hz', 'mnemonic': 'Import mnemonic does not show', 'address': address.address, 'wif': wif})
    return jsonify(json_data)

@app.route('/create_transaction', methods=["GET"])
def create_transaction():
    url = "http://178.154.224.220:8332/"
    headers = {'content-type': "text/plain"}
    recipient = request.args.get('recipient')
    sender = request.args.get('sender')
    bgl_amount = float(request.args.get('bgl'))
    wif = request.args.get('wif')
    tx_hash = request.args.get('tx_hash')
    payload = json.dumps({"method": 'getblockchaininfo', "params": []})
    response = requests.request("POST", url, data=payload, headers=headers, auth=('bgluser', 'bglpassword'))
    blocknumber = json.loads(response.text)
    print(int(blocknumber['result']['blocks'])+1)
    tx = pybgl.Transaction(version=2, lock_time=int(blocknumber['result']['blocks']))
    tx.add_input(tx_hash, 0, address=sender)
    tx.add_output(int(bgl_amount * 100000000), recipient)
    tx.sign_input(0, private_key=wif,
                  sighash_type=SIGHASH_ALL,
                  amount=int((bgl_amount + 0.005)*100000000))
    json_data = []
    json_data.append({'rtx': tx.serialize()})
    print(tx)
    payload = json.dumps({"method": 'sendrawtransaction', "params": [tx.serialize()]})
    response = requests.request("POST", url, data=payload, headers=headers, auth=('bgluser', 'bglpassword'))
    return json.loads(response.text)

@app.route('/get_transaction_info', methods=["GET"])
def get_transaction_info():
    tx_hash = request.args.get('tx_hash')
    url = "http://178.154.224.220:8332/"
    headers = {'content-type': "text/plain"}
    payload = json.dumps({"method": 'gettxout', "params": [tx_hash, 0]})
    response = requests.request("POST", url, data=payload, headers=headers, auth=('bgluser', 'bglpassword'))
    return json.loads(response.text)

@app.route('/get_utxo', methods=["GET"])
def get_utxo():
    addr = request.args.get('address')
    url = "http://178.154.224.220:8332/"
    headers = {'content-type': "application/json"}
    payload = json.dumps({"method": 'scantxoutset', "params": ['start', ['addr('+addr+')']]})
    response = requests.request("POST", url, data=payload, headers=headers, auth=('bgluser', 'bglpassword'))
    return json.loads(response.text)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
