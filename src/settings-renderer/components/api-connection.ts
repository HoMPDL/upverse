import * as Validation from '../../utils/validation.js';

import Cmp from './base-component.js';
import { ipcRenderer } from 'electron';

export class ApiConnection extends Cmp<HTMLDivElement, HTMLFormElement> {
  tokenInputElement: HTMLInputElement;
  urlInputElement: HTMLInputElement;
  testButtonElement: HTMLButtonElement;
  saveButtonElement: HTMLButtonElement;

  constructor() {
    super('api-connection', 'app-connection', true, 'api-settings');
    this.tokenInputElement = this.element.querySelector(
      '#token'
    ) as HTMLInputElement;
    this.urlInputElement = this.element.querySelector(
      '#url'
    ) as HTMLInputElement;
    this.testButtonElement = this.element.querySelector(
      '#test'
    ) as HTMLButtonElement;
    this.saveButtonElement = this.element.querySelector(
      '#save'
    ) as HTMLButtonElement;
    this.configure();
  }

  configure(): void {
    this.element.addEventListener('input', this.resetHandler.bind(this));
    this.element.addEventListener('submit', this.submitHandler.bind(this));
    this.testButtonElement.addEventListener('click', this.testHandler.bind(this));
    this.tokenInputElement.value = process.env.admin_api_key;
    this.urlInputElement.value = process.env.dv_base_uri;

    ipcRenderer.on('TEST_CONN_SUCCESS', (event: Event) => {
      (document.getElementById(
        'test_result'
      ) as HTMLDivElement).innerHTML = '<i class="bi bi-check2-circle text-secondary"></i>';
    });

    ipcRenderer.on('TEST_CONN_FAILED', (event: Event) => {
      (document.getElementById(
        'test_result'
      ) as HTMLDivElement).innerHTML = '<i class="bi bi-x-circle text-secondary"></i>';
    });

    ipcRenderer.on('SAVE_SETTINGS_SUCCESS', (event: Event) => {
      (document.getElementById(
        'save_result'
      ) as HTMLDivElement).innerHTML = '<i class="bi bi-check2-circle text-secondary"></i>';
    });

    ipcRenderer.on('SAVE_SETTINGS_FAILED', (event: Event) => {
      (document.getElementById(
        'save_result'
      ) as HTMLDivElement).innerHTML = '<i class="bi bi-x-circle text-secondary"></i>';
    });
  }

  renderContent(): void { console.log("renderContent") }

  private gatherUserInput(): [string, string] | void {
    const enteredToken = this.tokenInputElement.value;
    const enteredUrl = this.urlInputElement.value;

    const tokenValidatable: Validation.Validatable = {
      value: enteredToken,
      required: true,
      regexp: /^[a-zA-Z0-9]{8}\-[a-zA-Z0-9]{4}\-[a-zA-Z0-9]{4}\-[a-zA-Z0-9]{4}\-[a-zA-Z0-9]{12}$/
    };
    
    const urlValidatable: Validation.Validatable = {
      value: enteredUrl,
      required: true,
    };

    if (
      !Validation.validate(tokenValidatable) ||
      !Validation.validate(urlValidatable)
    ) {
      alert('Invalid settings, please try again!');
      return;
    } else {
      return [enteredToken, enteredUrl];
    }
  }

  private testHandler(event: Event) {
    event.preventDefault();
    const apiSettings = this.gatherUserInput();
    if (Array.isArray(apiSettings)) {
      ipcRenderer.send('DO_TEST_CONN', apiSettings);
    }
  }

  private submitHandler(event: Event) {
    event.preventDefault();
    const apiSettings = this.gatherUserInput();
    if (Array.isArray(apiSettings)) {
      ipcRenderer.send('DO_SAVE_SETTINGS', apiSettings);
    }
  }

  private resetHandler(event: Event) {
    event.preventDefault();
    (document.getElementById(
      'test_result'
    ) as HTMLDivElement).innerHTML = '';

    (document.getElementById(
      'save_result'
    ) as HTMLDivElement).innerHTML = '';
  }

}
