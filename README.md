# What is guided search

### It is a way of providing personalized answers to users based on a set of questions.


# How to use

The package is made with the exact folder structure (that are only required) as that of sites.

## Step 1 - Create Folders

- Under Static -> js -> Create a folder named `survey`.

## Step 2 - Uploading files.

- Upload `landing.json` and `survey.json` from `config` to site's `config` folder.
- Upload `landing.html.hbs` and `survey.html.hjbs` from `pages` to site's `pages` folder.
- Upload all the images from `static -> assets -> images` to  site's `static -> assets -> images` folder.
- Upload all the files from `static -> js -> survey` to  site's `static -> js -> survey` folder. (Folder created in Step 1)
- Upload `survey.scss` from `static -> scss` to `static -> scss` folder in sites.

## Step 3 - Replace entire content.

- `config -> global_config.json` on sites with `config -> global_config.json` file.
- `themes -> answers-hitchhiker-theme -> static -> webpack -> webpack.prod.js` on sites with `themes -> answers-hitchhiker-theme -> static -> webpack -> webpack.prod.js` file.
- `package.json` on sites with `package.json` file.
- `webpack-config.js` on sites with `webpack-config.js` file.


## Step 4 - Update contents. (please take a look at relevant file in repo for reference)

### answers.scss
- Add `@import "survey.scss";` as the first line to `answers.scss`.
- Add the below code anywhere not inside `.Answers` and `.overlay` blocks. 
```
.Survey .Question-option.is-selected {
    background-color: lightgrey; // Clicked element background color
}


.yxt-SearchBar-AnimatedIcon.yxt-SearchBar-AnimatedIcon--paused.js-yxt-AnimatedForward.component.yxt-Answers-component {
  display: none !important;
} 

.yxt-SearchBar-AnimatedIcon.js-yxt-AnimatedForward.component.yxt-Answers-component.yxt-SearchBar-AnimatedIcon--inactive,
.yxt-SearchBar-AnimatedIcon.js-yxt-AnimatedReverse.component.yxt-Answers-component.yxt-SearchBar-AnimatedIcon--inactive{
  display: none !important;
}

.yxt-SearchBar-AnimatedIcon.yxt-SearchBar-AnimatedIcon--paused.js-yxt-AnimatedReverse.yxt-SearchBar-AnimatedIcon--inactive.component.yxt-Answers-component
{
    display: flex !important; 
}
```

###

Add the below stylings to the `snswer-variables.scss` inside `:root`
```
  // Survey styling variables
  // this color is used for buttons, and other highlights throughout the survey
  --yxt-survey-color-primary: var(--yxt-color-brand-primary);
  // this color is used for text on buttons
  --yxt-survey-color-button-text: white;
  // this color is used for the 'skip question' text link
  --yxt-survey-color-skip-text: black;
  // these two colors power the progress bar colors
  --yxt-survey-color-progress-bar-empty: #d3d3d3;
  --yxt-survey-color-progress-bar-full: var(--yxt-color-brand-primary);
  // this property is used for box shadows on buttons and options
  --yxt-survey-box-shadow: 0px 8px 23px 0px rgba(0,0,0,0.66);
  ```
  

### global-config.js
From your answers experience update
- apiKey - append your key to `sandbox-`
- businessId
- experienceKey

Commit - Restart Live preview.
