const flyd = require('flyd');
import { 
  init,
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
} from "snabbdom";

import globalState from './globalState';

const patch = init([
  // Init patch function with chosen modules
  classModule, // makes it easy to toggle classes
  propsModule, // for setting properties on DOM elements
  styleModule, // handles styling on elements with support for animations
  eventListenersModule, // attaches event listeners
]);

export const mounterFor = (Component) => {
  const {view, update} = Component;
  return (initialState, container) => {
    const action$ = flyd.stream();

    const model$ = flyd.scan(update, initialState, action$);

    const globalizedModel$ = flyd.combine((gState, localState) => {
      return Object.assign(gState(), localState());
    }, [globalState.state$, model$]);
    const vnode$ = flyd.map(view(action$), globalizedModel$);


    flyd.scan(patch, container, vnode$);
  }
}
