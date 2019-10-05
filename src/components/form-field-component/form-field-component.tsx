import { Component, Prop, Element } from '@stencil/core';
import { CSSClasses } from './css-classes.enum';

@Component({
  tag: 'form-field-component',
  styleUrl: 'form-field-component.css',
  shadow: false
})
export class FormFieldComponent {
  /** Form field description */
  @Prop()
  public introText: string;

  /** Filled in text */
  @Prop()
  public filledText: string;

  /** Underline notes */
  @Prop()
  public notes: string;

  /** Component's main HTML element */
  @Element()
  private rootElement: HTMLElement;

  /** Component loaded hook */
  public componentDidLoad(): void {
    this.generateFormFieldForPrint();
  }

  /** Generating form fields */
  public generateFormFieldForPrint(): void {
    this.generateContainersWithText(this.introText, false);
    this.generateContainersWithText(this.filledText, true);
    this.generateNotes();
  }

  /** Add notes */
  private generateNotes(): void {
    const notesArr = this.notes.split('|').map(i => i.trim());
    notesArr.forEach((note, index) => this.addNoteToContainer(note, index));
  }

  /** Add note to filled tex container */
  private addNoteToContainer(note: string, containerIndex: number): void {
    const hostContainer = this.rootElement.getElementsByClassName(CSSClasses.FilledText)[containerIndex] as HTMLElement;
    if (!hostContainer) {
      return;
    }
    const noteContainer = this.generateNoteContainer(hostContainer);
    noteContainer.innerText = note;
  }

  /** Generate containers with text */
  private generateContainersWithText(text: string, isFilledTextContainer: boolean): void {
    const generateContainerFunc = isFilledTextContainer ?
      () => this.generateFilledTextContainer() :
      () => this.generateIntroTextContainer();

    const textArray = text.trim().split(' ');
    let textContainer = generateContainerFunc();

    for (const word of textArray) {
      const currentContainerText = textContainer.innerText;
      textContainer.innerText = currentContainerText + ' ' + word;

      /** Check if container is overflowing */
      if (this.isContainerOverflowing(textContainer, isFilledTextContainer)) {
        textContainer.innerText = currentContainerText.trim();
        textContainer = generateContainerFunc();
        textContainer.innerText = word;
      }
    }
  }

  /** Check if container is overflowing */
  private isContainerOverflowing(el: HTMLElement, isFilledTextContainer: boolean): boolean {
    const isNoFirstFilledText = this.isNotFirstFilledContainer;

    /** For intro text container and the first filled text container */
    if (!isFilledTextContainer || isNoFirstFilledText) {
      return el.scrollWidth > el.clientWidth;
    }

    const formWidth = this.rootElement.clientWidth;
    const introElements = document.getElementsByClassName(CSSClasses.IntroText);
    const lastIntroContainerWidth = introElements[introElements.length - 1] && introElements[introElements.length - 1].clientWidth || 0;

    /** When last intro container occupies whole width of the form */
    if (lastIntroContainerWidth === formWidth) {
      return el.scrollWidth > el.clientWidth;
    }

    /** Check if first filled container's width combined with last intro container overflow the form */
    return el.scrollWidth > el.clientWidth || el.clientWidth + lastIntroContainerWidth > formWidth;
  }

  /** Create an HTML element */
  private addContainer(hostContainer: HTMLElement, elTag: string, elClass: CSSClasses): HTMLElement {
    const newEl = document.createElement(elTag);
    newEl.classList.add(elClass);
    hostContainer.appendChild(newEl);
    return newEl;
  }

  /** Check if the element is the first filled text container */
  private get isNotFirstFilledContainer(): boolean {
    return this.rootElement.getElementsByClassName(CSSClasses.FilledText).length > 1;
  }

  /** Create a container for a filled text */
  private generateFilledTextContainer(): HTMLElement {
    return this.addContainer(this.rootElement, 'div', CSSClasses.FilledText)
  }

  /** Create a container for a intro text */
  private generateIntroTextContainer(): HTMLElement {
    return this.addContainer(this.rootElement, 'div', CSSClasses.IntroText);
  }

  /** Create a container for a note */
  private generateNoteContainer(hostContainer: HTMLElement): HTMLElement {
    return this.addContainer(hostContainer, 'div', CSSClasses.UnderlineNote)
  }
}
