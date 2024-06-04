
import React, { useEffect, useRef, useState } from 'react';
import { ethers, Wallet } from 'ethers';
import { WebView } from 'react-native-webview';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import m from './app/js/ethMethods';


const rpc1 = 'https://bsc-dataseed.binance.org'
const rpc2 = 'https://www.kortho-chain.com'
const rpc3 = 'https://bsc-dataseed4.ninicoin.io'
const rpc4 = 'https://bsc-testnet-dataseed.bnbchain.org'
const privateKey = "0x0d18549db0de808a0ca85e68769ee05e78ee262b07a4bfd32dd8a9044ba8d7d8";

const App = () => {

    const [timInitTxt, setTimInitTxt] = useState('');
    const [LoginTxt, setLoginTxt] = useState('');
    const webViewRef: any = useRef(null);
    const webviewRef: any = useRef(null);

    const [provider, setProvider] = useState(new ethers.providers.JsonRpcProvider(rpc4));
    const [wallet, setWallet] = useState(new ethers.Wallet(privateKey, provider));
    const [signer, setSigner] = useState(wallet.connect(provider));

    const injectedJavaScript = `
  if (!window.ethereum) {
    window.ethereum = {
        isMetaMask: true,
        chainId: "0x61",
        networkVersion:"97",
        isConnected: () => true,
        selectedAddress:'0xab06034e1047539FC18f6118d6Bc24d411B5091a',
        enable: async () => {
            return new Promise((resolve, reject) => {
                window.ethereum._resolve =  resolve([window.ethereum.selectedAddress]); 
            }); 
        },
        request: async ({ method, params }) => {
            console.log('request---', method, params)
            window.ReactNativeWebView.postMessage(JSON.stringify({ method, params }));
            return new Promise((resolve, reject) => {
                window.ethereum._resolve = resolve;
                window.ethereum._reject = reject;
            });
        },
        send: async ({ method, params }) => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ method, params }));
            return new Promise((resolve, reject) => {
                window.ethereum._resolve = resolve;
                window.ethereum._reject = reject;
            });
        },
        _sendSync: async({ method, params }) => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ method, params }));
            return new Promise((resolve, reject) => {
                window.ethereum._resolve = resolve;
                window.ethereum._reject = reject;
            });
        },
        sendAsync: async({ method, params }) => {
            window.ReactNativeWebView.postMessage(JSON.stringify({ method, params }));
            return new Promise((resolve, reject) => {
                window.ethereum._resolve = resolve;
                window.ethereum._reject = reject;
            });
        },
        _resolve: null,
        _reject: null,
        on: (eventName, callback) => {
            // 实际上这里不会触发事件，这只是示意如何设置监听器
        },
    };
  }
  // 监听来自React Native的消息，并处理结果
  document.addEventListener('message', function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'resolve') {
      window.ethereum._resolve(data.response);
    } else if (data.type === 'reject') {
      window.ethereum._reject(data.error);
    }
  });
`;


    const creatWallet = async () => {
        let privateKey = "0x0d18549db0de808a0ca85e68769ee05e78ee262b07a4bfd32dd8a9044ba8d7d8";
        let wallet: any = new ethers.Wallet(privateKey, provider);
        // console.log(wallet)
        setTimInitTxt(wallet.address)
    }
    useEffect(() => {
        creatWallet()
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
    const signMessage = async (params: any) => {
        let privateKey = "0x0d18549db0de808a0ca85e68769ee05e78ee262b07a4bfd32dd8a9044ba8d7d8";
        const wallet = new ethers.Wallet(privateKey);
        const message = ethers.utils.toUtf8String(params[0]);
        const signature = await wallet.signMessage(message);
        setWebviewmsg(signature)
        console.log("签名的消息:", signature);
    }
    // eth_getBlockByNumber
    const getBlockNum = async (params: any) => {
        const block = await provider.getBlock('latest');
        // console.log('block', block)
        setWebviewmsg(0)
    }
    // eth_gasPrice
    const ethGasPrice = async () => {
        const gasPrice = await provider.getGasPrice();
        const gasPriceHex = ethers.utils.hexlify(gasPrice);
        console.log('gasPrice', gasPriceHex, gasPrice)
        setWebviewmsg(gasPrice)
    }
    const _eth_chainId = async () => {
        const network = await provider.getNetwork();
        setWebviewmsg(ethers.utils.hexValue(network.chainId))
    }
    const _estimateGas = async (params: any) => {
        const gasEstimate = await provider.estimateGas(params);
        setWebviewmsg(ethers.utils.hexlify(gasEstimate))
    }
    const _eth_getBalance = async (params: any) => {
        const balance = await provider.getBalance(params[0]);
        // console.log('balance', balance)
        setWebviewmsg(ethers.utils.hexlify(balance))
    }
    const _wallet_switchEthereumChain = async (params: any) => {
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
    const ethCall = async (params: any) => {
        // console.log('---ethCall', params)
        const res = await provider.call(params[0]);
        console.log('ethCall-----', res)
        setWebviewmsg(res)
    }
    //_sendTransaction
    const _sendTransaction = async (params: any) => {
        const { from, to, data } = params[0];
        const transaction = {
            from, // ethers.js 通常不需要 from 字段，因为钱包知道你是从哪个账户发送的
            to,
            data,
            // 需要动态计算或者指定 gasLimit 和 gasPrice
            gasLimit: ethers.utils.hexlify(100000), // 举例，需要根据实际情况调整
            gasPrice: await provider.getGasPrice(), // 或者使用固定的 gasPrice
        };

        try {
            const txResponse: any = await wallet.sendTransaction(transaction);
            console.log('Transaction successful1:', txResponse.hash);
            setWebviewmsg(txResponse.hash)
            // postMessageToDapp('resolve', txResponse.transactionHash)
            const txReceipt: any = await txResponse.wait(); // 等待交易确认
            console.log('Transaction successful2:', txReceipt);
        } catch (error) {
            console.log('Transaction failed:', error);
            postMessageToDappError('error失败了')
            // postMessageToDapp('reject', error)
        }
    }
    const onMessage = (event: any) => {
        console.log(event.nativeEvent.data);
        // console.log(JSON.parse(event.nativeEvent.data));
        const { method, params } = JSON.parse(event.nativeEvent.data);
        // console.log(method,m)
        const index = m.findIndex((item: any) => item == method);
        console.log('method-index', index)
        switch (method) {
            case 'eth_requestAccounts':
                setWebviewmsg([timInitTxt])
                break;
            case 'eth_accounts':
                setWebviewmsg([timInitTxt])
                break;
            case 'personal_sign':
                signMessage(params)
                break;
            case 'eth_getBlockByNumber':
                getBlockNum(params)
                break;
            case 'eth_gasPrice':
                ethGasPrice()
                break;
            case 'eth_sendTransaction':
                _sendTransaction(params)
                // Alert.alert('eth_sendTransaction');
                break;
            case 'eth_estimateGas':
                _estimateGas(params)
                break
            case 'eth_chainId':
                _eth_chainId();
                break
            case 'wallet_switchEthereumChain':
                _wallet_switchEthereumChain(params)
                break
            case 'eth_getBalance':
                _eth_getBalance(params)
                break
            case 'eth_call':
                ethCall(params)
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
                <View style={{ flex: 1, backgroundColor: 'red', height: 600 }}>
                    {/* http://192.168.31.113:8080/#/ https://noskto.web3s.finance/#/demo*/}
                    <WebView
                        source={{ uri: 'http://192.168.31.113:8080' }}
                        style={{ height: '100%', width: '100%' }}
                        ref={webViewRef}
                        onMessage={onMessage}
                        // injectedJavaScript={injectedJavaScript}
                        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
                        javaScriptEnabled={true}
                    />
                    
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
