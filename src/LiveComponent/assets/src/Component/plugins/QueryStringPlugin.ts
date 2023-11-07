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
                urlUtils.set(mapping.name, component.valueStore.get(prop));
            });

            // Only update URL if it has changed
            if (currentUrl !== urlUtils.toString()) {
                HistoryStrategy.replace(urlUtils);
            }
        });
    }
}
