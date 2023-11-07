import Component from '../index';
import { PluginInterface } from './PluginInterface';
import { UrlUtils, HistoryStrategy } from '../../url_utils';

interface QueryMapping {
    /**
     * URL parameter name
     */
    name: string,
}

export default class implements PluginInterface {
    constructor(private readonly mapping: {[p: string]: QueryMapping}) {}

    attachToComponent(component: Component): void {
        component.on('render:finished', (component: Component) => {
            const urlUtils = new UrlUtils(window.location.href);
            const currentUrl = urlUtils.toString();

            Object.entries(this.mapping).forEach(([prop, mapping]) => {
                const value = component.valueStore.get(prop);
                if (this.isEmpty(value)) {
                    urlUtils.remove(mapping.name);
                } else {
                    urlUtils.set(mapping.name, value);
                }
            });

            // Only update URL if it has changed
            if (currentUrl !== urlUtils.toString()) {
                HistoryStrategy.replace(urlUtils);
            }
        });
    }

    private isEmpty(value: any): boolean
    {
        if (null === value || value === '' || value === undefined || Array.isArray(value) && value.length === 0) {
            return true;
        }

        if (typeof value !== 'object') {
            return false;
        }

        for (let key of Object.keys(value)) {
            if (!this.isEmpty(value[key])) {
                return false;
            }
        }
        return true;
    }
}
