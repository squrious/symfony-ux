import Component from '../index';
import { PluginInterface } from './PluginInterface';
export default class implements PluginInterface {
    private mapping;
    constructor(mapping: {
        [p: string]: any;
    });
    attachToComponent(component: Component): void;
    private updateUrl;
}
