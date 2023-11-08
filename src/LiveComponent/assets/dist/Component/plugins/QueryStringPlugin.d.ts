import Component from '../index';
import { PluginInterface } from './PluginInterface';
interface QueryMapping {
    name: string;
    keep: boolean;
}
export default class implements PluginInterface {
    private readonly mapping;
    constructor(mapping: {
        [p: string]: QueryMapping;
    });
    attachToComponent(component: Component): void;
    private isEmpty;
}
export {};
