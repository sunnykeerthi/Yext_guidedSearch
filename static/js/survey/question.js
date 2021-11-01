import { mounterFor } from './util';
import Type from 'union-type';
import * as R from 'ramda';
import {
  h,
} from "snabbdom";

import checkSVG from '../../assets/images/check.svg';
import geoSVG from '../../assets/images/geo.svg';

// STATE
// {
//   question: string
//   type: text | radio | checkbox
//   options: []{text: string, details: string, selected: bool, image: string}
//   response: string
//   autocomplete: bool
// }

const textView = (action$, state) => {
  if (!state.autocomplete) {
    return h('input.Question-input', {
      on: {change: e  => {
        action$(Action.SetResponse(e.target.value))
      }}, 
      props: {value: state.response}}, []);
  }

  const geocoder = new window.MapboxGeocoder({
      accessToken: window.mapboxgl.accessToken,
      placeholder: 'Enter your location',
      types: 'country,region,place,postcode,locality,neighborhood'
  });
  window.geo = geocoder;

  return h('div.Question-geolocateWrapper', {}, [h('div', { 
      hook: {
        insert: (vnode) => {
          geocoder.addTo(vnode.elm);

          geocoder.on('result', function (e) {
            action$(Action.SetResponse(e.result.place_name));
          });

          const realInput = vnode.elm.querySelector('input')
          realInput.addEventListener('change', (e) => {
            action$(Action.SetResponse(e.target.value));
          })
        },
      }
    }
  ), h('button.geo', {
    props: {type: 'button'},
    style: {backgroundImage: `url(${geoSVG})`},
    on: {click: e => {
      navigator.geolocation.getCurrentPosition((pos) => {
        fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${pos.longitude},${pos.latitude}.json?access_token=pk.eyJ1IjoieWV4dCIsImEiOiJqNzVybUhnIn0.hTOO5A1yqfpN42-_z_GuLw`)
          .then(resp => resp.json())
          .then(data => {
            if (!data.features || data.features.length === 0) return;
            geocoder.query(data.features[0].text || data.features[0].place_name);
          })
      }, (err) => {
        console.error("Geolocate error: ", err)
      })
    }}
  }, [])]);
}

const baseOptionView = (action$, state, actionConstructor) => {
  const columns = state.isMobile ? 1 : state.columns || 1;
  return h('div.Question-options', {
    style: {gridTemplateColumns: `repeat(${columns}, 1fr)`},
  }, 
    state.options.map((opt, i) => {
      const optText = h('div.Question-optionLabel', {}, opt.text)
      const optChildren = opt.image ? 
        [h('div.Question-optionImgWrapper', {}, [
          h('img.Question-optionImg', {props: {src: opt.image}}) 
        ]), optText] :
        [optText];

      return h('button.Question-option', {
        props: {type: 'button'},
        class: {'is-selected': opt.selected},
        on: {click: () => action$(actionConstructor(i))}
      }, optChildren)
    }),
  );
}

const radioDetailsView = (action$, state) => {
  const columns = state.isMobile ? 1 : state.columns || 1;
  return h('div.Question-options', {
    style: {gridTemplateColumns: `repeat(${columns}, 1fr)`},
  }, 
    state.options.map((opt, i) => h('button.Question-option.Question-option--detailed', {
      props: {type: 'button'},
      on: {click: () => action$(Action.SetExclusiveOption(i))}
    }, [
      h('div.Question-optionHeading', {}, [
        h('span.Question-optionTitle', {}, [opt.text]),
        h('span.Question-selectedCircle', {
          style: {backgroundImage: `url(${checkSVG})`},
          class: {'is-selected': opt.selected},
        }, []),
      ]),
      h('hr.Question-optionDivider'),
      h('div.Question-optionDetails', {}, [opt.details])
    ])),
  );
}

const radioView = (action$, state) => {
  return baseOptionView(action$, state, Action.SetExclusiveOption)
}

const checkboxView = (action$, state) => {
  return baseOptionView(action$, state, Action.ToggleOption)
}

const correctQuestionView = (action$, state) => {
  return state.type === 'text' ? textView(action$, state)
       : state.type === 'radio' ? radioView(action$, state)
       : state.type === 'checkbox' ? checkboxView(action$, state)
       : state.type === 'radiodetails' ? radioDetailsView(action$, state)
       : h('div', {}, ['Unknown Question Type'])
}

const view = R.curry((action$, state) => {
  return h('div.Question', {}, [
    h('div.Question-prompt', {}, [
      h('div.Question-title', {}, state.question),
      state.type === 'checkbox' ? h('div.Question-instructions', {}, 'Select all that are relevant.') : null,
    ]),
    correctQuestionView(action$, state),
  ])
})

const Action = Type({
  Clear: [],
  SetResponse: [() => true],
  ToggleOption: [Number],
  SetExclusiveOption: [Number],
})

const update = (state, action) => {
  return Action.case({
    Clear: (state) => ({...state, response: '', options: state.options.map(opt => ({...opt, selected: false}))}),
    SetResponse: (response, state) => ({...state, response: response}),
    ToggleOption: (i, state) => ({...state, options: state.options.map((opt, idx) => idx === i ? {...opt, selected: !opt.selected}: opt)}),
    SetExclusiveOption: (i, state) => ({...state, options: state.options.map((opt, idx) => idx === i ? {...opt, selected: true}: {...opt, selected: false})}),
  }, action, state)
}

const mount = mounterFor({
  view,
  update,
});

export default { view, update, mount, Action};

