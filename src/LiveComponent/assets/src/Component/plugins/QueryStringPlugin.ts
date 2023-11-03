import Component from '../index';
import { PluginInterface } from './PluginInterface';
import { UrlUtils, HistoryStrategy } from '../../url_utils';

interface QueryMapping {
    /**
     * URL parameter name
     */
    name: string,
}

/**
 * Tracks initial state and prop query mapping.
 */
class Tracker {
    readonly mapping: QueryMapping;
    private readonly initialValue: any;
    readonly initiallyPresentInUrl: boolean;

    constructor(mapping: QueryMapping, initialValue: any, initiallyPresentInUrl: boolean) {
        this.mapping = mapping;
        this.initialValue = JSON.stringify(initialValue);
        this.initiallyPresentInUrl = initiallyPresentInUrl;
    }
    hasReturnedToInitialValue(currentValue: any)  {
        return JSON.stringify(currentValue) === this.initialValue;
    }
}

export default class implements PluginInterface {
    private trackers = new Map<string,Tracker>;

    constructor(private readonly mapping: {[p: string]: QueryMapping}) {
    }

    attachToComponent(component: Component): void {
        component.on('connect', (component: Component) => {
            const urlUtils = new UrlUtils(window.location.href);
            Object.entries(this.mapping).forEach(([prop, mapping]) => {
                const tracker = new Tracker(mapping, component.valueStore.get(prop), urlUtils.has(prop));
                this.trackers.set(prop, tracker);
            });
        });

        component.on('render:finished', (component: Component) => {
            const urlUtils = new UrlUtils(window.location.href);
            this.trackers.forEach((tracker, prop) => {
                const value = component.valueStore.get(prop);
                if (!tracker.initiallyPresentInUrl && tracker.hasReturnedToInitialValue(value)) {
                    urlUtils.remove(tracker.mapping.name);
                } else {
                    urlUtils.set(tracker.mapping.name, value);
                }
            });

            HistoryStrategy.replace(urlUtils);
        });
    }
}
