(function () {
    'user strict';
    angular.module('TrippismUIApp').factory('BargainFinderMaxFactory', ['$http', '$rootScope', function BargainFinderMaxFactory($http, $rootScope) {
        var service = {
            Post: Post
        }

        function createSimpleObject(value) {
            var result = {};

            var buildResult = function (object, prefix) {
                for (var key in object) {
                    var postKey = isFinite(key)
                        ? (prefix != "" ? prefix : "") + "[" + key + "]"
                        : (prefix != "" ? prefix + "." : "") + key;

                    switch (typeof (object[key])) {
                        case "number": case "string": case "boolean":
                            result[postKey] = object[key];
                            break;

                        case "object":
                            if (object[key].toUTCString)
                                result[postKey] = object[key].toUTCString().replace("UTC", "GMT");
                            else {
                                buildResult(object[key], postKey != "" ? postKey : key);
                            }
                    }
                }
            };
            buildResult(value, "");
            return result;
        };

        function serialize(obj) {
            var str = [];
            for (var p in obj)
                if (obj.hasOwnProperty(p)) {
                    var propval = encodeURIComponent(obj[p]);
                    if (propval != "undefined" && propval != "null" && propval != '')
                        str.push(encodeURIComponent(p) + "=" + propval);
                }
            return str.join("&");
        }


        var config = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }

        function Post(data) {
            var url = $rootScope.baseURL + 'bargainfinder';
            return $http.post(url, serialize(createSimpleObject(data)), config).then(function (data) {
                return data;
            }, function (e) {
                return e;
            })
        }
        return service;
    }]);
})();
//{
//    "OTA_AirLowFareSearchRQ": {
//        "Target": "Production",
//		"POS": {
//		    "Source": [{
//		        "RequestorID": {
//		            "Type": "1",
//		            "ID": "1",
//		            "CompanyName": {

//		            }
//		        }
//		    }]
//		},
//		"OriginDestinationInformation": [{
//		    "RPH": "1",
//		    "DepartureDateTime": "2016-04-01T11:00:00",
//		    "OriginLocation": {
//		        "LocationCode": "DFW"
//		    },
//		    "DestinationLocation": {
//		        "LocationCode": "CDG"
//		    },
//		    "TPA_Extensions": {
//		        "SegmentType": {
//		            "Code": "O"
//		        }
//		    }
//		},
//		{
//		    "RPH": "2",
//		    "DepartureDateTime": "2016-04-15T11:00:00",
//		    "OriginLocation": {
//		        "LocationCode": "CDG"
//		    },
//		    "DestinationLocation": {
//		        "LocationCode": "DFW"
//		    },
//		    "TPA_Extensions": {
//		        "SegmentType": {
//		            "Code": "O"
//		        }
//		    }
//		}],
//		"TravelPreferences": {
//		    "ValidInterlineTicket": true,
//			"CabinPref": [{
//			    "Cabin": "Y",
//			    "PreferLevel": "Preferred"
//			}],
//			"TPA_Extensions": {
//			    "TripType": {
//			        "Value": "Return"
//			    },
//				"LongConnectTime": {
//				    "Min": 780,
//					"Max": 1200,
//					"Enable": true
//				},
//				"ExcludeCallDirectCarriers": {
//				    "Enabled": true
//				}
//			}
//		},
//		"TravelerInfoSummary": {
//		    "SeatsRequested": [1],
//			"AirTravelerAvail": [{
//			    "PassengerTypeQuantity": [{
//			        "Code": "ADT",
//			        "Quantity": 1
//			    }]
//			}]
//		},
//		"TPA_Extensions": {
//		    "IntelliSellTransaction": {
//		        "RequestType": {
//		            "Name": "50ITINS"
//		        }
//		    }
//		}
//    }
//}