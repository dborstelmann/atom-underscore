### Underscore template syntax highlighter and syntax validator with custom delimiters for the [Atom](https://atom.io/) text editor.

[https://atom.io/packages/atom-underscore](https://atom.io/packages/atom-underscore)

##### _Any contributions are greatly appreciated.  If you want me to add snippets, please make a [New Issue](https://github.com/dborstelmann/atom-underscore/issues/new) or email me. Thanks!_

#### Installation

```
apm install atom-underscore
```

#### Please visit the package settings page or your config.cson file to change the delimiters that you use in your underscore templates.
- Always use valid regular expressions that follow the style in [Underscore's Template Settings](http://underscorejs.org/#template).  _(I prefer Mustache style as you can see in the screenshot below.)_

#### Delimiter colors are up to you
- Just add a style in your Atom stylesheet that overwrites `.tag.template.underscore.boundary`.

#### Validate your template at any time
- Right-click in the editor pane and click on **Validate Underscore Template**
- Find the **Atom Underscore** package in the **Packages** menu
- Shift-Cmd-U at any time

![Package](https://s26.postimg.org/rnvxirrk9/package.png)
![Settings](https://s26.postimg.org/iep5uwtah/settings.png)

## Author Note

Released by [Dan Borstelmann](https://github.com/dborstelmann) on November 6, 2016.
