import Component from '../index';
import { PluginInterface } from './PluginInterface';
import {
    setQueryParam, removeQueryParam,
} from '../../url_utils';

type QueryMapping  = {
    name: string,
    keep: boolean,
}

export default class implements PluginInterface {
    private element: Element;
    private mapping: Map<string,QueryMapping> = new Map;

    attachToComponent(component: Component): void {
        this.element = component.element;
        this.registerBindings();

        component.on('connect', (component: Component) => {
            this.updateUrl(component);
        });

        component.on('render:finished', (component: Component)=> {
            this.updateUrl(component);
        });
    }

    private registerBindings(): void {
        const rawQueryMapping = (this.element as HTMLElement).dataset.liveQueryMapping;
        if (rawQueryMapping === undefined) {
            return;
        }
        const mapping = JSON.parse(rawQueryMapping) as Object;
        const defaults = {keep: false} as QueryMapping;
        Object.entries(mapping).forEach(([key, value]) => {
            const config = {...defaults, name: value} as QueryMapping;
            this.mapping.set(key, config);
        })
    }

    private updateUrl(component: Component){
        this.mapping.forEach((mapping, propName) => {
            const value = component.valueStore.get(propName);
            if (value === '' || value === null || value === undefined) {
                mapping.keep
                    ? setQueryParam(mapping.name, '')
                    : removeQueryParam(mapping.name);
            } else {
                setQueryParam(mapping.name, value);
            }

        });
    }
}
