# Bitgesell_wallet

# Run wallet
```
npm install 
npm start 
```

# Run pybgl 
```
python3 python/pybgl_interface.py
```

# Create wallet (using pybgl)
```
wallet = pybgl.Wallet(None, passphrase=password, path_type="BIP84")
address = wallet.get_address(19)["address"]
wif = wallet.get_address(19)["private_key"]
mnemonic = wallet.mnemonic
seed = wallet.seed
```

# Import wallet (using pybgl)
```
address=pybgl.Address(wif)
```

# Create & send transaction (using pybgl)
```
url = "http://****:8332/"
payload = json.dumps({"method": 'getblockchaininfo', "params": []})
response = requests.request("POST", url, data=payload, headers=headers, auth=('bgluser', 'bglpassword'))
blocknumber = json.loads(response.text)
tx = pybgl.Transaction(version=2, lock_time=int(blocknumber['result']['blocks'])+1)
tx.add_input(tx_hash, 0, address=sender)
tx.add_output(int(bgl_amount * 100000000), recipient)
tx.sign_input(0, private_key=wif,
                 sighash_type=SIGHASH_ALL,
                 amount=int((bgl_amount + 0.005)*100000000))
payload = json.dumps({"method": 'sendrawtransaction', "params": [tx.serialize()]})
response = requests.request("POST", url, data=payload, headers=headers, auth=('bgluser', 'bglpassword'))
```

# Get utxo (using pybgl)
```
url = "http://****:8332/"
headers = {'content-type': "application/json"}
payload = json.dumps({"method": 'scantxoutset', "params": ['start', ['addr(bgl1qq8f657xy7q2mrgzcrhq7qujxhazqakk8npuw05)']]})
response = requests.request("POST", url, data=payload, headers=headers, auth=('bgluser', 'bglpassword'))
```
