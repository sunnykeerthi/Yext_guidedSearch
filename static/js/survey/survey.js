import { mounterFor } from './util';
import Type from 'union-type';
import * as R from 'ramda';
import Question from './question';
import {
  h,
} from "snabbdom";
import globalState from './globalState';

import arrowLeftSVG from '../../assets/images/arrow-left.svg';
import arrowRightSVG from '../../assets/images/arrow-right.svg';
import angleRight from '../../assets/images/angle-right.svg';

const container = document.querySelector(".js-survey");

const GlobalQuestion = globalState.withGlobalState(Question);

// STATE
// {
//   queryBase: string
//   vertical: string
//   questions: []question
//   activeQuestion: int
//   isMobile: bool
// }

const init = () => {
  const surveyConfig = JSON.parse(document.querySelector('#survey-config').dataset.data);
  for (const q of surveyConfig.questions) {
    q.options = (q.options || []).map(opt => {
      if (typeof opt === 'string') {
        return {text: opt, details: '', selected: false, image: ''};
      }
      // preload images so they don't flash when we transition between pages
      new Image().src = opt.image;
      return {...opt, selected: false}
    });
  }
  return {
    ...surveyConfig,
    activeQuestion: 0,
  }
}

const Action = Type({
  MoveRight: [],
  Skip: [],
  MoveLeft: [],
  UpdateQuestion: [Object],
})

function getQuestionValue(question) {
  if (question.type === 'text') return question.response;
  return question.options.filter(opt => opt.selected).map(opt => opt.text).join(', ')
}

function constructQuery(state) {
  let query = state.queryBase || '';
  for (const question of state.questions) {
    const value = getQuestionValue(question);
    query += value ? ' ' + question.format.replace('%s', getQuestionValue(question)) : '';
  }
  return query.trim();
}

const surveyView = R.curry((action$, state) => {
  const queryUrl = `/${state.vertical}?query=${encodeURIComponent(constructQuery(state))}`;
  const submitButton = h('a.Survey-submit', { props: { href: queryUrl } }, ['Submit']);
  const rightButton =  h('button.Survey-right', { 
        style: {background: `url(${arrowRightSVG}) center no-repeat`},
    on: {click: () => action$(Action.MoveRight)}, 
    props: { type: 'button' } 
  }, []);

  const isFirstQuestion = state.activeQuestion === 0;
  const isLastQuestion = state.activeQuestion === state.questions.length - 1;

  return h('div.Survey', [
    h('form.Survey-form', [
      h('div.Survey-progress', {}, [
        h('div.Survey-progressFill', {style: {width: `${100 * (state.activeQuestion + 1) / state.questions.length}%`}}, [])
      ]),
      h('div.Survey-question', {}, [
        GlobalQuestion.view(action => action$(Action.UpdateQuestion({idx: state.activeQuestion, action: action})), state.questions[state.activeQuestion]),
      ]),
    ]),
    h('div.Survey-navBar', {}, [
      isFirstQuestion ? h('span') : h('button.Survey-left', { 
        style: {background: `url(${arrowLeftSVG}) center no-repeat`},
        on: {click: () => action$(Action.MoveLeft)}, 
        props: { type: 'button' }
      }, []),
      isLastQuestion ? h('span') : h('button.Survey-skip', { style: {}, on: {click: () => action$(Action.Skip)}, props: { type: 'button' } }, [
        'Skip this question',
        h('span.Survey-angle', {style: {backgroundImage: `url(${angleRight})`}}, []),
      ]),
      isLastQuestion ? submitButton : rightButton,
    ]),
  ])
})

const update = (state, action) => {
  return Action.case({
    Skip: (state) => ({
       ...state, 
       activeQuestion: Math.min(state.questions.length - 1, state.activeQuestion + 1),
       questions: state.questions.map((q, i) => state.activeQuestion === i ? Question.update(q, Question.Action.Clear) : q)}),
    MoveLeft: (state) => ({ ...state, activeQuestion: Math.max(0, state.activeQuestion - 1) }),
    MoveRight: (state) => ({ ...state, activeQuestion: Math.min(state.questions.length - 1, state.activeQuestion + 1) }),
    UpdateQuestion: (data, state) => {
      const searchbar = document.querySelector('.js-yext-query');
      const newState = { ...state, questions: state.questions.map((q, idx) => idx === data.idx ? Question.update(q, data.action) : q)}
      if (searchbar) {
        searchbar.value = constructQuery(newState);
        searchbar.scrollLeft = searchbar.scrollWidth;
      }
      return newState;
    },
  }, action, state)
}

const surveyMounter = mounterFor({
  view: surveyView,
  update: update,
});

surveyMounter(init(), container)
