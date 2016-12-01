(function () {
    'use strict';   

    //var hostName = 'http://' + window.location.host;
    //var profileHostname = 'http://profiles.trippism.com';

    var hostName = 'http://api.trippism.com';    
    var profileHostname = 'http://visitors.trippism.com';    

    if (angular.lowercase(window.location.host) == "localhost:9000") {
        //hostName = 'http://localhost:14606';
        //profileHostname = 'http://localhost:1161';
    }

    var constants = {
        //destinationImagePath: 'http://content.trippism.com/images/destinations/',
        //destinationSmallImagePath: 'http://content.trippism.com/images/destination-small/',
        //destinationMediumImagePath: 'http://content.trippism.com/images/destination-medium/',
        destinationImagePath: '../images/destination/',
        destinationSmallImagePath: '../images/destination-small/',
        destinationMediumImagePath: '../images/destination-medium/',
        viewsPath: '/views/',
        partialViewsPath: '/views/partials/',
        apiURL: hostName + '/api/Sabre/',
        apiURLForEmail: hostName + '/api/Email/SendEmailtoUser',
        apiURLForGoogleAttraction: hostName + '/api/googleplace/',
        apiURLForYouTube: hostName + '/api/youtube/',
        apiURLForWeather: hostName + '/api/weather/international/history',
        apiURLForUSWeather: hostName + '/api/weather/history',
        apiURLForGoogleGeoReverseLookup: hostName + '/api/googlegeocode/reverselookup/',
        apiURLForFeedback: hostName + '/api/Email/SendFeedback',
        apiURLForInstaFlightSearch: hostName + '/api/instaflight',
        apiURLForConstant: hostName + '/api/Constants/',
        apiURLForHotelRange: hostName + '/api/sabre/hotels',
        apiURLforProfileAnonymous: profileHostname + '/api/profiles/anonymous',
        apiURLforProfileActivity: profileHostname + '/api/profile/activity',
        apiURLforProfileAuthentication: profileHostname + '/api/profiles/authentication',
        apiURLforProfileAccount: profileHostname + '/api/profiles/account',
        apiURLForCurrencyConversion: hostName + '/api/CurrencyConversion/Convert',
	    apiURLForTripAdvisor: hostName + '/api/tripadvisor/'
       
    };
    angular.module('TrippismUIApp').constant('urlConstant', constants);
})();
