angular.module('bs.plupload', ['bs.plupload.directive', 'bs.plupload.filter', 'bs.plupload.tpls']);
angular.module('bs.plupload.tpls', ['template/my-plupload.html']);

angular.module('bs.plupload.directive', []).directive('myPlupload', ['$filter', function ($filter) {
    'use strict'

    return {
        replace: true,
        scope: {
            uploadUrl: '@',
            authentication: '=',
            uploadComplete: '=',
            uploadFiles: '=',
            runtime: '='
        },
        link: function (scope, elm, attrs) {
            // init value            
            scope.queueSize = 0;
            scope.totalPercent = 0;
            scope.files = {};
            scope.uploadComplete = false;

            scope.uploader = new plupload.Uploader({
                runtimes: 'html5,flash,silverlight,html4',
                browse_button: 'pickfiles',
                container: 'uploadcontainer',
                max_file_size: '1024mb', // single file and must be integer 
                url: scope.uploadUrl,
                flash_swf_url: '/Scripts/js/vendor/plupload.flash.swf',
                silverlight_xap_url: '/Scripts/js/vendor/plupload.silverlight.xap'
            });

            if (scope.authentication) {
                // set extra upload params if need authentication                
                //UserUsedLoader().then(function (data) {
                //    // assign user via promises
                //    scope.user = data.user;

                //    scope.queueleftSize = (scope.user.Quota * 1024 * 1024 - scope.user.UserUsed);

                //    // assign extra params if authentication is true
                //    scope.uploader.settings.multipart_params = {
                //        "userID": data.user.UserID,
                //        "folderName": null || ''
                //    };
                //})
            }

            scope.uploader.bind('Init', function (up, params) {
                scope.runtime = params.runtime || '您的電腦因為沒有安裝Flash, 可能會造成無法上傳檔案.';
                scope.$root.$safeApply();
            });

            scope.uploader.init();

            // bind file added 
            scope.uploader.bind('FilesAdded', function (up, files) {
                scope.uploadComplete = false;
                scope.queueSize = 0;
                scope.clearComplete();

                angular.forEach(files, function (f, index) {
                    scope.files[f.id] = f;

                    scope.queueSize += f.size;

                    if (scope.queueSize > scope.queueleftSize) {
                        scope.uploader.trigger('Error', {
                            error: 'over quota',
                            file: f
                        });
                    }
                });
                scope.$root.$safeApply();

                up.refresh();
            });

            // bind file upload progress
            scope.uploader.bind('UploadProgress', function (up, file) {
                scope.totalPercent = scope.uploader.total.percent;
                scope.$root.$safeApply();
            });

            // bind file upload complete
            scope.uploader.bind('UploadComplete', function (up, files) {
                scope.uploadFiles = 0;

                angular.forEach(files, function (f, index) {
                    if (f.status == 5)
                        scope.uploadFiles++;
                });

                // set up upload done message                
                scope.uploadComplete = true;
                // reload user quota                
                // rootscope 
                //if (scope.authentication) {
                //    scope.$root.refreshQuota();
                //}

                scope.$root.$safeApply();
            });

            // bind file upload error
            scope.uploader.bind('Error', function (up, obj) {

                scope.$apply(function () {
                    !scope.files && (scope.files = []);
                    //obj.file.error = obj.message;
                    obj.file.error = (obj.response) ? jQuery.parseJSON(obj.response).files[0].error : obj.error;
                    scope.files[obj.file.id] = obj.file;
                });

                up.refresh(); // Reposition Flash/Silverlight
            });

            scope.clearComplete = function () {
                var completeFiles = $filter('filter')(scope.files, { percent: 100 });
                angular.forEach(completeFiles, function (file, index) {
                    scope.uploader.removeFile(file);
                    file.status = plupload.DONE;
                    file.cancelled = true;
                    file.percent = 0;
                    delete scope.files[file.id];
                });
            };

            // cancel all progress
            scope.cancellAll = function () {
                scope.uploader.stop();
                scope.totalPercent = 0;
                scope.uploadComplete = false;
                angular.forEach(scope.files, function (file, index) {
                    scope.uploader.removeFile(file);
                    file.status = plupload.DONE;
                    file.cancelled = true;
                    file.percent = 0;
                    delete scope.files[file.id];
                });
            };

            //cancel specific progress
            scope.cancel = function (id) {
                scope.uploader.stop();
                scope.uploadComplete = false;
                var file = scope.files[id];
                scope.uploader.removeFile(file);
                delete scope.files[id];
            };

            scope.startUpload = function () {
                scope.uploader.start();
            };

            scope.totalSize = function () {
                var size = 0;
                angular.forEach(scope.files, function (f, index) {
                    size += f.size;
                });
                return size;
            };

        },
        templateUrl: 'template/my-plupload.html'
    };
}]);

