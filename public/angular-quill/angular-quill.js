(function () {
    'use strict';

    /**
     * usage: <div ng-model="article.body" quill="{
      theme: 'mytheme'
    }"></div>
     *
     *    extra options:
     *      quill: pass as a string
     *
     */

    var scripts = document.getElementsByTagName("script"),
        currentScriptPath = scripts[scripts.length - 1].src;

    angular.module('angular-quill', [])
        .directive("quill", ['$timeout', function ($timeout) {
            return {
                restrict: 'A',
                require: "ngModel",
                replace: true,

                scope: {
                    annotationZoneAction: '&',
                    hideAnnZoneButton: '='
                },

                templateUrl: function (elem, attrs) {
                    var tmplt = currentScriptPath.replace('.js', '.html');
                    if (attrs['type']) {
                        tmplt = tmplt.replace('.html', '-' + attrs['type'] + '.html');
                    }

                    return tmplt;
                },

                link: function (scope, element, attrs, ngModel) {
                    var inputId = '';
                    if (attrs.id) inputId = '#' + attrs.id;

                    var updateModel = function updateModel(value) {
                        scope.$apply(function () {
                            ngModel.$setViewValue(value);
                        });
                    };

                    var options = {
                        modules: {
                            'toolbar': {container: inputId + ' .toolbar'},
                            'image-tooltip': true,
                            'link-tooltip': true
                        },
                        theme: 'snow'
                    };

                    scope.extraOptions = attrs.quill ?
                        scope.$eval(attrs.quill) : {};

                    angular.extend(options, scope.extraOptions);

                    $timeout(function () {

                        scope.editor = new Quill(element.children()[1], options);
                        scope.editor.quillId = inputId;

                        $(inputId + ' .editor').click(function () {
                            var isToolTipOpened = false;
                            $(this).find('.ql-tooltip').each(function () {
                                var toolTipPos = $(this).position();
                                if (typeof(toolTipPos.left) != 'undefined' && toolTipPos.left >= 0) {
                                    isToolTipOpened = true;
                                    return;
                                }
                            });

                            if (isToolTipOpened)
                                return;

                            if (scope.editor.getLength() > 0) {
                                var range = scope.editor.getSelection();
                                if (!range) {
                                    scope.editor.setSelection(scope.editor.getLength() - 1, scope.editor.getLength());
                                }
                            }
                            else {
                                scope.editor.focus();
                            }
                        });

                        ngModel.$render();

                        scope.editor.on('text-change', function (delta, source) {
                            updateModel(scope.editor.getHTML());
                        });

                        scope.editor.once('selection-change', function (hasFocus) {
                            var editId = scope.editor.id;
                            $('#' + editId).toggleClass('focus', hasFocus);
                            // Hack for inability to scroll on mobile
                            if (/mobile/i.test(navigator.userAgent)) {
                                $(scope.editor).css('height', scope.editor.root.scrollHeight + 30);   // 30 for padding
                            }
                        });

                    });

                    ngModel.$render = function () {
                        if (angular.isDefined(scope.editor)) {
                            $timeout(function () {
                                scope.editor.setHTML(ngModel.$viewValue || '');
                            });
                        }
                    };

                }
            };
        }]);
})();
