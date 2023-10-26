import Component from '../index';
import { PluginInterface } from './PluginInterface';
export default class implements PluginInterface {
    private mapping;
    private initialPropsValues;
    private changedProps;
    constructor(mapping: {
        [p: string]: any;
    });
    attachToComponent(component: Component): void;
    private updateUrlParam;
    private getParamFromModel;
    private getNormalizedPropNames;
    private isValueEmpty;
    private isObjectValue;
}
