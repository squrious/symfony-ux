import Component from '../index';
import { PluginInterface } from './PluginInterface';
import { UrlUtils, HistoryStrategy } from '../../url_utils';

interface QueryMapping {
    /**
     * URL parameter name.
     */
    name: string,

    /**
     * Whether to always show the parameter in the URL.
     */
    keep: boolean;

    /**
     * Whether to push a new history state instead of updating the URL in-place.
     */
    history: boolean;
}

/**
 * Handles bindings between the data store and the URL query parameters.
 */
export default class implements PluginInterface {
    constructor(private readonly mapping: {[p: string]: QueryMapping}) {
        const defaults = {keep: false, history: false};
        Object.entries(mapping).forEach(([prop, mapping]) => {
           this.mapping[prop] = {...defaults, ...mapping};
        });
    }

    attachToComponent(component: Component): void {
        if (Object.keys(this.mapping).length === 0) {
            return;
        }

        component.on('connect', (component: Component) => {
            // Configure popstate handler for history navigation
            const cleanPop = this.configurePopStateHandler(component);

            component.on('disconnect', () => {
                cleanPop();
            });

            const urlUtils = new UrlUtils(window.location.href);

            // Initialize URL for mapping with keep option
            Object.entries(this.mapping).forEach(([prop, mapping]) => {
                if (mapping.keep && !urlUtils.has(mapping.name)) {
                    urlUtils.set(mapping.name, component.getData(prop));
                }
            });

            this.updateUrl(urlUtils);
        });

        // After each render, update the URL with new props values
        component.on('render:finished', (component: Component) => {
            const urlUtils = new UrlUtils(window.location.href);

            let shouldPush = false;
            Object.entries(this.mapping).forEach(([prop, mapping]) => {
                const value = component.getData(prop);
                let urlParamChanged = false;

                if (!mapping.keep && this.isEmpty(value)) {
                    if (urlUtils.has(mapping.name)) {
                        urlParamChanged = true;
                        urlUtils.remove(mapping.name);
                    }
                } else {
                    if (!urlUtils.has(mapping.name) || urlUtils.has(mapping.name) && JSON.stringify(urlUtils.get(mapping.name)) !== JSON.stringify(value)) {
                        urlParamChanged = true;
                    }
                    urlUtils.set(mapping.name, value);
                }
                shouldPush ||= mapping.history && urlParamChanged;
            });

            this.updateUrl(urlUtils, shouldPush);
        });
    }

    /**
     * Check if a variable is empty or a deeply empty object.
     */
    private isEmpty(value: any): boolean {
        if (null === value || value === '' || value === undefined || Array.isArray(value) && value.length === 0) {
            return true;
        }

        if (typeof value !== 'object') {
            // Not null, nor empty string or empty array, and not object, so assume it's a non-empty scalar
            return false;
        }

        // Deep check for empty object
        for (let key of Object.keys(value)) {
            if (!this.isEmpty(value[key])) {
                return false;
            }
        }

        return true;
    }

    /**
     * Configure the handler to update props from query parameters on Window.popstate events.
     *
     * This is how we handle the "back" browser button without a real page load.
     *
     * @return A cleanup function to remove the handler
     */
    private configurePopStateHandler(component: Component): () => void {
        const handler = async (e: PopStateEvent) => {
            const urlUtils = new UrlUtils(window.location.href);

            Object.entries(this.mapping).forEach(([prop, mapping]) => {
                if (urlUtils.has(mapping.name)) {
                    const value = urlUtils.get(mapping.name);
                    for (let [p, v] of this.expandQueryParameter(prop, value)) {
                        component.valueStore.set(p, v);
                    }
                } else {
                    const value = component.valueStore.get(prop);
                    for (let [p] of this.expandQueryParameter(prop, value)) {
                        if (component.valueStore.has(p)) {
                            component.valueStore.set(p, null);
                        }
                    }
                }
            });

            await component.render();
        }

        window.addEventListener('popstate', handler);
        return () => window.removeEventListener('popstate', handler);
    }

    private updateUrl(url: URL, push = false): void {
        if (window.location.href !== url.toString()) {
            const strategy = push ? 'push' : 'replace';
            HistoryStrategy[strategy](url);
        }
    }

    /**
     * Expand data to dot notation.
     *
     * expandQueryParameter('prop', {'foo': ..., 'baz': ...}) yields ['prop.foo', ...], ['prop.baz', ...], etc.
     *
     * Non-object values will yield the propertyPath and value without any change.
     */
    private *expandQueryParameter(propertyPath: string, value: any): Generator<[string,any]> {
        if (null !== value && typeof value === 'object' && !Array.isArray(value)) {
            for (const key in value) {
                yield* this.expandQueryParameter( `${propertyPath}.${key}`, value[key])
            }
        } else {
            yield [propertyPath, value];
        }
    }
}
