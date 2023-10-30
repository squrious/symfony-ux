import Component from '../index';
import { PluginInterface } from './PluginInterface';
import {
    setQueryParam, removeQueryParam,
} from '../../url_utils';

type QueryMapping  = {
    name: string,
}

export default class implements PluginInterface {
    private mapping: Map<string,QueryMapping> = new Map;

    constructor(mapping: {[p: string]: any}) {
        Object.entries(mapping).forEach(([key, config]) => {
            this.mapping.set(key, config);
        })
    }

    attachToComponent(component: Component): void {
        component.on('connect', (component: Component) => {
            this.updateUrl(component);
        });

        component.on('render:finished', (component: Component)=> {
            this.updateUrl(component);
        });
    }

    private updateUrl(component: Component){
        this.mapping.forEach((mapping, propName) => {
            const value = component.valueStore.get(propName);
            if (value === '' || value === null || value === undefined) {
                removeQueryParam(mapping.name);
            } else {
                setQueryParam(mapping.name, value);
            }

        });
    }
}
