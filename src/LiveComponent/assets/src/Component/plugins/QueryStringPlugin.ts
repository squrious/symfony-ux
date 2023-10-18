import Component from '../index';
import { PluginInterface } from './PluginInterface';
import {
    setQueryParam, removeQueryParam,
} from '../../url_utils';

type QueryMapping  = {
    name: string,
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

        const mapping = JSON.parse(rawQueryMapping) as {[p: string]: QueryMapping};

        Object.entries(mapping).forEach(([key, config]) => {
            this.mapping.set(key, config);
        })
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
