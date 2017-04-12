# Contributing to SockBot

The following are our current guidelines, adapted from [Angular](https://github.com/angular/angular/blob/d92930e975afd20cb4e59c4d392a58edafeef9eb/CONTRIBUTING.md). If you see anything you dislike, let us know; we're always open to suggestions, and we're actively trying to improve our contributor process to make SockDrawer more welcoming to newcomers.

We'd love for you to contribute to our source code and to make SockBot even better than it is
today! Here are the guidelines we'd like you to follow:

 - [Code of Conduct](#coc)
 - [Question or Problem?](#question)
 - [Issues and Bugs](#issue)
 - [Feature Requests](#feature)
 - [Submission Guidelines](#submit)
 - [Coding Rules](#rules)
 - [Commit Message Guidelines](#commit)

## <a name="coc"></a> Code of Conduct
Help us keep SockBot open and inclusive. Please read and follow our [Code of Conduct][coc].

## <a name="question"></a> Got a Question or Problem?

If you have questions about how to use SockBot, please open an issue on our [GitHub Repository][github].
You can also contact us via email at [developers@sockdrawer.io](mailto:developers@sockdrawer.io).

## <a name="issue"></a> Found an Issue?
If you find a bug in the source code or a mistake in the documentation, you can help us by
submitting an issue to our [GitHub Repository][github]. Even better, you can submit a Pull Request
with a fix.

**Please see the Submission Guidelines below**.

## <a name="feature"></a> Want a Feature?
You can request a new feature by submitting an issue to our [GitHub Repository][github].  If you
would like to implement a new feature then consider what kind of change it is:

* **Major Changes** that you wish to contribute to the project should be discussed first by creating a
feature request issue on our [GitHub Repository][github] so that we can better coordinate our efforts,
prevent duplication of work, and help you to craft the change so that it is successfully accepted into
the project.
* **Small Changes** can be crafted and submitted to the [GitHub Repository][github] as a Pull Request.


## <a name="docs"></a> Want a Doc Fix?
If you want to help improve the docs, it's a good idea to let others know what you're working on to
minimize duplication of effort. Before starting, check out the issue queue for
[Tag: Documentation](https://github.com/SockDrawer/SockBot/issues?q=is%3Aissue+is%3Aopen+label%3Adocumentation).
Comment on an issue to let others know what you're working on, or create a new issue if your work
doesn't fit within the scope of any of the existing doc fix projects.

For large fixes, please build and test the documentation before submitting the PR to be sure you haven't
accidentally introduced any layout or formatting issues. You should also make sure that your commit message
is labeled "docs:" and follows the **Git Commit Guidelines** outlined below.

## <a name="submit"></a> Submission Guidelines

### Submitting an Issue
Before you submit your issue search the archive, maybe your question was already answered.

If your issue appears to be a bug, and hasn't been reported, open a new issue.
Help us to maximize the effort we can spend fixing issues and adding new
features, by not reporting duplicate issues.  Providing the following information will increase the
chances of your issue being dealt with quickly:

* **Overview of the Issue** - if an error is being thrown a non-minified stack trace helps
* **Motivation for or Use Case** - explain why this is a bug for you
* **SockBot Version(s)** - is it a regression?
* **Reproduce the Error** - provide a live example or an unambiguous set of steps.
* **Related Issues** - has a similar issue been reported before?
* **Suggest a Fix** - if you can't fix the bug yourself, perhaps you can point to what might be
  causing the problem (line of code or commit)

**If you get help, help others. Good karma rulez!**

### Submitting a Pull Request
Before you submit your pull request consider the following guidelines:

* Search [GitHub](https://github.com/SockDrawer/SockBot/pulls) for an open or closed Pull Request
  that relates to your submission. You don't want to duplicate effort.
* Make sure you have initialized your repository clone with all the needed dependencies and configuration for
  local development:
     ```shell
     npm install && npm run init
     ```
* Make your changes in a new git branch:

     ```shell
     git checkout -b my-fix-branch master
     ```

* Create your patch, **including appropriate test cases**.
* Follow our [Coding Rules](#rules).
* Run the full SockBot test suite and ensure that all tests pass.
* Commit your changes using a descriptive commit message that follows our
  [commit message conventions](#commit-message-format). Adherence to the
  [commit message conventions](#commit-message-format) is required because release notes are
  automatically generated from these messages.

     ```shell
     git commit -a
     ```
  Note: the optional commit `-a` command line option will automatically "add" and "rm" edited files.

* Build your changes locally to ensure all the tests pass:

    ```shell
    npm test
    ```

* Push your branch to GitHub:

    ```shell
    git push origin my-fix-branch
    ```

* In GitHub, send a pull request to `SockBot:master`.
* If we suggest changes then:
  * Make the required updates.
  * Re-run the SockBot test suite to ensure tests are still passing.
  * Commit your changes to your branch (e.g. `my-fix-branch`).
  * Push the changes to your GitHub repository (this will update your Pull Request).

If the PR gets too outdated we may ask you to rebase and force push to update the PR:

    ```shell
    git rebase master -i
    git push origin my-fix-branch -f
    ```

*WARNING. Squashing or reverting commits and forced push thereafter may remove GitHub comments
on code that were previously made by you and others in your commits.*

That's it! Thank you for your contribution!

#### After your pull request is merged

After your pull request is merged, you can safely delete your branch and pull the changes
from the main (upstream) repository:

* Delete the remote branch on GitHub either through the GitHub web UI or your local shell as follows:

    ```shell
    git push origin --delete my-fix-branch
    ```

* Check out the master branch:

    ```shell
    git checkout master -f
    ```

* Delete the local branch:

    ```shell
    git branch -D my-fix-branch
    ```

* Update your master with the latest upstream version:

    ```shell
    git pull --ff upstream master
    ```

## <a name="rules"></a> Coding Rules
To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes **must be tested** by one or more unit tests.
* All public API methods **must be documented** with jsdoc. To see how we document our APIs, please check
  out the existing [docs].
* All Code must conform to our eslint style rules without exceptions. If you feel a rule is being applied
  incorrectly please open an issue on our [GitHub Repository][github] so we may examine the implications
  of the rule and your proposed changes.

## <a name="commit"></a> Git Commit Guidelines

We have very precise rules over how our git commit messages can be formatted.  This leads to **more
readable messages** that are easy to follow when looking through the **project history**.  But also,
we use the git commit messages to **generate the SockBot change log**.

The commit message formatting can be added using a typical git workflow or through the use of a CLI wizard
([Commitizen](https://github.com/commitizen/cz-cli)). To use the wizard, run `npm run commit` in your terminal
after staging your changes in git.

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The **header** is mandatory and the **scope** of the header is optional. **body** and **footer** may be omitted
according to the guidelines below.

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on GitHub as well as in various git tools.

### Revert
If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted
commit. In the body it should say: `This reverts commit <hash>.`, where the hash is the SHA of the commit
being reverted.

### Type
Must be one of the following and is case insensitive:

* **feat**: A new feature, this may also be specified as `feature`
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **perf**: A code change that improves performance, this may also be specified as `performance`
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope
The scope could be anything specifying place of the commit change. For example `Build`,
`Commands`, `NodeBB.Posts`, `Summoner`, `Login`, etc...

While it is recommended to indicate the scope of the change this field may be omitted.

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

### Body (optional)
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes".
The body should include the motivation for the change and contrast this with previous behavior.

For quick fixes that require no additional comments **body** may be omitted.

### Footer (optional)
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

For commits that fix no issues nor introduce breaking changes **footer** may be omitted.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two newlines.
The rest of the commit message is then used for this.


[coc]: https://github.com/SockDrawer/SockBot/blob/master/CODE_OF_CONDUCT.md
[github]: https://github.com/SockDrawer/SockBot
[docs]: https://sockbot.readthedocs.io/en/latest/
