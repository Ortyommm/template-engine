import * as fs from "fs";
import * as path from "path";

class Templater {
  html = "";
  //execution ends when template length === 0
  shouldExecute = true;
  private templateCopy: string;
  constructor(template: string, private vars: { [prop: string]: any }) {
    this.templateCopy = template;
  }

  //if, for
  handleSpecialBlock() {
    const closeSpecialBlockIndex = this.templateCopy.indexOf("#}");

    const secondSpecialBlockIndex = this.templateCopy.indexOf("{/#");
    //TODO nesting
    const secondSpecialBlockIndexEnd = this.templateCopy.indexOf("#/}");

    const expression = this.templateCopy
      .slice(2, closeSpecialBlockIndex)
      .trim();
    const innerHtml = this.templateCopy.slice(
      closeSpecialBlockIndex + 2,
      secondSpecialBlockIndex
    );

    //special block contains keyword and body
    const [keyword, body] = expression.split(" ").reduce(
      (acc, cur, i) => {
        if (i === 0) acc[0] = cur;
        else acc[1] += cur;
        return acc;
      },
      ["", ""]
    );

    if (keyword === "if") {
      //TODO logical operators
      if (this.vars[body]) {
        this.html += new Templater(innerHtml, this.vars).render();
      } else {
      }
      this.templateCopy = this.templateCopy.slice(
        secondSpecialBlockIndexEnd + 3
      );
    }
  }

  render() {
    while (this.shouldExecute) {
      const isCurlyBracesStarted = this.templateCopy.startsWith("{{");
      const isSpecialBlockStarted = this.templateCopy.startsWith("{#");

      if (isCurlyBracesStarted) {
        const closeCurlyBracesIndex = this.templateCopy.indexOf("}}");
        const expression = this.templateCopy
          .slice(2, closeCurlyBracesIndex)
          .trim();
        this.templateCopy = this.templateCopy.slice(closeCurlyBracesIndex + 2);
        this.html += this.vars[expression];
      } else if (isSpecialBlockStarted) {
        this.handleSpecialBlock();
      } else {
        this.html += this.templateCopy[0];
        this.templateCopy = this.templateCopy.slice(1);
      }

      if (!this.templateCopy.length) this.shouldExecute = false;
    }
    return this.html;
  }
}

const html = fs
  .readFileSync(path.resolve(__dirname, "../example/index.template.html"))
  .toString();

fs.writeFileSync(
  path.resolve(__dirname, "../example/index.html"),
  new Templater(html, { tables: 1 }).render()
);
