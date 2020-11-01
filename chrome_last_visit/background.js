chrome.omnibox.onInputChanged.addListener(
    function(text, suggest) {
        var microsecondsForThirtyDays = 1000 * 60 * 60 * 24 * 30;
        var thirtyDaysAgo = (new Date).getTime() - microsecondsForThirtyDays;
        console.log('Started');
        chrome.history.search({
            'text': text,
            'startTime': thirtyDaysAgo,
            'maxResults': 100
            },
            function(historyItems) {
                var suggestions = [];
                historyItems.sort(compareByVisitCount);
                for (var i = 0; i < Math.min(historyItems.length, 5); ++i) {
                    console.log(historyItems[i].url);
                    suggestions.push({
                        content: historyItems[i].url, 
                        description: 
                            historyItems[i].title 
                            + ' - <url>'
                            + historyItems[i].url
                            + '</url> <dim>Last visited:' 
                            + getTimeSince(historyItems[i].lastVisitTime)
                            + '</dim>'
                        } );
                }
                console.log('Text: ' + text);
                console.log('Suggestions: ' + suggestions);
                if (suggestions.length >= 1) {
                    chrome.omnibox.setDefaultSuggestion(
                        {'description':suggestions[0].description}
                    );
                }
                suggestions.shift();
                suggest(suggestions);
            }
        );
    }
);

function compareByVisitCount(a, b) {
    if (a.visitCount < b.visitCount) {
        return 1;
    }
    if (a.visitCount > b.visitCount) {
        return -1;
    }
    return 0;
}

function getTimeSince(time) {
    var diff = (new Date).getTime() - time;
    oneMinute = 1000 * 60
    oneHour = oneMinute * 60
    oneDay = oneHour * 24
    if (diff <= oneMinute) {
        // Less than 1 minute
        return 'Moments ago';
    }
    var day = Math.floor(diff / oneDay)
    if (day) {
        var day_part = day.toString() + ' days '
    } else {
        var day_part = ''
    }
    diff = diff % oneDay
    var hour = Math.floor(diff / oneHour)
    if (hour) {
        var hour_part = hour.toString() + ' hrs '
    } else {
        var hour_part = ''
    }
    diff = diff % oneHour
    var minute = Math.floor(diff / oneMinute)
    if (minute) {
        var minute_part = minute.toString() + ' mins '
    } else {
        var minute_part = ''
    }
    return day_part + hour_part + minute_part + 'ago'
}

chrome.omnibox.onInputEntered.addListener(
    function(text) {
        chrome.tabs.getSelected(null, function(tab){
            chrome.tabs.update(tab.id, {url: text});
        });
    }
);
