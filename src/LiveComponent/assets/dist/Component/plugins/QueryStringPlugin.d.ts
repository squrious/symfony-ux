import Component from '../index';
import { PluginInterface } from './PluginInterface';
interface QueryMapping {
    name: string;
}
export default class implements PluginInterface {
    private readonly mapping;
    private trackers;
    constructor(mapping: {
        [p: string]: QueryMapping;
    });
    attachToComponent(component: Component): void;
}
export {};
