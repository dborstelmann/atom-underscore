Grammar = require(atom.config.resourcePath + '/node_modules/first-mate/lib/grammar.js');
_ = require('../node_modules/underscore/underscore-min.js'),
loophole = require('../node_modules/loophole/lib/loophole.js');

module.exports = {
    config: {
        evaluate: {
            title: 'Custom Template Settings',
            description: 'Evaluate Regex &mdash; See [Underscore Template Settings](http://underscorejs.org/#template)',
            type: 'string',
            default: "/<%([\\s\\S]+?)%>/g",
            order: 1
        },
        interpolate: {
            title: ' ',
            description: 'Interpolate Regex',
            type: 'string',
            default: "/<%=([\\s\\S]+?)%>/g",
            order: 2
        },
        escape: {
            title: ' ',
            description: 'Escape Regex',
            type: 'string',
            default: "/<%-([\\s\\S]+?)%>/g",
            order: 3
        },
    },
    activate: function (state) {
        var _this = this;

        _this.evaluateSetting = atom.config.get('atom-underscore.evaluate');
        _this.interpolateSetting = atom.config.get('atom-underscore.interpolate');
        _this.escapeSetting = atom.config.get('atom-underscore.escape');

        atom.config.observe('atom-underscore.evaluate', function (val) {
            _this.evaluateSetting = val;
            _this.updateGrammar();
        });
        atom.config.observe('atom-underscore.interpolate', function (val) {
            _this.interpolateSetting = val;
            _this.updateGrammar();
        });
        atom.config.observe('atom-underscore.escape', function (val) {
            _this.escapeSetting = val;
            _this.updateGrammar();
        });

        atom.commands.add('atom-text-editor', 'atom-underscore:check-template', function (e) {
            _this.checkTemplate(e);
        });

    },
    updateGrammar: function () {
        var _this = this;

        var regexChecker = /\((?!\?).+?\)/;

        _.templateSettings = {
            evaluate: new RegExp(_this.evaluateSetting.substring(1, _this.evaluateSetting.length - 2), 'g'),
            interpolate: new RegExp(_this.interpolateSetting.substring(1, _this.interpolateSetting.length - 2), 'g'),
            escape: new RegExp(_this.escapeSetting.substring(1, _this.escapeSetting.length - 2), 'g')
        };

        var evaluateMatch = regexChecker.exec(_this.evaluateSetting),
            evaluateBeginIndex = evaluateMatch.index,
            evaluateEndIndex = evaluateMatch.index + evaluateMatch[0].length,
            evaluateBegin = _this.evaluateSetting.substring(1, evaluateBeginIndex),
            evaluateEnd = _this.evaluateSetting.substring(evaluateEndIndex, _this.evaluateSetting.length - 2);

        var interpolateMatch = regexChecker.exec(_this.interpolateSetting),
            interpolateBeginIndex = interpolateMatch.index,
            interpolateEndIndex = interpolateMatch.index + interpolateMatch[0].length,
            interpolateBegin = _this.interpolateSetting.substring(1, interpolateBeginIndex),
            interpolateEnd = _this.interpolateSetting.substring(interpolateEndIndex, _this.interpolateSetting.length - 2);

        var escapeMatch = regexChecker.exec(_this.escapeSetting),
            escapeBeginIndex = escapeMatch.index,
            escapeEndIndex = escapeMatch.index + escapeMatch[0].length,
            escapeBegin = _this.escapeSetting.substring(1, escapeBeginIndex),
            escapeEnd = _this.escapeSetting.substring(escapeEndIndex, _this.escapeSetting.length - 2);

        var grammarJSON = {
            fileTypes: [
                'html'
            ],
            name: 'HTML (Underscore)',
            scopeName: 'text.html.underscore',
            patterns: [
                {
                    match: '(' + interpolateBegin + ')((.|\\r|\\n)*?)(' + interpolateEnd + ')',
                    captures: {
                        1: {
                            name: 'tag.template.underscore.boundary'
                        },
                        2: {
                            patterns: [
                                {
                                    include: 'source.js'
                                }
                            ]

                        },
                        4: {
                            name: 'tag.template.underscore.boundary'
                        }
                    }
                },
                {
                    match: '(' + escapeBegin + ')((.|\\r|\\n)*?)(' + escapeEnd + ')',
                    captures: {
                        1: {
                            name: 'tag.template.underscore.boundary'
                        },
                        2: {
                            patterns: [
                                {
                                    include: 'source.js'
                                }
                            ]

                        },
                        4: {
                            name: 'tag.template.underscore.boundary'
                        }
                    }
                },
                {
                    match: '(' + evaluateBegin + ')((.|\\r|\\n)*?)(' + evaluateEnd + ')',
                    captures: {
                        1: {
                            name: 'tag.template.underscore.boundary'
                        },
                        2: {
                            patterns: [
                                {
                                    include: 'source.js'
                                }
                            ]

                        },
                        4: {
                            name: 'tag.template.underscore.boundary'
                        }
                    }
                },
                {
                    include: 'text.html.basic'
                },
            ],
        };

        var underscoreGrammar = new Grammar(atom.grammars, grammarJSON);
        atom.grammars.grammars = _.reject(atom.grammars.grammars, function (g) {
            return g.name === 'HTML (Underscore)';
        });
        atom.grammars.addGrammar(underscoreGrammar);
        _.each(atom.workspace.getTextEditors(), function (editor) {
            if (editor.getGrammar().scopeName  ===  'text.html.underscore') {
                editor.setGrammar(_.findWhere(atom.grammars.grammars, {name: 'HTML (Underscore)'}));
                var atomVersion = parseFloat(atom.getVersion());
                if (atomVersion < 1.11) {
                    editor.reloadGrammar();
                } else {
                    atom.textEditors.maintainGrammar(editor);
                }
            }
        });
    },
    checkTemplate: function (e) {
        var editor = atom.workspace.getActiveTextEditor();
        if (editor.getGrammar().scopeName  ===  'text.html.underscore') {
            try {
                loophole.allowUnsafeNewFunction(function() {
                    return _.template(editor.getText());
                });
                atom.notifications.addSuccess('Your Underscore template is valid!');
            } catch(error) {
                if (error.toString().substring(0, 30) === 'SyntaxError: Unexpected token ') {
                    var errorLineNumber = _.findIndex(editor.getText().split(/\r\n|\r|\n/), function (line) {
                        return line.indexOf(error.toString().substring(30)) > -1;
                    }) + 1;
                    if (errorLineNumber === 1) {
                        atom.notifications.addWarning('Your Underscore template has errors.');
                    } else {
                        if (error.toString().substring(30) !== '<' && error.toString().substring(30) !== '>') {
                            atom.notifications.addWarning('Your Underscore template has an error at line ' + errorLineNumber);
                        } else {
                            atom.notifications.addWarning('Your Underscore template has errors.');
                        }
                    }
                } else {
                    atom.notifications.addWarning('Your Underscore template has errors.');
                }
            }
        } else {
            atom.notifications.addInfo('Current file is not an underscore template.');
        }
    }
};
