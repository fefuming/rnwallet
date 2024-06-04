
import React, { useEffect, useRef, useState } from 'react';
import { constants, ethers, Wallet } from 'ethers';
import { WebView } from 'react-native-webview';
import {
    Alert,
    PermissionsAndroid,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';


const rpc1 = 'https://bsc-dataseed.binance.org'
const rpc2 = 'https://www.kortho-chain.com'
const rpc3 = 'https://bsc-dataseed4.ninicoin.io'
const rpc4 = 'https://data-seed-prebsc-2-s3.bnbchain.org:8545'//'https://bsc-testnet-dataseed.bnbchain.org'
const privateKey = "0x0d18549db0de808a0ca85e68769ee05e78ee262b07a4bfd32dd8a9044ba8d7d8";

var webViewKey = 1
const App = () => {

    const [timInitTxt, setTimInitTxt] = useState('');
    const [LoginTxt, setLoginTxt] = useState('');
    const webViewRef: any = useRef(null);

    const [provider, setProvider] = useState(new ethers.providers.JsonRpcProvider(rpc4));
    const [wallet, setWallet] = useState(new ethers.Wallet(privateKey, provider));
    const [signer, setSigner] = useState(wallet.connect(provider));
    const [injectedweb3, setInjectedweb3] = useState('');

    const downloadWeb3 = async () => {
        // 初始化 provider
        // 获取远程 JS 文件内容
        // const {data,status} = await axios.get('http://share.notes.bet/providerjs/index.js');
        // if(status==200){}
        // return
        fetch('http://share.notes.bet/providerjs/index.js')
            .then(response => response.text())
            .then(script => {
                if (webViewRef.current) {
                    console.log('----------------------script')
                    const injectScript = `
                    window.addEventListener('message', async (event) => {
                        console.log('我监听message',event.data.data.data.method);
                        if (event.data.data.data.method == 'metamask_getProviderState') {
                          try {
                            console.log('我开始执行方法');
                            const provider = window.ethereum;
                            if (provider) {
                                console.log('我走了可以执行',provider);
                              const accounts = await provider.request({ method: 'eth_accounts' });
                              console.log('我开始获取钱包',accounts)
                              const networkId = await provider.request({ method: 'net_version' });
                              console.log('我开始获取ID',networkId)
                              const isUnlocked = accounts.length > 0;
                
                              const state = {
                                accounts: accounts,
                                networkId: networkId,
                                isUnlocked: isUnlocked
                              };
                              console.log('我要查看window.ethereum',window.ethereum)
                              window.postMessage({
                                type: 'metamask_providerState',
                                data: JSON.stringify(state)
                              }, '*');
                            }
                          } catch (error) {
                            console.error('Error fetching provider state:', error);
                          }
                        }
                      });
                    (function() {
                        ${script};
                    })();
                    `;

                    setInjectedweb3(injectScript)
                    webViewRef.current.injectJavaScript(injectScript);
                }
            })
            .catch(error => console.error('Failed to load remote script:', error));
    }

    const onLoadStart = async () => {
        // setTimeout(() => {
        //     webViewRef.current.reload();
        // }, 500);

        // downloadWeb3()
        // const injectScript = `
        //             (function() {
        //                 window.ethereum = ${provider}
        //             })();
        //             `;
        // setInjectedweb3(injectScript)
        // webViewRef.current.injectJavaScript(injectScript);
    };

    const creatWallet = async () => {
        let privateKey = "0x0d18549db0de808a0ca85e68769ee05e78ee262b07a4bfd32dd8a9044ba8d7d8";
        let wallet: any = new ethers.Wallet(privateKey, provider);
        // console.log(wallet)
        setTimInitTxt(wallet.address)
    }
    useEffect(() => {
        downloadWeb3()
        creatWallet()
        setTimeout(() => {
            const d = { "id": 1219789564, "jsonrpc": "2.0", "method": "eth_signTypedData_v4", "params": ["0xab06034e1047539FC18f6118d6Bc24d411B5091a", "{\"domain\":{\"name\":\"Permit2\",\"chainId\":97,\"verifyingContract\":\"0x31c2f6fcff4f8759b3bd5bf0e1084a055615c768\"},\"message\":{\"details\":{\"token\":\"0x8d008B313C1d6C7fE2982F62d32Da7507cF43551\",\"amount\":\"1461501637330902918203684832716283019655932542975\",\"expiration\":\"1720001971\",\"nonce\":\"0\"},\"spender\":\"0xd77c2afebf3dc665af07588bf798bd938968c72e\",\"sigDeadline\":\"1717411771\"},\"primaryType\":\"PermitSingle\",\"types\":{\"EIP712Domain\":[{\"name\":\"name\",\"type\":\"string\"},{\"name\":\"chainId\",\"type\":\"uint256\"},{\"name\":\"verifyingContract\",\"type\":\"address\"}],\"PermitSingle\":[{\"name\":\"details\",\"type\":\"PermitDetails\"},{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"sigDeadline\",\"type\":\"uint256\"}],\"PermitDetails\":[{\"name\":\"token\",\"type\":\"address\"},{\"name\":\"amount\",\"type\":\"uint160\"},{\"name\":\"expiration\",\"type\":\"uint48\"},{\"name\":\"nonce\",\"type\":\"uint48\"}]}}"], "toNative": true }
            _eth_signTypedData_v4(d, d.params)
        }, 3000);

    }, [])
    // 钱包授权
    const setWebviewmsg = (result: any) => {
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({ type: 'resolve', response: result }));
        }
    }
    const postMessageToDappError = (result: any) => {
        if (webViewRef.current) {
            webViewRef.current.postMessage(JSON.stringify({ type: 'reject', error: result }));
        }
    }

    //签名
    const signMessage = async (request: any, params: any) => {
        let privateKey = "0x0d18549db0de808a0ca85e68769ee05e78ee262b07a4bfd32dd8a9044ba8d7d8";
        const wallet = new ethers.Wallet(privateKey);
        const message = ethers.utils.toUtf8String(params[0]);
        const signature = await wallet.signMessage(message);
        sendResponseToDApp(request, signature);
        // setWebviewmsg(signature)
        console.log("签名的消息:", signature);
    }
    const getBlockNum = async (request: any, params: any) => {
        const block = await provider.getBlock(params[0]);
        sendResponseToDApp(request, block);
    }
    // eth_gasPrice
    const ethGasPrice = async (request: any, params: any) => {
        const gasPrice = await provider.getGasPrice();
        // const gasPriceHex = ethers.utils.hexlify(gasPrice);
        // const gasPriceInGwei = ethers.utils.formatUnits(gasPrice, 'gwei');
        console.log('gasPrice', gasPrice)
        sendResponseToDApp(request, gasPrice);
        // setWebviewmsg(gasPrice.toString())
    }
    const _eth_chainId = async (request: any, params: any) => {
        const network = await provider.getNetwork();
        sendResponseToDApp(request, network.chainId);
        // setWebviewmsg(ethers.utils.hexValue(network.chainId))
    }
    const _estimateGas = async (request: any, params: any) => {
        const gasEstimate = await provider.estimateGas(params[0]);
        // sendResponseToDApp(request, gasEstimate);
        sendResponseToDApp(request, ethers.utils.hexlify(gasEstimate));
        console.log(ethers.utils.hexlify(gasEstimate))
        // setWebviewmsg(ethers.utils.hexlify(gasEstimate))
    }
    const _eth_getBalance = async (request: any, params: any) => {
        const balance = await provider.getBalance(params[0]);
        // console.log('balance', balance)
        const result = ethers.utils.hexlify(balance);
        sendResponseToDApp(request, result);
        // setWebviewmsg(ethers.utils.hexlify(balance))
    }
    const _wallet_switchEthereumChain = async (request: any, params: any) => {
        const newProvider = new ethers.providers.JsonRpcProvider(rpc3);
        const newWallet = new ethers.Wallet(privateKey, newProvider);
        const newSigner = newWallet.connect(newProvider);
        const block = await provider.getBlock('latest');
        console.log('block', block)
        setProvider(newProvider);
        setWallet(newWallet);
        setSigner(newSigner);
        const updatedInjectedJavaScript = `(function() {
            if (window.ethereum) {
              window.ethereum.chainId = '${params[0].chainId}';
            }
          })();`;
        webViewRef.current.injectJavaScript(updatedInjectedJavaScript);
        setWebviewmsg(null)
    }
    // eth_call
    const ethCall = async (request: any, params: any) => {
        // console.log('---ethCall', params)
        const result = await provider.call(params[0]);
        // console.log('ethCall-----', res)
        sendResponseToDApp(request, result);
    }
    const _sendTransaction = async (request: any, params: any) => {
        console.log('---------', params)
        const { from, to, data, value } = params[0];
        const transaction = {
            from, // ethers.js 通常不需要 from 字段，因为钱包知道你是从哪个账户发送的
            to,
            data,
            // 需要动态计算或者指定 gasLimit 和 gasPrice
            gasLimit: ethers.utils.hexlify(400000), // 举例，需要根据实际情况调整
            gasPrice: await provider.getGasPrice(), // 或者使用固定的 gasPrice
            value
        };

        // const tx={
        //     ...params[0],
        //     gas:params[0].gas*2
        // }

        try {
            const txResponse: any = await wallet.sendTransaction(transaction);
            console.log('Transaction successful1:', txResponse.hash);
            // setWebviewmsg(txResponse.hash)
            const result = txResponse.hash;
            sendResponseToDApp(request, result);
            // postMessageToDapp('resolve', txResponse.transactionHash)
            const txReceipt: any = await txResponse.wait(); // 等待交易确认
            console.log('Transaction successful2:', txReceipt);
            sendResponseToDApp(request, txReceipt);
        } catch (error) {
            console.log('Transaction failed:error失败了', error);
            postMessageToDappError('error失败了')
            // postMessageToDapp('reject', error)
        }
    }
    const _net_version = async (request: any, params: any) => {
        const network = await provider.getNetwork();
        sendResponseToDApp(request, network.chainId);
    }
    const _eth_getTransactionReceipt = async (request: any, params: any) => {
        const txReceipt = await provider.getTransactionReceipt(params[0]);
        console.log('txReceipt', txReceipt)
        sendResponseToDApp(request, txReceipt);
    }
    const getPostMessageFunctionBody = (data: any, result: any) => {
        // console.log('++++', data.data.method, data.data.id)

        return `
          try {
            window.postMessage({
              "target": "metamask-inpage",
              "data": {
                "name": "metamask-provider",
                "data": {
                  "jsonrpc": "2.0",
                  "id": ${data.data.id},
                  "result": ${JSON.stringify(result)}
                }
              }
            }, '*');
          } catch (e) {
            console.log('Error in evaluating javascript: ' + e);
          }
        `;
    }
    const sendResponseToDApp = async (data: any, result: any) => {
        const script = getPostMessageFunctionBody(data, result);
        webViewRef.current?.injectJavaScript(script);
    };
    const _eth_signTypedData_v4 = async (request: any, params: any) => {
        const param = JSON.parse(params[1]);
        console.log(param)
        const domain = param.domain;
        const types = param.types;
        const primaryType = param.primaryType;
        const message = param.message;
        try {
            const signerA = await provider.getSigner(params[0]);
            const signature = await signerA._signTypedData(param.domain, param.types, param.message);
            console.log('Signature:', signature);
        } catch (err) {
            console.log('++++',err)
        }

    }
    const metamask_getProviderState = async (request: any) => {
        const result = {
            isConnected: true,
            chainId: '0x61',
            networkVersion: "97",
            selectedAddress: '0xab06034e1047539FC18f6118d6Bc24d411B5091a',
            initialized: true,
            isUnlocked: true
        };
        // sendResponseToDApp(request, result);
    }
    const onMessage = (event: any) => {
        // console.log(event);
        // console.log(event.nativeEvent.data);
        // console.log(JSON.parse(event.nativeEvent.data));
        const data = JSON.parse(event.nativeEvent.data);
        const { method, params } = data.data
        console.log(data.data)
        console.log(method)


        // const index = m.findIndex((item: any) => item == method);
        // console.log('method-index', index)
        switch (method) {
            case 'metamask_getProviderState':
                console.log(webViewKey, '=====开始')
                if (webViewKey == 1) {
                    console.log(webViewKey, '=====结束')
                    webViewKey = 0
                    webViewRef.current.reload();
                }
                // metamask_getProviderState(data);
                break
            case 'eth_requestAccounts':
                const result = ['0xab06034e1047539FC18f6118d6Bc24d411B5091a'];
                sendResponseToDApp(data, result);
                break;
            case 'eth_accounts':
                sendResponseToDApp(data, ['0xab06034e1047539FC18f6118d6Bc24d411B5091a']);
                break;
            case 'personal_sign':
                signMessage(data, params)
                break;
            case 'eth_getBlockByNumber':
                getBlockNum(data, params)
                break;
            case 'eth_blockNumber':
                getBlockNum(data, params)
                break;
            case 'eth_gasPrice':
                ethGasPrice(data, params)
                break;
            case 'eth_sendTransaction':
                _sendTransaction(data, params)
                break;
            case 'eth_getTransactionReceipt':
                _eth_getTransactionReceipt(data, params)
                break;
            case 'eth_estimateGas':
                _estimateGas(data, params)
                break
            case 'eth_chainId':
                _eth_chainId(data, params);
                break
            case 'wallet_switchEthereumChain':
                _wallet_switchEthereumChain(data, params)
                break
            case 'eth_getBalance':
                _eth_getBalance(data, params)
                break;
            case 'net_version':
                _net_version(data, params)
                break;
            case 'eth_call':
                ethCall(data, params)
                break;

        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, flexDirection: 'column', }}>
                <View>
                    <Text >初始化：{timInitTxt}</Text>
                    <Text >登录res：{LoginTxt}</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: 'red', height: 600, width: '100%' }}>
                    {/* http://192.168.31.113:8080/#/ http://vote.test.notes.bet https://pancakeswap.finance/*/}
                    {
                        <WebView
                            source={{ uri: 'https://pancakeswap.finance' }}
                            style={{ height: '100%', width: '100%' }}
                            ref={webViewRef}
                            onLoadStart={onLoadStart}
                            onMessage={onMessage}
                            injectedJavaScriptBeforeContentLoaded={injectedweb3}
                            javaScriptEnabled={true}
                        />
                    }

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: '600',
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: '400',
    },
    highlight: {
        fontWeight: '700',
    },
});

export default App;
