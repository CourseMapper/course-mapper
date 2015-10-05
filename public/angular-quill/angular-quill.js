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

                templateUrl:
                    function(elem,attrs){
                        var tmplt = currentScriptPath.replace('.js', '.html');
                        if(attrs['type']){
                          tmplt = tmplt.replace('.html', '-' + attrs['type'] + '.html');
                        }

                        return tmplt;
                    },

                controller: function () {

                },

                link: function (scope, element, attrs, ngModel) {
                    var inputId = '';
                    if(attrs.id) inputId = '#' + attrs.id;

                    var updateModel = function updateModel(value) {
                        scope.$apply(function () {
                            ngModel.$setViewValue(value);
                        });
                    };

                    var options = {
                        modules: {
                            'toolbar': {container: inputId + ' .toolbar'},
                            'image-tooltip': false,
                            'link-tooltip': false
                        },
                        theme: 'snow'
                    };

                    scope.extraOptions = attrs.quill ?
                        scope.$eval(attrs.quill) : {};

                    angular.extend(options, scope.extraOptions);

                    $timeout(function () {

                        scope.editor = new Quill(element.children()[1], options);
                        scope.editor.quillId = inputId;

                        $(inputId + ' .editor').click(function(){
                            for(var i = 0; i < Quill.editors.length; i++){
                                if(Quill.editors[i].quillId == inputId){
                                    var edtr = Quill.editors[i];
                                    if(edtr.getLength() > 0){
                                        edtr.setSelection(edtr.getLength() - 1, edtr.getLength() );
                                    }
                                    else
                                        edtr.focus();
                                }
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

