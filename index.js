/**
 * @format
 */


import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

if (!process.nextTick) {
    process.nextTick = (callback) => setTimeout(callback, 0);
}

AppRegistry.registerComponent(appName, () => App);
