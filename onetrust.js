console.log('start of automation')
// Value received from server

async function automate() {
    const decook__userPreferences = document.getElementById('decook__userPreferences');
    const userPreferences = JSON.parse(decook__userPreferences.value)
    delete userPreferences.accept_all
    delete userPreferences.reject_all

    console.log(userPreferences)

    // dictonary 
    // This will evolve as we encounter more variations of cookeis banners
    // In future this will also support language translation
    const preference_dict = {
        functionality_cookies: ["functionality", "function", "necessary"],
        performance_cookies: ["performance", "personalization"],
        strictly_necessary_cookies: ["necessary", "important", "strict"],
        targeting_or_advertising_cookies: ["targeting", "advertising", "ads", "marketing", "analytics", "audience"]
    }

    // map to identify cookie types
    const cookieTypeMap = {
        functionality_cookies: "Functionality",
        performance_cookies: "Performance",
        strictly_necessary_cookies: "Strictly Necessary",
        targeting_or_advertising_cookies: "Targeting or Advertising",
    };

    // delay function
    // It will be useful after automating clicks. UI will take time to load after clicks.
    const delaySeconds = (t) => {
        console.log("====================DELAY========================");
        return new Promise(resolve => setTimeout(resolve, t * 1000));
    }

    // Selectors used 
    const COOKIE_DIALOG_SELECTOR = "div#onetrust-pc-sdk";
    const TOGGLE_PARENT_SELECTOR = ".ot-cat-item";
    const COOKIE_DIALOG_TRIGGER_BUTTON_SELECTOR = "button#onetrust-pc-btn-handler";
    const SAVE_BUTTON_SELECTOR = "button.save-preference-btn-handler";

    // 1. check if cookie settings is shown
    const cookieSettingElem = document.querySelector(COOKIE_DIALOG_SELECTOR);
    if (!cookieSettingElem) {
        document.querySelector(COOKIE_DIALOG_TRIGGER_BUTTON_SELECTOR).click();
        await delaySeconds(3);
    } else {
        cookieSettingElem.classList.remove("ot-hide")
        await delaySeconds(3);
    }
    // 2. Get list of cookie preferences available, with their current state and pointer to toggle button

    let cookiePreferenceElem = [...document.querySelectorAll(`${COOKIE_DIALOG_SELECTOR} ${TOGGLE_PARENT_SELECTOR}`)];
    if (cookiePreferenceElem.length == 0) {
        cookiePreferenceElem = [...document.querySelectorAll(`${COOKIE_DIALOG_SELECTOR} .ot-desc-cntr`)];
    }

    let browserCookiePreferences = cookiePreferenceElem.map(elem => {
        let groupId = elem.getAttribute("data-optanongroupid");
        if (!groupId)
            groupId = elem.getAttribute("id").replace("ot-group-id-", "");
        
        const toggleElem = elem.querySelector("span.ot-switch-nob");
        const inputField = elem.querySelector(`input#ot-group-id-${groupId}`);
        let state = false;
        if (inputField)
            if(inputField.checked)
                state = true;
            else if(inputField.getAttribute("aria-checked") == "true")
                state = true;
        return {
            title: elem.querySelector("span.ot-label-txt") ? elem.querySelector("span.ot-label-txt").innerText.trim().toLowerCase() : elem.innerText.trim().toLowerCase(),
            toggleElem,
            state,
            automated: false
        }
    })
    browserCookiePreferences = browserCookiePreferences.filter(pref => pref.toggleElem !== null);

    // 3. Compare browser perferences with the ones obtained from server
    for (const prefName in userPreferences) {
        const options = preference_dict[prefName];
        for (let i = 0; i < browserCookiePreferences.length; i++) {

            // 3.1 Match found
            // Change state, if necessary, using toggle button
            if (options.find(opt => browserCookiePreferences[i].title.includes(opt))) {
                console.log("MATCH!", prefName, browserCookiePreferences[i]);
                if (browserCookiePreferences[i].state !== userPreferences[prefName]) {
                    browserCookiePreferences[i].toggleElem.click();
                    browserCookiePreferences[i].automated = true;
                }
            }

            // 3.2 Match not found
            else {
                console.log("No match", options, browserCookiePreferences[i].title);
            }
        }
    }


    // 4. Finally, click save
    const saveButton = document.querySelector(SAVE_BUTTON_SELECTOR);
    if (saveButton) saveButton.click();
}


automate()
