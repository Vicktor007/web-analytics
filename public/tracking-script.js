(function() {
    ("use strict")
    var location = window.location
    var document = window.document
    var scriptElement = document.currentScript
    var dataDomain = scriptElement.getAttribute("data-domain")

    let queryString = location.search;
    const params = new URLSearchParams(queryString);
    var source = params.get("utm");

    var endpoint = `${process.env.NEXT_PUBLIC_URL}/api/track`

    function generateSessionId() {
        return "session-" + Math.random().toString(36).substring(2,9)
    }

    function initializeSession(){
        var sessionId = localStorage.getItem("session_id")
        var expirationTimeStamp =localStorage.getItem("session_expiration_timstamp")
        if(!sessionId || !expirationTimeStamp){
            sessionId = generateSessionId()
            // st the expiration timestamp

            expirationTimeStamp = Date.now() + 10 * 60 * 1000 //10 minutes
            localStorage.setItem("sesion_id", sessionId)
            localStorage.setItem("session_expiration_timestamp", expirationTimeStamp)
        }

        return {
            sessionId: sessionId,
            expirationTimeStamp: parseInt(expirationTimeStamp),
        };
    }
    // function to check if the session is expired

    function isSessionExpired(expirationTimeStamp){
        return Date.now() >= expirationTimeStamp;
    }

    function checkSessionStatus(){
        var session = initializeSession();
        if(isSessionExpired(session.expirationTimeStamp)){
            localStorage.removeItem("session_id");
            localStorage.removeItem("session_expiration_timestamp");
            
                  // if visitor landed on the website after expiration we need to create new session in order to count it as a new visit.
            initializeSession();
        }
    }
      // Call checkSessionStatus() when the user lands on the website
    checkSessionStatus();

    // Function to send tracking events to the endpoint
    function trigger(eventName, options){
        var payload = {
            event: eventName,
            url: location.href,
            domain: dataDomain,
            source
        };

        sendRequest(payload, options);
    }

    // Function to send HTTP requests
   function sendRequest(payload, options){
    var request = new XMLHttpRequest();
    request.open("POST", endpoint, true);
    request.setRequestHeader("Content-Type", "application/json");

    request.onreadystatechange = function (){
        if(request.readyState === 4) {
            options && options.callback && options.callback();
        }
    };

    request.send(JSON.stringify(payload));
   }

//    Queue of tracking events
var queue = (window.your_tracking && window.your_tracking.q) || [];
window.your_tracking = trigger;
for(var i = 0; i < queue.length; i++){
    trigger.apply(this, queue[i]);
}

function tracKPageView(){
    // Trigger a custom event indicating page view
    trigger("pageview");
}

function trackSessionStart(){
    // Trigger a custom event indicating page view
    trigger("session_start");
}

function trackessionEnd(){
    trigger("session_end");
}

// Track page view when the script is loaded
tracKPageView();

var initialPathname = window.location.pathname

// Event listener for popstate (back/forward navigation)
window.addEventListener("popstate", tracKPageView);

// Event listener for hashchange (hash-based naviagtion)
window.addEventListener("hashchange", tracKPageView);
document.addEventListener("click", function(event) {
    setTimeout(() =>  {
        if (window.location.pathname !== initialPathname){
            tracKPageView();
            // update the initialPathname for future comparisons
            initialPathname = window.location.pathname;
        }
    }, 3000);
});
})();