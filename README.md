# study-dev-wallet

2023年8月25日 #81 Bitcoinウォレット開発入門ハンズオン【ビットコインとか勉強会】で使用するソースコードです。

https://cryptocurrency.connpass.com/event/293743/

2023年9月22日にも #82 Bitcoinウォレット開発入門ハンズオン《続き》【ビットコインとか勉強会】オンライン を行いました。

https://cryptocurrency.connpass.com/event/295495/

↓以前同様のハンズオンを行った際の資料です。

https://qiita.com/shu-kob/items/380e26eaee025edd6fcb

こちらをベースに行いますが、前回資料記載のソースコードは最新のライブラリを使うと動きません。

こちらのソースコードをお使いください。

# 以下、昨年のハンズオンとの差分

## Bitcoin CoreをSignetで立ち上げ

ビルドと同期に時間がかかるため、最初にこちらから実施

ビルドの時間節約のため、ウォレットはなし

```
git clone https://github.com/shu-kob/study-dev-wallet

cd study-dev-wallet/bitcoin-core-docker

./build.sh v25.0

docker-compose up
```

別ターミナルで

```
alias bcli="docker exec bitcoin-core bitcoin-cli -rpcport=38332 -rpcuser=satoshi -rpcpassword=hoge"

bcli getblockchaininfo
```

下記、エクスプローラと比較して最新のブロックまで同期できていることを確認

## Signetのブロックチェーンエクスプローラ

- https://mempool.space/signet
  - 音が鳴ります。ご注意ください。
- https://ex.signet.bublina.eu.org/

## アドレス生成

```
cd study-dev-wallet

npm install
```


## Faucetからテストコインを調達

同期を待つ間、FaucetからSignet BTCを調達

- https://signet.bc-2.jp/
- https://alt.signetfaucet.com/
 
## 送金

```
alias bcli="docker exec bitcoin-core bitcoin-cli -rpcport=38332 -rpcuser=satoshi -rpcpassword=hoge"

bcli sendrawtransaction <rawtx>
```

## 手数料計算

- 手数料計算に便利なWebサイト
  - https://jlopp.github.io/bitcoin-transaction-size-calculator/