angular.module('bs.plupload.filter', [])
    .filter('Glyphicons', function () {
        var mp = {
            'application/pdf': 'file',
            'image': 'picture',
            'application/x-zip-compressed': 'compressed',
            'application/octetstream': 'compressed',
            'audio': 'music',
            'video': 'film',
            'folder': 'folder-close'
        };
        return function (mime) {
            if (angular.isUndefined(mime))
                return 'file';

            if (mp.hasOwnProperty(mime)) {
                return mp[mime];
            } else {
                if (mime.startsWith('image'))
                    return mp['image'];
                if (mime.startsWith('audio'))
                    return mp['audio'];
                if (mime.startsWith('video'))
                    return mp['video'];
                if (mime.endsWith('directory'))
                    return mp['folder'];
                return 'file';
            }
        };
    })
    .filter('fileUploadSize', function () {
        return function (input) {
            var mb = input / (1024 * 1024);
            if (mb < 1.0) {
                return (input / 1024).toFixed(2) + " KB";
            } else {
                return mb.toFixed(2) + " MB";
            }
        };
    })
    .filter('fileNameSnippet', function () {
        return function (fileName) {
            if (fileName) {
                return fileName.em_snippet(10).toString();
            }
        };
    });

angular.module('template/my-plupload.html', []).run(['$templateCache', function ($templateCache) {
    $templateCache.put('template/my-plupload.html',

    '<div>\n' +
    '<table class="table table-hover table-striped">\n' +
    '	<thead ng-show="totalSize()">\n' +
    '		<tr>\n' +
    '			<th>檔名</th>\n' +
    '			<th>進度</th>\n' +
    '			<th>大小</th>\n' +
    '           <th></th>\n' +
    '		</tr>\n' +
    '	</thead>\n' +
    '	<tbody>\n' +
    '		<tr data-ng-repeat="(k,file) in files">\n' +
    '			<td><i class="glyphicon glyphicon-{{file.type | Glyphicons}}"></i> <span class="nametext" ng-bind="file.name | fileNameSnippet"></span></td>\n' +
    '			<td><span ng-if="!file.error">{{file.percent}}%</span><span class="label label-danger" ng-if="file.error">{{file.error}}</span></td>\n' +
    '			<td ng-bind="file.size | fileUploadSize"></td>\n' +
    '           <td>\n' +
    '               <i ng-hide="file.percent==100" class="glyphicon glyphicon-minus-sign text-danger" ng-click="cancel(file.id)"></i>\n' +
    '               <i ng-show="file.percent==100" class="glyphicon glyphicon-ok-sign text-success"></i>\n' +
    '           </td>\n' +
    '		</tr>\n' +
    '	</tbody>\n' +
    '	<tfoot>\n' +
    '		<tr>\n' +
    '		   <td class="row-actions" id="uploadcontainer">\n' +
    '			   <button id="pickfiles" type="button" class="btn btn-success btn-group">\n' +
    '			        <i class="glyphicon glyphicon-plus"></i>\n' +
    '				    <span>新增檔案</span>\n' +
    '			   </button>\n' +
    '			   <button id="uploadfiles" type="button" class="btn btn-primary start btn-group" ng-show="totalSize()" ng-click="startUpload()">\n' +
    '				   <i class="glyphicon glyphicon-cloud-upload"></i>\n' +
    '				   <span>開始上傳</span>\n' +
    '			   </button>\n' +
    '              <button type="button" class="btn btn-warning cancel btn-group" ng-show="totalSize()" data-ng-click="cancellAll()">\n' +
    '                    <i class="glyphicon glyphicon-ban-circle"></i>\n' +
    '                    <span>清除檔案</span>\n' +
    '              </button>\n' +
    '		   </td>\n' +
    '		   <td><span ng-show="totalSize()">{{totalPercent}}%</span></td>\n' +
    '		   <td><span ng-bind="totalSize() | fileUploadSize" ng-show="totalSize()"></span></td>\n' +
    '          <td></td>\n' +
    '		</tr>\n' +
    '	</tfoot>\n' +
    '</table>\n' +
    '</div>'

    );
}]);
