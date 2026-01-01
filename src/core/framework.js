
import { renderer } from './Renderer.js';
import { VDom } from './vdom/VDom.js';

export const h = VDom.h;
export const render = renderer.render.bind(renderer);
export const useState = renderer.useState.bind(renderer);
export const useEffect = renderer.useEffect.bind(renderer);
