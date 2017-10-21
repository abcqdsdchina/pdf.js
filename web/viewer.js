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

function getViewerConfiguration() {
  return {
    appContainer: document.getElementById('pdfContainer'),
    mainContainer: document.getElementById('viewerContainer'),
    viewerContainer: document.getElementById('viewer'),
    eventBus: null, // using global event bus with DOM events
    openFileInputName: 'fileInput',
    debuggerScriptPath: './debugger.js',
    defaultUrl: DEFAULT_URL
  };
}

function webViewerLoad() {
  let config = getViewerConfiguration();
  if (typeof PDFJSDev === 'undefined' || !PDFJSDev.test('PRODUCTION')) {
    Promise.all([
      SystemJS.import('pdfjs-web/app'),
      SystemJS.import('pdfjs-web/genericcom'),
      SystemJS.import('pdfjs-web/pdf_print_service'),
    ]).then(function([app, ...otherModules]) {
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
