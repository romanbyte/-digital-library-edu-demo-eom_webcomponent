import { h, Component, Element, Event, EventEmitter } from '@stencil/core';
import { checkDisplay, checkTask, findTask } from './tasks';
import { Verb } from './constants';

export type XApiMessage = {
  verb: Verb;
  info?: unknown;
};

@Component({
  tag: 'demo-eom',
  styleUrl: 'demo-eom.css',
  assetsDirs: ['assets'],
  shadow: false
})
export class DemoEOM {
  private static getClosestTaskNumber(el: HTMLElement) {
    const closest = el.closest<HTMLElement>('[data-task-number]');

    return closest ? Number(closest.dataset.taskNumber) : null;
  }

  @Element()
  private el: HTMLElement;

  @Event()
  private xApiMessage: EventEmitter<XApiMessage>;

  private currentTaskNumber = 1;

  componentDidLoad() {
    this.initRadioAndCheckboxInputs();
    this.initTextInputs();

    this.sendXApiMessage(Verb.Started);
    this.sendXApiMessage(Verb.Launched, { step: this.currentTaskNumber });
  }

  private sendXApiMessage(verb: Verb, info?: unknown) {
    this.xApiMessage.emit({ verb, info });
  }

  private initRadioAndCheckboxInputs() {
    this.el
      .querySelectorAll<HTMLInputElement>(
        '.task-answers input[type=radio], .task-answers input[type=checkbox]'
      )
      .forEach((input) => {
        const taskNumber = DemoEOM.getClosestTaskNumber(input);

        input.addEventListener('change', (evt) => {
          const target = evt.target as HTMLInputElement;
          const value = target.value;

          this.sendXApiMessage(Verb.Answered, { step: taskNumber, value });
        });
      });
  }

  private initTextInputs() {
    this.el
      .querySelectorAll<HTMLInputElement>('.task-answers input[type=text]')
      .forEach((input) => {
        const taskNumber = DemoEOM.getClosestTaskNumber(input);

        input.addEventListener('focus', (evt) => {
          const target = evt.target as HTMLInputElement;

          target.dataset.oldValue = target.value;
        });

        input.addEventListener('blur', (evt) => {
          const target = evt.target as HTMLInputElement;
          const value = target.value;
          const prevValue = target.dataset.oldValue;

          if (prevValue === value) {
            return;
          }

          this.sendXApiMessage(Verb.Answered, { step: taskNumber, value });
        });
      });
  }

  private handleTabSwitch = (evt: MouseEvent) => {
    const targetPill = evt.target as HTMLElement;
    const taskNumber = Number(targetPill.dataset.taskNumber);
    const targetTabId = `task-${taskNumber}-tab-content`;
    const targetTab = document.getElementById(targetTabId);

    if (this.currentTaskNumber !== taskNumber && targetTab && targetPill) {
      this.sendXApiMessage(Verb.Passed, { step: this.currentTaskNumber });
      this.currentTaskNumber = taskNumber;

      const tabs = document.querySelectorAll<HTMLElement>(
        '.tab-content > .tab-pane'
      );

      targetTab.classList.add('show', 'active');
      [...tabs]
        .filter((tab) => tab.id !== targetTabId)
        .forEach((tab) => tab.classList.remove('show', 'active'));

      const pills = document.querySelectorAll<HTMLElement>(
        '#tasks-tabs > .page-item > .page-link'
      );

      targetPill.parentElement.classList.add('active');
      [...pills]
        .filter((pill) => pill.dataset.taskNumber !== `${taskNumber}`)
        .forEach((pill) => pill.parentElement.classList.remove('active'));

      this.sendXApiMessage(Verb.Launched, { step: this.currentTaskNumber });
    }
  };

  private handleTaskCheckClick = () => {
    this.sendXApiMessage(Verb.Hinted, { step: this.currentTaskNumber });

    const task = findTask(this.currentTaskNumber);
    const isCorrect = checkTask(task);

    checkDisplay(task, isCorrect);
  };

  private handleEomComplete = () => {
    this.sendXApiMessage(Verb.Completed);
  };

  render = () => (
    <div class="task-content">
      <div class="tab-content" id="tasks-tabs-content">
        <div
          class="tab-pane fade show active"
          id="task-1-tab-content"
          role="tabpanel"
        >
          <task-one />
        </div>

        <div class="tab-pane fade" id="task-2-tab-content" role="tabpanel">
          <task-two />
        </div>

        <div class="tab-pane fade" id="task-3-tab-content" role="tabpanel">
          <task-three />
        </div>
      </div>

      <footer class="task-footer">
        <div class="container">
          <div class="row">
            <div class="col d-flex align-items-center justify-content-start">
              <button
                class="btn btn-outline-success"
                onClick={this.handleTaskCheckClick}
              >
                Проверить задание
              </button>
            </div>
            <div class="col d-flex align-items-center justify-content-center">
              <div class="pagination" id="tasks-tabs" role="tablist">
                {[1, 2, 3].map((taskNumber) => (
                  <div
                    class={`page-item ${
                      taskNumber === this.currentTaskNumber ? 'active' : ''
                    }`}
                    role="presentation"
                  >
                    <button
                      class="page-link"
                      data-task-number={taskNumber}
                      onClick={this.handleTabSwitch}
                      type="button"
                      role="tab"
                    >
                      {taskNumber}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div class="col d-flex align-items-center justify-content-end">
              <button class="btn btn-primary" onClick={this.handleEomComplete}>
                Завершить
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
