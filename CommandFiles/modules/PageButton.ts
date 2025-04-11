import { CassTypes } from "./type-validator";
import { UNISpectra } from "./unisym";

export class PageButton {
  private buttons: PageButton.ButtonItem[];
  private payloadTitle: string;

  constructor(buttons: PageButton.ButtonItem[]);

  constructor(button: PageButton.ButtonItem);

  constructor(...buttons: PageButton.ButtonItem[]);

  constructor(
    buttonOrButtons?:
      | PageButton.ButtonItem[]
      | PageButton.ButtonItem
      | undefined,
    ...tail: (PageButton.ButtonItem | undefined)[]
  ) {
    if (buttonOrButtons) {
      if (!Array.isArray(buttonOrButtons)) {
        this.buttons = [buttonOrButtons];
      } else {
        this.buttons = [...buttonOrButtons];
      }
    } else {
      this.buttons = [];
    }
    if (tail.length > 0) {
      this.buttons.push(...tail);
    }
    this.payloadTitle = "";
    this.buttons = this.buttons
      .filter(Boolean)
      .map((i) => {
        PageButton.validator.validate(i);
        return i;
      })
      .map((i) => PageButton.ButtonItem(i));
  }

  static ButtonItem(item: any): PageButton.ButtonItem {
    item ??= {};
    return {
      type: String(item.key ?? PageButton.key),
      url: String(item.url).startsWith("http")
        ? String(item.url)
        : "http://" + String(item.url),
      title: String(item.title ?? ""),
    };
  }

  button(): PageButton.ButtonItem[];

  button(at: number): PageButton.ButtonItem;

  button(urlTitle: PageButton.ButtonItem["url"]): this;

  button(
    url: PageButton.ButtonItem["url"],
    title: PageButton.ButtonItem["title"]
  ): this;

  button(
    url: PageButton.ButtonItem["url"],
    title: PageButton.ButtonItem["title"],
    customType: PageButton.ButtonItem["type"]
  ): this;

  button(
    urlTitle?: PageButton.ButtonItem["url"] | number,
    title?: PageButton.ButtonItem["title"],
    customType?: PageButton.ButtonItem["type"]
  ) {
    if (typeof urlTitle === "number") {
      return this.buttons.at(urlTitle);
    }
    if (!urlTitle && !title && !customType) {
      return this.buttons;
    }
    const item = {
      type: customType ?? PageButton.key,
      url: urlTitle,
      title: title ?? urlTitle,
    };
    PageButton.validator.validate(item);
    this.buttons.push(item);
    return this;
  }

  buildPayload() {
    return {
      attachment: {
        type: "template",
        title: this.payloadTitle,
        buttons: [...this.buttons],
      },
    };
  }

  [Symbol.toStringTag] = PageButton.name;

  static fromPayload(
    payload: ReturnType<PageButton["buildPayload"]>["attachment"]
  ) {
    const inst = new PageButton();
    inst.title(payload.title);
    payload.buttons.forEach((i) => inst.button(i.url, i.title));
    return inst;
  }

  toString(): string;

  toString(raw: boolean = false) {
    return `${this.title()}\n\n${
      !raw
        ? `${UNISpectra.standardLine}\n${this.button().map(
            (i) => `**${i.title}** [${i.url}]`
          )}`
        : `\n\n${this.button().map((i) => `${i.title} [${i.url}]`)}`
    }`;
  }

  get payload() {
    return this.buildPayload();
  }

  title(): string;

  title(title: string): this;

  title(title?: string) {
    if (!title) {
      return this.payloadTitle;
    }
    this.payloadTitle = String(title);
    return this;
  }

  sendBy(output: PageButton.OutputLike, isReply: boolean = true) {
    const payload = this.buildPayload();

    if (isReply && "reply" in output && typeof output.reply === "function") {
      return output.reply(payload);
    } else if ("send" in output && typeof output.send === "function") {
      return output.send(payload);
    }
    if (typeof output === "function") {
      return output(payload);
    }
    throw new TypeError(
      "Invalid OutputLike Object, it must have a reply or send method or a function"
    );
  }
}

export namespace PageButton {
  export type OutputLike =
    | ((form: { attachment: any; [key: string]: any }) => any | Promise<any>)
    | {
        reply?: (form: {
          attachment: any;
          [key: string]: any;
        }) => any | Promise<any>;
        send?: (form: {
          attachment: any;
          [key: string]: any;
        }) => any | Promise<any>;
      };

  export const key = "web_url";
  export const validator = new CassTypes.Validator({
    type: "string",
    url: "string",
    title: "string",
  });

  export function isPageButton(
    attachment: any
  ): attachment is ReturnType<PageButton["buildPayload"]> {
    return (
      "title" in attachment && "buttons" in attachment && "type" in attachment
    );
  }

  export type ValidatorT = CassTypes.FromValidator<typeof validator>;

  export interface ButtonItem {
    type: string;
    url: string;
    title: string;
  }
}

export { PageButton as Button };
