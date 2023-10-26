import Component from '../index';
import { PluginInterface } from './PluginInterface';
import {
    setQueryParam, removeQueryParam,
} from '../../url_utils';

type QueryMapping  = {
    name: string,
}

export default class implements PluginInterface {
    private mapping = new Map<string,QueryMapping>;
    private initialPropsValues  = new Map<string, any>;
    private changedProps: {[p: string]: boolean} = {};

    constructor(mapping: {[p: string]: any}) {
        Object.entries(mapping).forEach(([key, config]) => {
            this.mapping.set(key, config);
        })
    }

    attachToComponent(component: Component): void {
        component.on('connect', (component: Component) => {
            // Store initial values of mapped props
            for (const model of this.mapping.keys()) {
                for (const prop of this.getNormalizedPropNames(component.valueStore.get(model), model)) {
                    this.initialPropsValues.set(prop, component.valueStore.get(prop));
                }
            }
        });

        component.on('render:finished', (component: Component) => {
            this.initialPropsValues.forEach((initialValue, prop) => {
                const value = component.valueStore.get(prop);

                // Only update the URL if the prop has changed
                this.changedProps[prop] ||= JSON.stringify(value) !== JSON.stringify(initialValue);
                if (this.changedProps) {
                    this.updateUrlParam(prop, value);
                }
            });
        });
    }

    private updateUrlParam(model: string, value: any)
    {
        const paramName = this.getParamFromModel(model);

        if (paramName === undefined) {
            return;
        }

        this.isValueEmpty(value)
            ? removeQueryParam(paramName)
            : setQueryParam(paramName, value);
    }

    /**
     * Convert a normalized property path (foo.bar) in brace notation (foo[bar]).
     */
    private getParamFromModel(model: string)
    {
        const modelParts = model.split('.');
        const rootPropMapping = this.mapping.get(modelParts[0]);

        if (rootPropMapping === undefined) {
            return undefined;
        }

        return rootPropMapping.name + modelParts.slice(1).map((v) => `[${v}]`).join('');
    }

    /**
     * Get property names for the given value in the "foo.bar" format:
     *
     * getNormalizedPropNames({'foo': ..., 'baz': ...}, 'prop') yields 'prop.foo', 'prop.baz', etc.
     *
     * Non-object values will yield the propertyPath without any change.
     */
    private *getNormalizedPropNames(value: any, propertyPath: string): Generator<string>
    {
        if (this.isObjectValue(value)) {
            for (const key in value) {
                yield* this.getNormalizedPropNames(value[key], `${propertyPath}.${key}`)
            }
        } else {
            yield propertyPath;
        }
    }

    private isValueEmpty(value: any)
    {
        return (value === '' || value === null || value === undefined);
    }

    private isObjectValue(value: any): boolean
    {
        return !(Array.isArray(value) || value === null || typeof value !== 'object');
    }
}
