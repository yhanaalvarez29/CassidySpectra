import { CassTypes } from "./type-validator";

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
    if (typeof output === "function") {
      return output(payload);
    }
    if (isReply && typeof output.reply === "function") {
      return output.reply(payload);
    } else if (typeof output.send === "function") {
      return output.send(payload);
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

  export type ValidatorT = CassTypes.FromValidator<typeof validator>;

  export interface ButtonItem {
    type: string;
    url: string;
    title: string;
  }
}

export { PageButton as Button };
