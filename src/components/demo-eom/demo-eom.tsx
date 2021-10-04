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
        '.nav-pills > .nav-item > .nav-link'
      );

      targetPill.classList.add('active');
      [...pills]
        .filter((pill) => pill.dataset.taskNumber !== `${taskNumber}`)
        .forEach((pill) => pill.classList.remove('active'));

      this.sendXApiMessage(Verb.Launched, { step: this.currentTaskNumber });
    }
  };

  private handleTaskCheckClick = (evt: MouseEvent) => {
    const tab = evt.target as HTMLElement;
    const taskNumber = Number(tab.dataset.taskNumber);

    this.sendXApiMessage(Verb.Hinted, { step: taskNumber });

    const task = findTask(taskNumber);
    const isCorrect = checkTask(task);

    checkDisplay(task, isCorrect);
  };

  render = () => {
    return (
      <div>
        <div class="tab-content" id="tasks-tabs-content">
          <div
            class="tab-pane fade show active"
            id="task-1-tab-content"
            role="tabpanel"
          >
            <task-one />

            <div class="task-check container">
              <button
                class="btn btn-success"
                data-task-number={1}
                onClick={this.handleTaskCheckClick}
              >
                Проверить задание
              </button>
            </div>
          </div>

          <div class="tab-pane fade" id="task-2-tab-content" role="tabpanel">
            <task-two />

            <div class="task-check container">
              <button
                class="btn btn-success"
                data-task-number={2}
                onClick={this.handleTaskCheckClick}
              >
                Проверить задание
              </button>
            </div>
          </div>

          <div class="tab-pane fade" id="task-3-tab-content" role="tabpanel">
            <task-three />

            <div class="task-check container">
              <button
                class="btn btn-success"
                data-task-number={3}
                onClick={this.handleTaskCheckClick}
              >
                Проверить задание
              </button>
            </div>
          </div>
        </div>

        <ul
          class="nav nav-pills justify-content-center mt-3 mb-4"
          id="tasks-tabs"
          role="tablist"
        >
          <li class="nav-item" role="presentation">
            <button
              class="nav-link active"
              data-task-number={1}
              onClick={this.handleTabSwitch}
              type="button"
              role="tab"
            >
              1
            </button>
          </li>

          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              data-task-number={2}
              onClick={this.handleTabSwitch}
              type="button"
              role="tab"
            >
              2
            </button>
          </li>

          <li class="nav-item" role="presentation">
            <button
              class="nav-link"
              data-task-number={3}
              onClick={this.handleTabSwitch}
              type="button"
              role="tab"
            >
              3
            </button>
          </li>
        </ul>
      </div>
    );
  };
}
