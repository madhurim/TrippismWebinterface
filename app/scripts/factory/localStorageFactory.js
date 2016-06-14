(function () {
    'use strict';
    angular.module('TrippismUIApp').factory('LocalStorageFactory', ['$filter', LocalStorageFactory]);
    function LocalStorageFactory($filter) {
        return {
            save: save,
            get: get,
            remove: remove,
            clear: clear
        };

        function save(storageName, data, where) {
            var obj = localStorage.getItem(storageName);
            if (obj) {
                obj = JSON.parse(obj);
                var item = $filter('filter')(obj, where, true)[0];
                if (item)
                    obj[obj.indexOf(item)] = data;
                else
                    obj.push(data);
            }
            else
                obj = [data];
            localStorage.setItem(storageName, JSON.stringify(obj));
        }

        function get(storageName, data) {
            var obj = localStorage.getItem(storageName);
            if (obj) {
                obj = JSON.parse(obj);
                var item = $filter('filter')(obj, data, true)[0];
                if (item)
                    return item;
            }
            return undefined;
        }

        function remove(storageName, data) {
            var obj = localStorage.getItem(storageName);
            if (obj) {
                obj = JSON.parse(obj);
                var item = $filter('filter')(obj, data, true)[0];
                if (item) {
                    obj.splice(obj.indexOf(item), 1);
                    localStorage.setItem(storageName, JSON.stringify(obj));
                }
            }
        }

        function clear(storageName) {
            localStorage.clear(storageName);
        }
    }
})();