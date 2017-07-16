/* Copyright 2016 Mozilla Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* globals chrome */

'use strict';

var DEFAULT_URL = 'compressed.tracemonkey-pldi-09.pdf';

if (typeof PDFJSDev !== 'undefined' && PDFJSDev.test('CHROME')) {
  (function rewriteUrlClosure() {
    // Run this code outside DOMContentLoaded to make sure that the URL
    // is rewritten as soon as possible.
    var queryString = document.location.search.slice(1);
    var m = /(^|&)file=([^&]*)/.exec(queryString);
    DEFAULT_URL = m ? decodeURIComponent(m[2]) : '';

    // Example: chrome-extension://.../http://example.com/file.pdf
    var humanReadableUrl = '/' + DEFAULT_URL + location.hash;
    history.replaceState(history.state, '', humanReadableUrl);
    if (top === window) {
      chrome.runtime.sendMessage('showPageAction');
    }
  })();
}

var pdfjsWebApp;
if (typeof PDFJSDev !== 'undefined' && PDFJSDev.test('PRODUCTION')) {
  pdfjsWebApp = require('./app.js');
}

if (typeof PDFJSDev !== 'undefined' && PDFJSDev.test('FIREFOX || MOZCENTRAL')) {
  require('./firefoxcom.js');
  require('./firefox_print_service.js');
}
if (typeof PDFJSDev !== 'undefined' && PDFJSDev.test('GENERIC')) {
  require('./genericcom.js');
}
if (typeof PDFJSDev !== 'undefined' && PDFJSDev.test('CHROME')) {
  require('./chromecom.js');
}
if (typeof PDFJSDev !== 'undefined' && PDFJSDev.test('CHROME || GENERIC')) {
  require('./pdf_print_service.js');
}

function getViewerConfiguration() {
  return {
    appContainer: document.getElementById('pdfContainer'),
    mainContainer: document.getElementById('viewerContainer'),
    viewerContainer: document.getElementById('viewer'),
    eventBus: null, // using global event bus with DOM events
    passwordOverlay: {
      overlayName: 'passwordOverlay',
      container: document.getElementById('passwordOverlay'),
      label: document.getElementById('passwordText'),
      input: document.getElementById('password'),
      submitButton: document.getElementById('passwordSubmit'),
      cancelButton: document.getElementById('passwordCancel')
    },
    errorWrapper: {
      container: document.getElementById('errorWrapper'),
      errorMessage: document.getElementById('errorMessage'),
      closeButton: document.getElementById('errorClose'),
      errorMoreInfo: document.getElementById('errorMoreInfo'),
      moreInfoButton: document.getElementById('errorShowMore'),
      lessInfoButton: document.getElementById('errorShowLess'),
    },
    printContainer: document.getElementById('printContainer'),
    openFileInputName: 'fileInput',
    debuggerScriptPath: './debugger.js',
    defaultUrl: DEFAULT_URL
  };
}

function webViewerLoad() {
  var config = getViewerConfiguration();
  if (typeof PDFJSDev === 'undefined' || !PDFJSDev.test('PRODUCTION')) {
    Promise.all([
      SystemJS.import('pdfjs-web/app'),
      SystemJS.import('pdfjs-web/genericcom'),
      SystemJS.import('pdfjs-web/pdf_print_service'),
    ]).then(function (modules) {
      var app = modules[0];
      window.PDFViewerApplication = app.PDFViewerApplication;
      app.PDFViewerApplication.run(config);
    });
  } else {
    window.PDFViewerApplication = pdfjsWebApp.PDFViewerApplication;
    pdfjsWebApp.PDFViewerApplication.run(config);
  }
}

if (document.readyState === 'interactive' ||
    document.readyState === 'complete') {
  webViewerLoad();
} else {
  document.addEventListener('DOMContentLoaded', webViewerLoad, true);
}
