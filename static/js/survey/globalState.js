const flyd = require('flyd');
import Type from 'union-type';

const state = {
  isMobile: false
}

const init = () => {
  let mql = window.matchMedia('(max-width: 600px)');
  mql.addEventListener('change', () => {
    action$(Action.SetMobile(mql.matches));
  })
  state.isMobile = mql.matches;
}

const Action = Type({
  SetMobile: [Boolean],
})

const update = (state, action) => {
  return Action.case({
    SetMobile: (isMobile, state) => ({isMobile}),
  }, action, state)
}

const withGlobalState = (Component) => {
  const { view, update } = Component;
  return {
    view: ($action, state) => view($action, Object.assign(state$(), state)),
    update: update,
  }
}

init();
const action$ = flyd.stream();
const state$ = flyd.scan(update, state, action$)

export default { state$, Action, action$, withGlobalState }