# Prettier Java formatter

An extension to integrate Prettier Java into Visual Studio Code. It is a very small piece of code heavily inspired by [Matthew Burke](https://github.com/mwpb)'s now unmaintained [Java Prettier formatter](https://github.com/mwpb/java-prettier-formatter). It does the same thing just with different versions of [Prettier](https://github.com/prettier/prettier) and [Prettier Java](https://github.com/jhipster/prettier-java).

## Usage

This extension is a Java formatter. You can use it in Visual Studio Code using the "Format Document" command from the command palette (Ctrl +Shift + P or Cmd + Shift + P).
It will only be available in open Java files as this formatter only supports Java files formatting.

You can also set it as your default Java formatter and format the code when a file is saved.

## Difference with Java Prettier formatter
As mentioned above, this package has identical functionality to [Java Prettier formatter](https://github.com/mwpb/java-prettier-formatter). It only uses different package versions. Namely Prettier 3.2.5 and Prettier Java 2.6.0. Versions are very important with respect to Prettier as it can affect the formatted code.

In order to make this extension more easily adopted, I have planned to allow custom Prettier and Prettier Java versions. This way, nobody should need to build their own extension as I did only to change package versions.
## Acknowledgments

[If Java Prettier formatter only completed the last yard to use Prettier with Java files in VS Code in a standalone way](https://github.com/mwpb/java-prettier-formatter#acknowledgments), then this package only completes the last inch of doing exactly the same thing but with different package versions.

Thanks for the following work:
- [Prettier](https://github.com/prettier/prettier) - An opinionated code formatter
- [Prettier Java](https://github.com/jhipster/prettier-java) - Plugin to support Java files with Prettier
- [Java Prettier formatter](https://github.com/mwpb/java-prettier-formatter) - A small Visual Studio Code extension which shamelessly inspired this one.